const Payment = require("../models/Payment");

const createPayment = async (payload, session = null) => {
  if (session) {
    const records = await Payment.create([payload], { session });
    return records[0];
  }

  return Payment.create(payload);
};

const findPaymentByOrderId = (orderId, session = null) => {
  const query = Payment.findOne({ order: orderId });
  return session ? query.session(session) : query;
};

const findPaymentByIdWithOrder = (paymentId, session = null) => {
  const query = Payment.findById(paymentId).populate({
    path: "order",
    populate: {
      path: "user",
      select: "fullName email"
    }
  });
  return session ? query.session(session) : query;
};

const findAllPayments = () =>
  Payment.find()
    .populate({
      path: "order",
      populate: {
        path: "user",
        select: "fullName email"
      }
    })
    .sort({ createdAt: -1 });

const deletePaymentById = (id) => Payment.findByIdAndDelete(id);

module.exports = {
  createPayment,
  findPaymentByOrderId,
  findPaymentByIdWithOrder,
  findAllPayments,
  deletePaymentById
};
