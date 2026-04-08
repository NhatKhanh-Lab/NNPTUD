import Swal from 'sweetalert2';

const baseConfig = {
  confirmButtonColor: '#ea580c',
  cancelButtonColor: '#78716c',
  reverseButtons: true,
  heightAuto: false,
};

export async function confirmDelete(itemLabel = 'dữ liệu') {
  const result = await Swal.fire({
    ...baseConfig,
    icon: 'warning',
    title: 'Xác nhận xóa',
    text: `Bạn có chắc muốn xóa ${itemLabel} không?`,
    showCancelButton: true,
    confirmButtonText: 'Xóa',
    cancelButtonText: 'Hủy',
  });

  return result.isConfirmed;
}

export async function confirmSubmit(title = 'Xác nhận lưu', text = 'Bạn muốn lưu thay đổi này chứ?') {
  const result = await Swal.fire({
    ...baseConfig,
    icon: 'question',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: 'Xác nhận',
    cancelButtonText: 'Hủy',
  });

  return result.isConfirmed;
}

export async function confirmLogout() {
  const result = await Swal.fire({
    ...baseConfig,
    icon: 'question',
    title: 'Đăng xuất',
    text: 'Bạn muốn đăng xuất khỏi hệ thống?',
    showCancelButton: true,
    confirmButtonText: 'Đăng xuất',
    cancelButtonText: 'Ở lại',
  });

  return result.isConfirmed;
}

export function showSuccess(title: string, text?: string) {
  return Swal.fire({
    ...baseConfig,
    icon: 'success',
    title,
    text,
    timer: 1800,
    showConfirmButton: false,
  });
}

export function showError(title: string, text?: string) {
  return Swal.fire({
    ...baseConfig,
    icon: 'error',
    title,
    text,
    confirmButtonText: 'Đóng',
  });
}

export function showNewOrderAlert(orderCode?: string, message?: string) {
  return Swal.fire({
    ...baseConfig,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 4500,
    timerProgressBar: true,
    background: '#fff7ed',
    html: `
      <div style="display:flex;align-items:center;gap:14px;min-width:280px">
        <div style="font-size:38px;line-height:1">🍗</div>
        <div style="text-align:left">
          <div style="font-weight:800;color:#9a3412;margin-bottom:4px">Đơn mới nóng hổi tới rồi!</div>
          <div style="font-size:13px;color:#7c2d12">${orderCode ? `Mã đơn: ${orderCode}` : 'Có khách vừa chốt món mới'}</div>
          <div style="font-size:12px;color:#9a3412;margin-top:4px">${message || 'Bếp chuẩn bị lên đơn thôi nào.'}</div>
        </div>
      </div>
    `,
  });
}
