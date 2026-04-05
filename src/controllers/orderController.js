const orderService = require("../services/orderService");

exports.createOrderFromCart = async (req, res) => {
  const result = await orderService.createOrderFromCart({
    user: req.user,
    input: req.validatedBody,
    idempotencyKey: req.headers["idempotency-key"]
  });

  res.status(201).json({
    success: true,
    message: result.reused ? "Yeu cau dat hang da duoc xu ly truoc do" : "Tao don hang thanh cong",
    data: result.order,
    meta: {
      transactionMode: result.transactionMode,
      reused: result.reused
    }
  });
};

exports.getOrders = async (req, res) => {
  const orders = await orderService.getOrders({ user: req.user });
  res.json({ success: true, data: orders });
};

exports.getOrderById = async (req, res) => {
  const details = await orderService.getOrderById({
    user: req.user,
    orderId: req.params.id
  });

  res.json({ success: true, data: details });
};

exports.updateOrderStatus = async (req, res) => {
  const order = await orderService.updateOrderStatus({
    actor: req.user,
    orderId: req.params.id,
    status: req.validatedBody.status
  });

  res.json({ success: true, data: order });
};
