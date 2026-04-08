import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import { fetchOrderDetail, formatCurrency, formatDate } from '../lib/api';
import { getOrderStatusLabel, getPaymentMethodLabel, getPaymentStatusLabel } from '../lib/display';
import type { Order, Payment, Product } from '../types';

interface DetailPayload {
  order: Order & { note?: string };
  items: Array<{ _id: string; quantity: number; subtotal: number; product?: Product }>;
  payment?: Payment | null;
}

export default function OrderDetailPage() {
  const { id = '' } = useParams();
  const [detail, setDetail] = useState<DetailPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDetail = async () => {
      if (!id) {
        setError('Khong tim thay ma don hang');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetchOrderDetail(id);
        setDetail(response.data);
        setError('');
      } catch (err) {
        setDetail(null);
        setError(err instanceof Error ? err.message : 'Khong the tai chi tiet don hang');
      } finally {
        setLoading(false);
      }
    };

    void loadDetail();
  }, [id]);

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navbar />
      <main className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1.35fr_0.85fr]">
        {loading ? (
          <div className="rounded-[28px] bg-surface-container-lowest p-8 text-on-surface-variant shadow-xl lg:col-span-2">
            Dang tai chi tiet don hang...
          </div>
        ) : error ? (
          <div className="rounded-[28px] bg-red-50 px-4 py-3 text-red-700 lg:col-span-2">
            {error}
          </div>
        ) : !detail ? (
          <div className="rounded-[28px] bg-surface-container-lowest p-8 text-on-surface-variant shadow-xl lg:col-span-2">
            Khong co du lieu don hang.
          </div>
        ) : (
          <>
            <section className="rounded-[28px] bg-surface-container-lowest p-8 shadow-xl">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                    {detail.order.code}
                  </p>
                  <h1 className="mt-2 text-4xl font-black">Chi tiet don hang</h1>
                  <p className="mt-2 text-on-surface-variant">
                    Theo doi thong tin giao hang, thanh toan va cac mon da dat.
                  </p>
                </div>
                <div className="rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-orange-800">
                  {getOrderStatusLabel(detail.order.status)}
                </div>
              </div>

              {!detail.items.length ? (
                <div className="rounded-3xl border border-dashed border-outline p-6 text-on-surface-variant">
                  Don hang nay chua co mon nao.
                </div>
              ) : (
                <div className="space-y-4">
                  {detail.items.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between gap-4 rounded-3xl border border-orange-100 bg-white p-5"
                    >
                      <div className="min-w-0">
                        <strong className="block truncate text-lg">
                          {item.product?.name || 'San pham da xoa'}
                        </strong>
                        <p className="mt-1 text-sm text-on-surface-variant">So luong: {item.quantity}</p>
                      </div>
                      <strong className="shrink-0 text-lg text-primary">{formatCurrency(item.subtotal)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <aside className="space-y-5">
              <section className="rounded-[28px] bg-surface-container-lowest p-8 shadow-xl">
                <h2 className="mb-5 text-2xl font-black">Thong tin don hang</h2>
                <div className="grid gap-3 text-sm">
                  <InfoRow label="Trang thai don" value={getOrderStatusLabel(detail.order.status)} />
                  <InfoRow label="Tong tien" value={formatCurrency(detail.order.totalAmount)} />
                  <InfoRow label="Thanh toan" value={getPaymentStatusLabel(detail.payment?.status)} />
                  <InfoRow label="Phuong thuc" value={getPaymentMethodLabel(detail.payment?.method)} />
                  <InfoRow label="Ngay tao" value={formatDate(detail.order.createdAt)} />
                  <InfoRow label="Ghi chu" value={detail.order.note?.trim() || '-'} multiline />
                </div>
              </section>

              <section className="rounded-[28px] bg-surface-container-lowest p-8 shadow-xl">
                <h2 className="mb-5 text-2xl font-black">Khach hang dat</h2>
                <div className="grid gap-3 text-sm">
                  <InfoRow label="Ho ten" value={detail.order.user?.fullName || '-'} />
                  <InfoRow label="Email" value={detail.order.user?.email || '-'} />
                  <InfoRow label="Dia chi giao" value={detail.order.shippingAddress || '-'} multiline />
                </div>
              </section>

              <section className="rounded-[28px] bg-surface-container-lowest p-8 shadow-xl">
                <h2 className="mb-5 text-2xl font-black">Dieu huong nhanh</h2>
                <div className="flex flex-col gap-3">
                  <Link
                    to="/orders"
                    className="rounded-2xl bg-primary px-6 py-4 text-center font-bold text-on-primary transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/20"
                  >
                    Quay lai danh sach don
                  </Link>
                  <Link
                    to="/cart"
                    className="rounded-2xl bg-surface-container-high px-6 py-4 text-center font-bold transition-all hover:bg-surface-container-highest"
                  >
                    Mo lai gio mon
                  </Link>
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
    <div
      className={`grid gap-2 rounded-2xl bg-surface-container p-4 ${
        multiline ? 'grid-cols-1' : 'grid-cols-[120px_minmax(0,1fr)] items-start'
      }`}
    >
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">{label}</span>
      <strong className={`text-on-surface ${multiline ? 'leading-6' : ''}`}>{value}</strong>
    </div>
  );
}
