import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import { createOrder, fetchCart, fetchOrders, formatCurrency, formatDate, imageUrl } from '../lib/api';
import { getOrderStatusLabel, getPaymentMethodLabel } from '../lib/display';
import { confirmSubmit, showError, showSuccess } from '../lib/swal';
import type { CartResponse, Order } from '../types';
import { useAuth } from '../App';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [cartState, setCartState] = useState<CartResponse | null>(null);
  const [error, setError] = useState('');
  const [cartError, setCartError] = useState('');
  const [creating, setCreating] = useState(false);
  const [loadingCart, setLoadingCart] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { notify, refreshCartState } = useAuth();
  const [checkoutForm, setCheckoutForm] = useState({
    shippingAddress: '123 Nguyễn Trãi, Quận 1, TP.HCM',
    note: '',
    paymentMethod: 'cash',
  });

  const createMode = searchParams.get('create') === '1';
  const cartItems = cartState?.items || [];

  const loadOrders = async () => {
    try {
      const response = await fetchOrders();
      setOrders(response.data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách đơn hàng');
    }
  };

  const loadCart = async () => {
    setLoadingCart(true);
    try {
      const response = await fetchCart();
      setCartState(response.data);
      setCartError('');
    } catch (err) {
      setCartState(null);
      setCartError(err instanceof Error ? err.message : 'Không thể tải giỏ món');
    } finally {
      setLoadingCart(false);
    }
  };

  useEffect(() => {
    void loadOrders();
  }, []);

  useEffect(() => {
    if (!createMode) return;
    void loadCart();
  }, [createMode]);

  const onCreate = async () => {
    if (!cartItems.length) {
      setCartError('Giỏ món đang trống. Hãy chọn món trước khi tạo đơn.');
      return;
    }

    const confirmed = await confirmSubmit('Xác nhận đặt món', 'Đơn hàng sẽ được tạo từ các món hiện có trong giỏ.');
    if (!confirmed) return;

    setCreating(true);
    try {
      const response = await createOrder(checkoutForm);
      await refreshCartState();
      notify(`Đặt món thành công, mã đơn ${response.data.code}`, 'success');
      await showSuccess('Đặt món thành công', `Mã đơn của bạn là ${response.data.code}`);
      window.setTimeout(() => navigate(`/orders/${response.data._id}`), 450);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tạo đơn hàng';
      setCartError(message);
      await showError('Tạo đơn thất bại', message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navbar />
      <main className="mx-auto grid max-w-7xl gap-8 px-6 py-12">
        {createMode ? (
          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[28px] bg-surface-container-lowest p-8 shadow-xl">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h1 className="mb-2 text-4xl font-black">Xác nhận đơn món</h1>
                  <p className="text-on-surface-variant">Kiểm tra lại các món đang có trong giỏ trước khi gửi đơn.</p>
                </div>
                <Link to="/products" className="rounded-2xl bg-surface-container-high px-5 py-3 font-bold transition-all hover:bg-surface-container-highest">
                  Chọn thêm món
                </Link>
              </div>

              {cartError ? <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-red-700">{cartError}</div> : null}

              {loadingCart ? (
                <div className="rounded-3xl border border-dashed border-outline p-6 text-on-surface-variant">Đang tải giỏ món...</div>
              ) : !cartItems.length ? (
                <div className="rounded-3xl border border-dashed border-outline p-6 text-on-surface-variant">
                  Giỏ món đang trống. Bạn cần thêm món từ thực đơn trước khi tạo đơn.
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item._id} className="grid grid-cols-[84px_minmax(0,1fr)] gap-4 rounded-3xl border border-orange-100 bg-white p-4 shadow-sm">
                      <div className="overflow-hidden rounded-2xl bg-orange-50">
                        <img alt={item.product?.name || 'Món đã chọn'} className="h-20 w-20 object-cover" src={imageUrl(item.product?.image)} />
                      </div>
                      <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-bold">{item.product?.name || 'Món đã chọn'}</h3>
                          <p className="mt-1 text-sm text-on-surface-variant">{item.product?.category?.name || 'Chưa phân loại'}</p>
                          <p className="mt-2 text-sm text-on-surface-variant">
                            {formatCurrency(item.unitPrice)} x {item.quantity}
                          </p>
                        </div>
                        <div className="shrink-0 rounded-2xl bg-orange-50 px-4 py-3 text-right">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Thành tiền</p>
                          <strong className="text-lg text-primary">{formatCurrency(item.subtotal)}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <aside className="h-fit rounded-[28px] bg-surface-container-lowest p-8 shadow-xl">
              <h2 className="mb-5 text-2xl font-black">Thông tin giao hàng</h2>
              <div className="grid gap-4">
                <textarea
                  className="min-h-28 rounded-2xl bg-surface-container p-4 outline-none"
                  value={checkoutForm.shippingAddress}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, shippingAddress: e.target.value })}
                />
                <textarea
                  className="min-h-28 rounded-2xl bg-surface-container p-4 outline-none"
                  placeholder="Ghi chú cho quán: ít cay, thêm đá, giao trước cổng..."
                  value={checkoutForm.note}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, note: e.target.value })}
                />
                <select
                  className="rounded-2xl bg-surface-container p-4 outline-none"
                  value={checkoutForm.paymentMethod}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, paymentMethod: e.target.value })}
                >
                  <option value="cash">{getPaymentMethodLabel('cash')}</option>
                  <option value="banking">{getPaymentMethodLabel('banking')}</option>
                  <option value="momo">{getPaymentMethodLabel('momo')}</option>
                </select>
              </div>

              <div className="my-6 space-y-3 rounded-3xl bg-surface-container-low p-5">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span>Số món trong giỏ</span>
                  <strong>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</strong>
                </div>
                <div className="flex items-center justify-between text-lg">
                  <span>Tổng thanh toán</span>
                  <strong className="text-primary">{formatCurrency(cartState?.cart.totalAmount || 0)}</strong>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={onCreate}
                  disabled={creating || loadingCart || !cartItems.length}
                  className="cursor-pointer rounded-2xl bg-primary px-8 py-4 font-bold text-on-primary transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creating ? 'Đang gửi đơn...' : 'Xác nhận đặt món'}
                </button>
                <Link to="/cart" className="rounded-2xl bg-surface-container-high px-8 py-4 text-center font-bold transition-all hover:bg-surface-container-highest">
                  Quay lại giỏ món
                </Link>
              </div>
            </aside>
          </section>
        ) : null}

        <section className="rounded-[28px] bg-surface-container-lowest p-8 shadow-xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-3xl font-black">Lịch sử đơn món</h2>
            <div className="flex flex-wrap gap-3">
              <Link to="/products" className="rounded-2xl bg-surface-container-high px-6 py-3 font-bold transition-all hover:bg-surface-container-highest">
                Chọn món mới
              </Link>
              <Link to="/cart" className="rounded-2xl bg-primary px-6 py-3 font-bold text-on-primary transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/20">
                Đi đến giỏ món
              </Link>
            </div>
          </div>
          {error ? <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-red-700">{error}</div> : null}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm text-on-surface-variant">
                  <th className="pb-4">Mã đơn</th>
                  <th className="pb-4">Tổng tiền</th>
                  <th className="pb-4">Trạng thái</th>
                  <th className="pb-4">Ngày tạo</th>
                  <th className="pb-4" />
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-t border-surface-variant">
                    <td className="py-4 font-bold">{order.code}</td>
                    <td className="py-4">{formatCurrency(order.totalAmount)}</td>
                    <td className="py-4">{getOrderStatusLabel(order.status)}</td>
                    <td className="py-4">{formatDate(order.createdAt)}</td>
                    <td className="py-4">
                      <Link className="font-bold text-primary" to={`/orders/${order._id}`}>Chi tiết</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <MobileNav />
    </div>
  );
}
