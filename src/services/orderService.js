const ApiError = require("../utils/ApiError");
const { ORDER_STATUS_LABELS, canTransitionOrderStatus } = require("../domain/orderDomain");
const orderRepository = require("../repositories/orderRepository");
const paymentRepository = require("../repositories/paymentRepository");
const cartRepository = require("../repositories/cartRepository");
const productRepository = require("../repositories/productRepository");
const roleRepository = require("../repositories/roleRepository");
const userRepository = require("../repositories/userRepository");
const { runTransactional } = require("./transactionService");
const notificationService = require("./notificationService");
const paymentService = require("./paymentService");

const generateOrderCode = () => `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
const isDuplicateKeyError = (error) => error?.code === 11000;

const createOrderSnapshotRollback = async ({
  cart,
  cartItems,
  createdOrderId,
  createdOrderItemIds,
  createdPaymentId,
  decrementedItems,
  cartCleared
}) => {
  if (cartCleared) {
    await cartRepository.restoreCartSnapshot(cart, cartItems);
  }

  if (createdPaymentId) {
    await paymentRepository.deletePaymentById(createdPaymentId);
  }

  await orderRepository.deleteOrderItemsByIds(createdOrderItemIds);

  if (createdOrderId) {
    await orderRepository.deleteOrderById(createdOrderId);
  }

  for (const item of decrementedItems) {
    await productRepository.incrementStock(item.productId, item.quantity);
  }
};

const executeCreateOrderFlow = async ({ user, input, idempotencyKey, session }) => {
  const createdOrderItemIds = [];
  const decrementedItems = [];
  let createdOrderId = null;
  let createdPaymentId = null;
  let cartCleared = false;
  let cart = null;
  let cartItems = [];

  try {
    cart = await cartRepository.findCartByUser(user._id, session);
    if (!cart) {
      throw new ApiError(400, "Khong tim thay gio hang");
    }

    cartItems = await cartRepository.findCartItemsWithProducts(cart._id, session);
    if (!cartItems.length) {
      throw new ApiError(400, "Gio hang cua ban dang trong");
    }

    for (const item of cartItems) {
      if (!item.product || item.product.stock < item.quantity) {
        throw new ApiError(400, `Mon ${item.product?.name || ""} khong du so luong trong kho`);
      }
    }

    const order = await orderRepository.createOrder(
      {
        user: user._id,
        code: generateOrderCode(),
        shippingAddress: input.shippingAddress,
        note: input.note || "",
        totalAmount: cart.totalAmount,
        status: "pending",
        idempotencyKey: idempotencyKey || undefined
      },
      session
    );
    createdOrderId = order._id;

    const createdOrderItems = await orderRepository.createOrderItems(
      cartItems.map((item) => ({
        order: order._id,
        product: item.product._id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal
      })),
      session
    );
    createdOrderItemIds.push(...createdOrderItems.map((item) => item._id));

    const payment = await paymentRepository.createPayment(
      {
        order: order._id,
        method: input.paymentMethod,
        amount: cart.totalAmount,
        status: "pending",
        paidAt: null
      },
      session
    );
    createdPaymentId = payment._id;

    for (const item of cartItems) {
      const updatedProduct = await productRepository.decrementStock(item.product._id, item.quantity, session);
      if (!updatedProduct) {
        throw new ApiError(400, `Mon ${item.product.name} khong du so luong trong kho`);
      }

      decrementedItems.push({
        productId: item.product._id,
        quantity: item.quantity
      });
    }

    await cartRepository.clearCart(cart._id, session);
    cartCleared = true;

    const roles = await roleRepository.findRolesByNames(["admin", "staff"], session);
    const receivers = await userRepository.findUsersByRoleIds(
      roles.map((role) => role._id),
      session
    );

    return {
      orderId: order._id,
      notificationEvents: [
        ...receivers.map((receiver) =>
          notificationService.buildNotificationEvent({
            userId: receiver._id,
            title: "Don hang moi",
            message: `Co don hang moi ${order.code}`,
            type: "order"
          })
        ),
        notificationService.buildNotificationEvent({
          userId: user._id,
          title: "Dat hang thanh cong",
          message: `Don hang ${order.code} da duoc tao thanh cong`,
          type: "order"
        })
      ]
    };
  } catch (error) {
    if (!session) {
      await createOrderSnapshotRollback({
        cart,
        cartItems,
        createdOrderId,
        createdOrderItemIds,
        createdPaymentId,
        decrementedItems,
        cartCleared
      });
    }

    throw error;
  }
};

const createOrderFromCart = async ({ user, input, idempotencyKey }) => {
  if (idempotencyKey) {
    const existingOrder = await orderRepository.findOrderByUserAndIdempotencyKey(user._id, idempotencyKey);
    if (existingOrder) {
      return {
        order: existingOrder,
        transactionMode: "idempotent-replay",
        reused: true
      };
    }
  }

  let transactionResult;

  try {
    transactionResult = await runTransactional((session) =>
      executeCreateOrderFlow({
        user,
        input,
        idempotencyKey,
        session
      })
    );
  } catch (error) {
    if (idempotencyKey && isDuplicateKeyError(error)) {
      const existingOrder = await orderRepository.findOrderByUserAndIdempotencyKey(user._id, idempotencyKey);
      if (existingOrder) {
        return {
          order: existingOrder,
          transactionMode: "idempotent-replay",
          reused: true
        };
      }
    }

    throw error;
  }

  const { result, transactionMode } = transactionResult;
  const order = await orderRepository.findOrderByIdWithUser(result.orderId);
  await notificationService.dispatchNotifications(result.notificationEvents);

  return {
    order,
    transactionMode,
    reused: false
  };
};

const getOrders = ({ user }) => orderRepository.findVisibleOrders(user);

const getOrderById = async ({ user, orderId }) => {
  const details = await orderRepository.loadOrderDetails(orderId);
  if (!details.order) {
    throw new ApiError(404, "Khong tim thay don hang");
  }

  if (!["admin", "staff"].includes(user.role.name) && String(details.order.user._id) !== String(user._id)) {
    throw new ApiError(403, "Ban khong co quyen xem don hang nay");
  }

  const payment = await paymentRepository.findPaymentByOrderId(orderId);

  return {
    order: details.order,
    items: details.items,
    payment
  };
};

const updateOrderStatus = async ({ orderId, status }) => {
  const { result } = await runTransactional(async (session) => {
    const order = await orderRepository.findOrderById(orderId, session);
    if (!order) {
      throw new ApiError(404, "Khong tim thay don hang");
    }

    if (order.status === status) {
      throw new ApiError(400, "Don hang dang o trang thai nay");
    }

    if (!canTransitionOrderStatus(order.status, status)) {
      throw new ApiError(
        400,
        `Khong the chuyen don hang tu trang thai ${ORDER_STATUS_LABELS[order.status] || order.status} sang ${ORDER_STATUS_LABELS[status] || status}`
      );
    }

    const payment = await paymentRepository.findPaymentByOrderId(order._id, session);
    if (!payment) {
      throw new ApiError(400, "Khong tim thay thong tin thanh toan cua don hang nay");
    }

    paymentService.ensureOrderCanAdvance({ payment, nextOrderStatus: status });

    if (status === "cancelled") {
      const { items } = await orderRepository.loadOrderDetails(order._id, session);
      for (const item of items) {
        await productRepository.incrementStock(item.product._id, item.quantity, session);
      }
    }

    await paymentService.applyOrderStatusSideEffects({
      payment,
      nextOrderStatus: status,
      session
    });

    order.status = status;
    await order.save(session ? { session } : {});

    return {
      orderId: order._id,
      notificationEvents: [
        notificationService.buildNotificationEvent({
          userId: order.user,
          title: "Cap nhat don hang",
          message: `Don hang ${order.code} da chuyen sang trang thai ${ORDER_STATUS_LABELS[order.status] || order.status}`,
          type: "order"
        })
      ]
    };
  });

  const updatedOrder = await orderRepository.findOrderByIdWithUser(result.orderId);
  await notificationService.dispatchNotifications(result.notificationEvents);

  return updatedOrder;
};

module.exports = {
  createOrderFromCart,
  getOrders,
  getOrderById,
  updateOrderStatus
};
