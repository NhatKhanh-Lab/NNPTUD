export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Xác nhận',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Hủy',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ thanh toán',
  paid: 'Thanh toán xong',
  failed: 'Thanh toán lỗi',
  refunded: 'Hoàn tiền',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Tiền mặt khi nhận hàng',
  banking: 'Chuyển khoản ngân hàng',
  momo: 'Ví MoMo',
};

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Quản trị viên',
  staff: 'Nhân viên',
  customer: 'Khách hàng',
};

export function getOrderStatusLabel(status?: string | null) {
  return status ? ORDER_STATUS_LABELS[status] || status : '-';
}

export function getPaymentStatusLabel(status?: string | null) {
  return status ? PAYMENT_STATUS_LABELS[status] || status : '-';
}

export function getPaymentMethodLabel(method?: string | null) {
  return method ? PAYMENT_METHOD_LABELS[method] || method : '-';
}

export function getRoleLabel(role?: string | null) {
  return role ? ROLE_LABELS[role] || role : '-';
}
