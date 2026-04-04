const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");

const createOrder = async (payload, session = null) => {
  if (session) {
    const records = await Order.create([payload], { session });
    return records[0];
  }

  return Order.create(payload);
};

const createOrderItems = (items, session = null) => OrderItem.insertMany(items, session ? { session } : {});

const findVisibleOrders = (user, session = null) => {
  const filter = ["admin", "staff"].includes(user.role.name) ? {} : { user: user._id };
  const query = Order.find(filter).populate("user", "fullName email").sort({ createdAt: -1 });
  return session ? query.session(session) : query;
};

const findOrderById = (id, session = null) => {
  const query = Order.findById(id);
  return session ? query.session(session) : query;
};

const findOrderByIdWithUser = (id, session = null) => {
  const query = Order.findById(id).populate("user", "fullName email");
  return session ? query.session(session) : query;
};

const findOrderByUserAndIdempotencyKey = (userId, idempotencyKey) =>
  Order.findOne({ user: userId, idempotencyKey }).populate("user", "fullName email");

const loadOrderDetails = async (orderId, session = null) => {
  const order = await findOrderByIdWithUser(orderId, session);
  const itemsQuery = OrderItem.find({ order: orderId }).populate("product", "name image");
  const items = session ? await itemsQuery.session(session) : await itemsQuery;

  return {
    order,
    items
  };
};

const deleteOrderById = (id) => Order.findByIdAndDelete(id);

const deleteOrderItemsByIds = (ids) => {
  if (!ids.length) {
    return Promise.resolve();
  }

  return OrderItem.deleteMany({ _id: { $in: ids } });
};

module.exports = {
  createOrder,
  createOrderItems,
  findVisibleOrders,
  findOrderById,
  findOrderByIdWithUser,
  findOrderByUserAndIdempotencyKey,
  loadOrderDetails,
  deleteOrderById,
  deleteOrderItemsByIds
};
