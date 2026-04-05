const { z } = require("zod");
const { PAYMENT_STATUSES } = require("../domain/paymentDomain");

const updatePaymentStatusSchema = z.object({
  status: z.enum(
    [
      PAYMENT_STATUSES.PENDING,
      PAYMENT_STATUSES.PAID,
      PAYMENT_STATUSES.FAILED,
      PAYMENT_STATUSES.REFUNDED
    ],
    { errorMap: () => ({ message: "Trang thai thanh toan khong hop le" }) }
  )
});

module.exports = {
  updatePaymentStatusSchema
};
