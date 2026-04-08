import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import Landing from './pages/Landing';
import Menu from './pages/Menu';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/Cart';
import OrdersPage from './pages/Orders';
import OrderDetailPage from './pages/OrderDetail';
import NotificationsPage from './pages/Notifications';
import { clearToken, deleteCartItem, fetchCart, formatCurrency, getStoredToken, getUserMe, loginApi, registerApi, updateCartItem } from './lib/api';
import { closeSocket, getSocket } from './lib/socket';
import { confirmDelete, showError, showNewOrderAlert, showSuccess } from './lib/swal';
import type { AuthContextValue, AuthPayload, CartItem, CartResponse, User } from './types';

const AuthContext = createContext<AuthContextValue | null>(null);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ message: string; tone: 'success' | 'error' | 'info' } | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [cartState, setCartState] = useState<CartResponse | null>(null);
  const [cartLoading, setCartLoading] = useState(false);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    const bootstrap = async () => {
      const token = getStoredToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await getUserMe();
        setUser(response.data);
      } catch {
        clearToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    void bootstrap();
  }, []);

  const refreshCartState = async () => {
    if (!getStoredToken()) {
      setCartState(null);
      setCartCount(0);
      return;
    }

    try {
      setCartLoading(true);
      const response = await fetchCart();
      setCartState(response.data);
      setCartCount(response.data.items.reduce((sum, item) => sum + item.quantity, 0));
    } catch {
      setCartState(null);
      setCartCount(0);
    } finally {
      setCartLoading(false);
    }
  };

  const openCartDrawer = async () => {
    await refreshCartState();
    setCartDrawerOpen(true);
  };

  useEffect(() => {
    if (user) {
      void refreshCartState();
    } else {
      setCartState(null);
      setCartCount(0);
    }
  }, [user]);

  useEffect(() => {
    if (!user?._id) {
      closeSocket();
      return;
    }

    const socket = getSocket();
    socket.emit('join:user', user._id);

    const handleNotification = (payload: { type?: string; title?: string; message?: string }) => {
      if (['admin', 'staff'].includes(user.role?.name || '') && payload.type === 'order') {
        const orderCode = payload.message?.match(/ORD-\d+/)?.[0];
        void showNewOrderAlert(orderCode, payload.message);
      }
    };

    socket.on('notification:new', handleNotification);

    return () => {
      socket.off('notification:new', handleNotification);
    };
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      cartCount,
      async login(payload: AuthPayload) {
        const response = await loginApi(payload);
        setUser(response.data.user);
      },
      async register(payload: FormData) {
        const response = await registerApi(payload);
        setUser(response.data.user);
      },
      logout() {
        clearToken();
        setUser(null);
        setCartDrawerOpen(false);
        setCartCount(0);
        setCartState(null);
      },
      notify(message, tone = 'info') {
        setNotice({ message, tone });
      },
      openCartDrawer,
      refreshCartState,
    }),
    [cartCount, loading, user],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {user ? (
        <>
          <div
            className={`fixed inset-0 z-[90] bg-black/35 transition-opacity duration-300 ${cartDrawerOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
            onClick={() => setCartDrawerOpen(false)}
          />
          <aside className={`fixed right-0 top-0 z-[91] flex h-dvh w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${cartDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex shrink-0 items-center justify-between border-b border-surface-variant px-6 py-5">
              <div>
                <h3 className="text-2xl font-black">Giỏ món nhanh</h3>
                <p className="text-sm text-on-surface-variant">Kiểm tra món vừa thêm mà không cần rời khỏi trang.</p>
              </div>
              <button className="cursor-pointer rounded-full bg-surface-container-high p-3 hover:bg-surface-container-highest" onClick={() => setCartDrawerOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              {cartLoading ? <div className="text-on-surface-variant">Đang tải giỏ món...</div> : null}
              {!cartLoading && !cartState?.items.length ? <div className="rounded-3xl border border-dashed border-outline p-6 text-on-surface-variant">Chưa có món nào trong giỏ.</div> : null}
              <div className="space-y-4">
                {cartState?.items.map((item: CartItem) => (
                  <div key={item._id} className="rounded-3xl bg-surface-container-low p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-bold">{item.product?.name}</h4>
                        <p className="text-sm text-on-surface-variant">{formatCurrency(item.unitPrice)} mỗi phần</p>
                      </div>
                      <strong>{formatCurrency(item.subtotal)}</strong>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          className="h-9 w-9 cursor-pointer rounded-full bg-white hover:bg-orange-100"
                          onClick={async () => {
                            if (item.quantity > 1) {
                              await updateCartItem(item._id, { quantity: item.quantity - 1 });
                              await refreshCartState();
                            }
                          }}
                        >
                          -
                        </button>
                        <span className="min-w-8 text-center font-bold">{item.quantity}</span>
                        <button
                          className="h-9 w-9 cursor-pointer rounded-full bg-white hover:bg-orange-100"
                          onClick={async () => {
                            await updateCartItem(item._id, { quantity: item.quantity + 1 });
                            await refreshCartState();
                          }}
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="cursor-pointer font-semibold text-red-600 hover:underline"
                        onClick={async () => {
                          const confirmed = await confirmDelete(item.product?.name || 'món này');
                          if (!confirmed) return;
                          try {
                            await deleteCartItem(item._id);
                            await showSuccess('Đã xóa món');
                            await refreshCartState();
                          } catch (err) {
                            await showError('Xóa món thất bại', err instanceof Error ? err.message : undefined);
                          }
                        }}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="shrink-0 border-t border-surface-variant px-6 py-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-on-surface-variant">Tổng tạm tính</span>
                <strong className="text-xl">{formatCurrency(cartState?.cart.totalAmount || 0)}</strong>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button className="flex-1 cursor-pointer rounded-2xl bg-surface-container-high px-5 py-4 font-bold hover:bg-surface-container-highest" onClick={() => { setCartDrawerOpen(false); window.location.href = '/products'; }}>
                  Tiếp tục chọn món
                </button>
                <button className="flex-1 cursor-pointer rounded-2xl bg-primary px-5 py-4 font-bold text-on-primary hover:shadow-xl hover:shadow-primary/20" onClick={() => { setCartDrawerOpen(false); window.location.href = '/cart'; }}>
                  Xem giỏ món
                </button>
              </div>
            </div>
          </aside>
        </>
      ) : null}
      {notice ? (
        <div className={`animate-slide-in-top fixed right-5 top-5 z-[100] rounded-2xl px-5 py-4 text-sm font-semibold shadow-2xl transition-all ${
          notice.tone === 'success'
            ? 'bg-emerald-600 text-white'
            : notice.tone === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-stone-900 text-white'
        }`}
        >
          {notice.message}
        </div>
      ) : null}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-on-surface-variant">Đang tải dữ liệu...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles?.length && (!user.role?.name || !roles.includes(user.role.name))) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-on-surface-variant">Đang tải dữ liệu...</div>;
  if (user) return <Navigate to={user.role?.name === 'customer' ? '/' : '/admin'} replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/products" element={<Menu />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin', 'staff']}>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
