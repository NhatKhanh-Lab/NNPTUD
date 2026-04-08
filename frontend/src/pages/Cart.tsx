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
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { notify } = useAuth();

  const loadCart = async () => {
    try {
      const response = await fetchCart();
      setCart(response.data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải giỏ hàng');
    }
  };

  useEffect(() => {
    void loadCart();
  }, []);

  const items = cart?.items || [];

  const changeQty = async (item: CartItem, quantity: number) => {
    if (quantity < 1) return;
    try {
      await updateCartItem(item._id, { quantity });
      notify('Cập nhật số lượng thành công', 'success');
      await loadCart();
    } catch (err) {
      await showError('Không thể cập nhật', err instanceof Error ? err.message : undefined);
    }
  };

  const remove = async (id: string, name?: string) => {
    const confirmed = await confirmDelete(name || 'món này');
    if (!confirmed) return;

    try {
      await deleteCartItem(id);
      notify('Đã xóa món khỏi giỏ', 'info');
      await showSuccess('Đã xóa món');
      await loadCart();
    } catch (err) {
      await showError('Xóa món thất bại', err instanceof Error ? err.message : undefined);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navbar />
      <main className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1.6fr_0.8fr]">
        <section className="rounded-[28px] bg-surface-container-lowest p-8 shadow-xl">
          <h1 className="mb-6 text-4xl font-black">Giỏ món của bạn</h1>
          {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-red-700">{error}</div> : null}
          {!items.length ? (
            <div className="rounded-3xl border border-dashed border-outline p-8 text-center text-on-surface-variant">
              Chưa có món nào trong giỏ. <Link to="/products" className="font-bold text-primary">Xem thực đơn ngay</Link>
            </div>
          ) : (
            <div className="space-y-5">
              {items.map((item) => (
                <div key={item._id} className="flex flex-col justify-between gap-4 border-b border-surface-variant pb-5 md:flex-row md:items-center">
                  <div>
                    <h3 className="text-xl font-bold">{item.product?.name}</h3>
                    <p className="text-on-surface-variant">{formatCurrency(item.unitPrice)} mỗi phần</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => void changeQty(item, item.quantity - 1)} className="h-10 w-10 cursor-pointer rounded-full bg-surface-container-high font-bold transition-all hover:bg-surface-container-highest">-</button>
                    <strong>{item.quantity}</strong>
                    <button onClick={() => void changeQty(item, item.quantity + 1)} className="h-10 w-10 cursor-pointer rounded-full bg-surface-container-high font-bold transition-all hover:bg-surface-container-highest">+</button>
                    <span className="min-w-32 text-right font-bold">{formatCurrency(item.subtotal)}</span>
                    <button onClick={() => void remove(item._id, item.product?.name)} className="cursor-pointer font-semibold text-red-600 hover:underline">Xóa</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        <aside className="h-fit rounded-[28px] bg-surface-container-lowest p-8 shadow-xl">
          <h2 className="mb-4 text-2xl font-black">Tóm tắt</h2>
          <div className="mb-4 flex justify-between"><span>Tổng tiền</span><strong>{formatCurrency(cart?.cart.totalAmount || 0)}</strong></div>
          <button disabled={!items.length} onClick={() => navigate('/orders?create=1')} className="w-full cursor-pointer rounded-2xl bg-primary px-6 py-4 font-bold text-on-primary transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/20 disabled:opacity-50">
            Tiến hành đặt món
          </button>
        </aside>
      </main>
      <MobileNav />
    </div>
  );
}
