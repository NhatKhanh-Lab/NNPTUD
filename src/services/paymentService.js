const ApiError = require("../utils/ApiError");
const {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_LABELS,
  canTransitionPaymentStatus
} = require("../domain/paymentDomain");
const paymentRepository = require("../repositories/paymentRepository");
const notificationService = require("./notificationService");

const ensurePaymentTransition = (payment, nextStatus) => {
  if (payment.status === nextStatus) {
    throw new ApiError(400, "Giao dich da o trang thai nay");
  }

  if (!canTransitionPaymentStatus(payment.status, nextStatus)) {
    throw new ApiError(
      400,
      `Khong the chuyen thanh toan tu trang thai ${PAYMENT_STATUS_LABELS[payment.status] || payment.status} sang ${PAYMENT_STATUS_LABELS[nextStatus] || nextStatus}`
    );
  }
};

const applyPaymentStatusChange = ({ payment, nextStatus }) => {
  ensurePaymentTransition(payment, nextStatus);

  payment.status = nextStatus;
  if (nextStatus === PAYMENT_STATUSES.PAID) {
    payment.paidAt = new Date();
  }

  if (nextStatus === PAYMENT_STATUSES.FAILED) {
    payment.paidAt = null;
  }

  return payment;
};

const applyOrderStatusSideEffects = async ({ payment, nextOrderStatus, session = null }) => {
  if (nextOrderStatus === "cancelled") {
    if (payment.status === PAYMENT_STATUSES.PAID) {
      payment.status = PAYMENT_STATUSES.REFUNDED;
    } else if (payment.status === PAYMENT_STATUSES.PENDING) {
      payment.status = PAYMENT_STATUSES.FAILED;
      payment.paidAt = null;
    }

    await payment.save(session ? { session } : {});
    return payment;
  }

  if (
    nextOrderStatus === "completed" &&
    payment.method === PAYMENT_METHODS.CASH &&
    payment.status === PAYMENT_STATUSES.PENDING
  ) {
    payment.status = PAYMENT_STATUSES.PAID;
    payment.paidAt = new Date();
    await payment.save(session ? { session } : {});
  }

  return payment;
};

const ensureOrderCanAdvance = ({ payment, nextOrderStatus }) => {
  if (
    ["shipping", "completed"].includes(nextOrderStatus) &&
    payment.method !== PAYMENT_METHODS.CASH &&
    payment.status !== PAYMENT_STATUSES.PAID
  ) {
    throw new ApiError(400, "Don thanh toan online phai duoc thanh toan truoc khi giao hoac hoan thanh");
  }
};

const getPayments = () => paymentRepository.findAllPayments();

const updatePaymentStatus = async ({ paymentId, status }) => {
  const payment = await paymentRepository.findPaymentByIdWithOrder(paymentId);
  if (!payment) {
    throw new ApiError(404, "Khong tim thay giao dich thanh toan");
  }

  applyPaymentStatusChange({ payment, nextStatus: status });
  await payment.save();

  await notificationService.dispatchNotifications([
    notificationService.buildNotificationEvent({
      userId: payment.order.user._id,
      title: "Cap nhat thanh toan",
      message: `Thanh toan cho don ${payment.order.code} da chuyen sang trang thai ${PAYMENT_STATUS_LABELS[payment.status] || payment.status}`,
      type: "payment"
    })
  ]);

  return payment;
};

module.exports = {
  getPayments,
  updatePaymentStatus,
  ensureOrderCanAdvance,
  applyOrderStatusSideEffects,
  applyPaymentStatusChange
};
