const paymentService = require("../services/paymentService");

exports.getPayments = async (req, res) => {
  const payments = await paymentService.getPayments();
  res.json({ success: true, data: payments });
};

exports.updatePaymentStatus = async (req, res) => {
  const payment = await paymentService.updatePaymentStatus({
    paymentId: req.params.id,
    status: req.validatedBody.status
  });

  res.json({ success: true, data: payment });
};
