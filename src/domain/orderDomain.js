const ORDER_STATUSES = Object.freeze({
  PENDING: "pending",
  CONFIRMED: "confirmed",
  SHIPPING: "shipping",
  COMPLETED: "completed",
  CANCELLED: "cancelled"
});

const ORDER_TRANSITIONS = Object.freeze({
  [ORDER_STATUSES.PENDING]: [ORDER_STATUSES.CONFIRMED, ORDER_STATUSES.CANCELLED],
  [ORDER_STATUSES.CONFIRMED]: [ORDER_STATUSES.SHIPPING, ORDER_STATUSES.CANCELLED],
  [ORDER_STATUSES.SHIPPING]: [ORDER_STATUSES.COMPLETED],
  [ORDER_STATUSES.COMPLETED]: [],
  [ORDER_STATUSES.CANCELLED]: []
});

const ORDER_STATUS_LABELS = Object.freeze({
  [ORDER_STATUSES.PENDING]: "dang cho xac nhan",
  [ORDER_STATUSES.CONFIRMED]: "da xac nhan",
  [ORDER_STATUSES.SHIPPING]: "dang giao",
  [ORDER_STATUSES.COMPLETED]: "hoan thanh",
  [ORDER_STATUSES.CANCELLED]: "da huy"
});

const canTransitionOrderStatus = (currentStatus, nextStatus) =>
  (ORDER_TRANSITIONS[currentStatus] || []).includes(nextStatus);

module.exports = {
  ORDER_STATUSES,
  ORDER_TRANSITIONS,
  ORDER_STATUS_LABELS,
  canTransitionOrderStatus
};
