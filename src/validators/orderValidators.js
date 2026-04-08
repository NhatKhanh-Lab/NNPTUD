const { z } = require("zod");
const { ORDER_STATUSES } = require("../domain/orderDomain");
const { PAYMENT_METHODS } = require("../domain/paymentDomain");

const createOrderSchema = z.object({
  shippingAddress: z.string().trim().min(5, "Dia chi giao hang phai co it nhat 5 ky tu").max(255, "Dia chi giao hang qua dai"),
  note: z.string().trim().max(500, "Ghi chu khong duoc vuot qua 500 ky tu").optional().or(z.literal("")),
  paymentMethod: z.enum([PAYMENT_METHODS.CASH, PAYMENT_METHODS.BANKING, PAYMENT_METHODS.MOMO], {
    errorMap: () => ({ message: "Phuong thuc thanh toan khong hop le" })
  })
});

const updateOrderStatusSchema = z.object({
  status: z.enum(
    [
      ORDER_STATUSES.PENDING,
      ORDER_STATUSES.CONFIRMED,
      ORDER_STATUSES.SHIPPING,
      ORDER_STATUSES.COMPLETED,
      ORDER_STATUSES.CANCELLED
    ],
    { errorMap: () => ({ message: "Trang thai don hang khong hop le" }) }
  )
});

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema
};
