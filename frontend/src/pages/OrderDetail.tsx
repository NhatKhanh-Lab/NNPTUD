import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import { fetchOrderDetail, formatCurrency, formatDate } from '../lib/api';
import { getOrderStatusLabel, getPaymentMethodLabel, getPaymentStatusLabel } from '../lib/display';
import type { Order, Payment, Product } from '../types';

interface DetailPayload {
  order: Order;
  items: Array<{ _id: string; quantity: number; subtotal: number; product?: Product }>;
  payment: Payment;
}

export default function OrderDetailPage() {
  const { id = '' } = useParams();
  const [detail, setDetail] = useState<DetailPayload | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrderDetail(id)
      .then((res) => setDetail(res.data))
      .catch((err) => setError(err.message));
  }, [id]);

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navbar />
      <main className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1.35fr_0.85fr]">
        {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-red-700">{error}</div> : null}
        {!detail ? (
          <div className="text-on-surface-variant">Đang tải chi tiết đơn hàng...</div>
        ) : (
          <>
            <section className="rounded-[28px] bg-surface-container-lowest p-8 shadow-xl">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{detail.order.code}</p>
                  <h1 className="mt-2 text-4xl font-black">Chi tiết đơn hàng</h1>
                </div>
                <div className="rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-orange-800">
                  {getOrderStatusLabel(detail.order.status)}
                </div>
              </div>

              <div className="space-y-4">
                {detail.items.map((item) => (
                  <div key={item._id} className="flex items-center justify-between gap-4 rounded-3xl border border-orange-100 bg-white p-5">
                    <div className="min-w-0">
                      <strong className="block truncate text-lg">{item.product?.name || 'Sản phẩm đã xóa'}</strong>
                      <p className="mt-1 text-sm text-on-surface-variant">Số lượng: {item.quantity}</p>
                    </div>
                    <strong className="shrink-0 text-lg text-primary">{formatCurrency(item.subtotal)}</strong>
                  </div>
                ))}
              </div>
            </section>

            <aside className="space-y-5">
              <section className="rounded-[28px] bg-surface-container-lowest p-8 shadow-xl">
                <h2 className="mb-5 text-2xl font-black">Thông tin đơn hàng</h2>
                <div className="grid gap-3 text-sm">
                  <InfoRow label="Trạng thái đơn" value={getOrderStatusLabel(detail.order.status)} />
                  <InfoRow label="Tổng tiền" value={formatCurrency(detail.order.totalAmount)} />
                  <InfoRow label="Thanh toán" value={getPaymentStatusLabel(detail.payment?.status)} />
                  <InfoRow label="Phương thức" value={getPaymentMethodLabel(detail.payment?.method)} />
                  <InfoRow label="Ngày tạo" value={formatDate(detail.order.createdAt)} />
                </div>
              </section>

              <section className="rounded-[28px] bg-surface-container-lowest p-8 shadow-xl">
                <h2 className="mb-5 text-2xl font-black">Khách hàng đặt</h2>
                <div className="grid gap-3 text-sm">
                  <InfoRow label="Họ tên" value={detail.order.user?.fullName || '-'} />
                  <InfoRow label="Email" value={detail.order.user?.email || '-'} />
                  <InfoRow label="Địa chỉ giao hàng" value={detail.order.shippingAddress || '-'} multiline />
                </div>
              </section>
            </aside>
          </>
        )}
      </main>
      <MobileNav />
    </div>
  );
}

function InfoRow({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className={`grid gap-2 rounded-2xl bg-surface-container p-4 ${multiline ? 'grid-cols-1' : 'grid-cols-[120px_minmax(0,1fr)] items-start'}`}>
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">{label}</span>
      <strong className={`text-on-surface ${multiline ? 'leading-6' : ''}`}>{value}</strong>
    </div>
  );
}
