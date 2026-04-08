import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import { deleteCartItem, fetchCart, formatCurrency, updateCartItem } from '../lib/api';
import type { CartItem, CartResponse } from '../types';
import { useAuth } from '../App';
import { confirmDelete, showError, showSuccess } from '../lib/swal';

export default function CartPage() {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyItemId, setBusyItemId] = useState('');
  const navigate = useNavigate();
  const { notify, refreshCartState } = useAuth();

  const loadCart = async () => {
    setLoading(true);
    try {
      const response = await fetchCart();
      setCart(response.data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCart();
  }, []);

  const items = cart?.items || [];
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  const changeQty = async (item: CartItem, quantity: number) => {
    if (quantity < 1 || busyItemId) return;

    setBusyItemId(item._id);
    try {
      await updateCartItem(item._id, { quantity });
      notify('Cập nhật số lượng thành công', 'success');
      await Promise.all([loadCart(), refreshCartState()]);
    } catch (err) {
      await showError('Không thể cập nhật', err instanceof Error ? err.message : undefined);
    } finally {
      setBusyItemId('');
    }
  };

  const remove = async (id: string, name?: string) => {
    if (busyItemId) return;

    const confirmed = await confirmDelete(name || 'món này');
    if (!confirmed) return;

    setBusyItemId(id);
    try {
      await deleteCartItem(id);
      notify('Đã xóa món khỏi giỏ', 'info');
      await showSuccess('Đã xóa món');
      await Promise.all([loadCart(), refreshCartState()]);
    } catch (err) {
      await showError('Xóa món thất bại', err instanceof Error ? err.message : undefined);
    } finally {
      setBusyItemId('');
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navbar />
      <main className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1.6fr_0.8fr]">
        <section className="rounded-[28px] bg-surface-container-lowest p-8 shadow-xl">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black">Giỏ món của bạn</h1>
              <p className="mt-2 text-on-surface-variant">
                Kiểm tra lại số lượng và tổng tiền trước khi chuyển sang bước đặt hàng.
              </p>
            </div>
            <Link
              to="/products"
              className="rounded-2xl bg-surface-container-high px-5 py-3 font-bold transition-all hover:bg-surface-container-highest"
            >
              Chọn thêm món
            </Link>
          </div>

          {error ? <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-red-700">{error}</div> : null}

          {loading ? (
            <div className="rounded-3xl border border-dashed border-outline p-8 text-on-surface-variant">
              Đang tải giỏ hàng...
            </div>
          ) : !items.length ? (
            <div className="rounded-3xl border border-dashed border-outline p-8 text-center text-on-surface-variant">
              <p>Chưa có món nào trong giỏ.</p>
              <Link to="/products" className="mt-3 inline-flex font-bold text-primary">
                Xem thực đơn ngay
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {items.map((item) => {
                const isBusy = busyItemId === item._id;

                return (
                  <div
                    key={item._id}
                    className="flex flex-col justify-between gap-4 border-b border-surface-variant pb-5 md:flex-row md:items-center"
                  >
                    <div>
                      <h3 className="text-xl font-bold">{item.product?.name || 'Món đã chọn'}</h3>
                      <p className="text-on-surface-variant">{formatCurrency(item.unitPrice)} mỗi phần</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        disabled={isBusy || item.quantity <= 1}
                        onClick={() => void changeQty(item, item.quantity - 1)}
                        className="h-10 w-10 cursor-pointer rounded-full bg-surface-container-high font-bold transition-all hover:bg-surface-container-highest disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        -
                      </button>
                      <strong className="min-w-8 text-center">{item.quantity}</strong>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => void changeQty(item, item.quantity + 1)}
                        className="h-10 w-10 cursor-pointer rounded-full bg-surface-container-high font-bold transition-all hover:bg-surface-container-highest disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        +
                      </button>
                      <span className="min-w-32 text-right font-bold">{formatCurrency(item.subtotal)}</span>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => void remove(item._id, item.product?.name)}
                        className="cursor-pointer font-semibold text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isBusy ? 'Đang xử lý...' : 'Xóa'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <aside className="h-fit rounded-[28px] bg-surface-container-lowest p-8 shadow-xl">
          <h2 className="mb-4 text-2xl font-black">Tóm tắt</h2>
          <div className="space-y-3 rounded-3xl bg-surface-container-low p-5">
            <div className="flex justify-between text-on-surface-variant">
              <span>Số món trong giỏ</span>
              <strong>{totalQuantity}</strong>
            </div>
            <div className="flex justify-between text-lg">
              <span>Tổng tiền</span>
              <strong className="text-primary">{formatCurrency(cart?.cart.totalAmount || 0)}</strong>
            </div>
          </div>

          <button
            type="button"
            disabled={loading || !items.length || Boolean(busyItemId)}
            onClick={() => navigate('/orders?create=1')}
            className="mt-6 w-full cursor-pointer rounded-2xl bg-primary px-6 py-4 font-bold text-on-primary transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Tiến hành đặt món
          </button>
        </aside>
      </main>
      <MobileNav />
    </div>
  );
}
