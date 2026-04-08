import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import { fetchNotifications, formatDate, markNotificationRead } from '../lib/api';
import type { Notification } from '../types';

const notificationStyles: Record<string, { icon: string; accent: string; soft: string; ring: string }> = {
  order: {
    icon: 'receipt_long',
    accent: 'text-orange-700',
    soft: 'bg-orange-100',
    ring: 'border-orange-200',
  },
  payment: {
    icon: 'payments',
    accent: 'text-emerald-700',
    soft: 'bg-emerald-100',
    ring: 'border-emerald-200',
  },
  system: {
    icon: 'campaign',
    accent: 'text-sky-700',
    soft: 'bg-sky-100',
    ring: 'border-sky-200',
  },
};

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const unreadCount = useMemo(() => items.filter((item) => !item.isRead).length, [items]);

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetchNotifications();
      setItems(response.data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="overflow-hidden rounded-[32px] border border-orange-100 bg-gradient-to-br from-white via-orange-50/45 to-white shadow-[0_18px_40px_rgba(156,63,0,0.08)]">
          <div className="border-b border-orange-100 px-8 py-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Notification Center</p>
                <h1 className="mt-3 text-4xl font-black">Thông báo</h1>
                <p className="mt-2 max-w-2xl text-base leading-7 text-on-surface-variant">
                  Theo dõi cập nhật đơn hàng, thanh toán và các thay đổi quan trọng ngay trên một giao diện gọn và dễ đọc hơn.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <StatChip label="Tổng thông báo" value={String(items.length)} />
                <StatChip label="Chưa đọc" value={String(unreadCount)} highlight />
              </div>
            </div>
          </div>

          <div className="px-8 py-8">
            {error ? <div className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-red-700">{error}</div> : null}
            {loading ? <div className="rounded-3xl border border-orange-100 bg-white p-6 text-on-surface-variant">Đang tải thông báo...</div> : null}

            {!loading && !items.length ? (
              <div className="rounded-[28px] border border-dashed border-orange-200 bg-white p-10 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-orange-100 text-orange-700">
                  <span className="material-symbols-outlined text-3xl">notifications</span>
                </div>
                <h2 className="mt-4 text-2xl font-black">Chưa có thông báo nào</h2>
                <p className="mt-2 text-on-surface-variant">Khi có cập nhật mới, danh sách sẽ xuất hiện ở đây.</p>
              </div>
            ) : null}

            {!loading && items.length ? (
              <div className="space-y-4">
                {items.map((item, index) => {
                  const style = notificationStyles[item.type] || {
                    icon: 'notifications',
                    accent: 'text-stone-700',
                    soft: 'bg-stone-100',
                    ring: 'border-stone-200',
                  };

                  return (
                    <article
                      key={item._id}
                      className={`grid gap-4 rounded-[28px] border bg-white p-5 shadow-[0_14px_34px_rgba(156,63,0,0.06)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(156,63,0,0.10)] lg:grid-cols-[auto_1fr_auto] ${item.isRead ? 'border-orange-100' : style.ring}`}
                    >
                      <div className={`grid h-14 w-14 place-items-center rounded-2xl ${style.soft} ${style.accent}`}>
                        <span className="material-symbols-outlined text-[28px]">{style.icon}</span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-lg font-black text-on-surface">{item.title}</h2>
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${style.soft} ${style.accent}`}>
                            {item.type || 'general'}
                          </span>
                          {!item.isRead ? <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-on-primary">Mới</span> : null}
                        </div>
                        <p className="mt-3 leading-7 text-on-surface-variant">{item.message}</p>
                        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-on-surface-variant">
                          <span className="rounded-full bg-orange-50 px-3 py-1">{formatDate(item.createdAt)}</span>
                          <span className="rounded-full bg-orange-50 px-3 py-1">{index === 0 ? 'Thông báo gần nhất' : 'Đã lưu trong lịch sử'}</span>
                        </div>
                      </div>

                      <div className="flex items-start justify-end">
                        {!item.isRead ? (
                          <button
                            onClick={async () => {
                              await markNotificationRead(item._id);
                              await load();
                            }}
                            className="cursor-pointer rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-on-primary transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20"
                          >
                            Đánh dấu đã đọc
                          </button>
                        ) : (
                          <div className="rounded-2xl bg-surface-container-high px-4 py-3 text-sm font-semibold text-on-surface-variant">
                            Đã xem
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : null}
          </div>
        </section>
      </main>
      <MobileNav />
    </div>
  );
}

function StatChip({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border px-5 py-4 ${highlight ? 'border-orange-200 bg-orange-100/80' : 'border-orange-100 bg-white'}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">{label}</p>
      <strong className="mt-1 block text-2xl font-black text-on-surface">{value}</strong>
    </div>
  );
}
