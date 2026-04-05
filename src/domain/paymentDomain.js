const PAYMENT_METHODS = Object.freeze({
  CASH: "cash",
  BANKING: "banking",
  MOMO: "momo"
});

const PAYMENT_STATUSES = Object.freeze({
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded"
});

const PAYMENT_TRANSITIONS = Object.freeze({
  [PAYMENT_STATUSES.PENDING]: [PAYMENT_STATUSES.PAID, PAYMENT_STATUSES.FAILED],
  [PAYMENT_STATUSES.PAID]: [PAYMENT_STATUSES.REFUNDED],
  [PAYMENT_STATUSES.FAILED]: [],
  [PAYMENT_STATUSES.REFUNDED]: []
});

const PAYMENT_STATUS_LABELS = Object.freeze({
  [PAYMENT_STATUSES.PENDING]: "cho thanh toan",
  [PAYMENT_STATUSES.PAID]: "da thanh toan",
  [PAYMENT_STATUSES.FAILED]: "thanh toan that bai",
  [PAYMENT_STATUSES.REFUNDED]: "da hoan tien"
});

const canTransitionPaymentStatus = (currentStatus, nextStatus) =>
  (PAYMENT_TRANSITIONS[currentStatus] || []).includes(nextStatus);

module.exports = {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  PAYMENT_TRANSITIONS,
  PAYMENT_STATUS_LABELS,
  canTransitionPaymentStatus
};
