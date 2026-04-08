import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { getRoleLabel } from '../lib/display';
import { confirmLogout } from '../lib/swal';

export default function Navbar() {
  const { user, logout, cartCount, openCartDrawer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [, forceRerender] = useState(0);

  useEffect(() => {
    forceRerender((value) => value + 1);
  }, [location.pathname]);

  return (
    <nav className="sticky top-0 z-50 full-width bg-orange-50/80 shadow-sm shadow-orange-900/5 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="font-headline text-2xl font-bold italic tracking-tight text-orange-700">
            Urban Cravings
          </Link>
          <div className="hidden items-center gap-6 font-body text-body-lg md:flex">
            <NavLink to="/" className="text-stone-600 transition-all hover:text-orange-500">Trang chủ</NavLink>
            <NavLink to="/products" className="text-stone-600 transition-all hover:text-orange-500">Thực đơn</NavLink>
            {user ? <NavLink to="/cart" className="text-stone-600 transition-all hover:text-orange-500">Giỏ món</NavLink> : null}
            {user ? <NavLink to="/orders" className="text-stone-600 transition-all hover:text-orange-500">Đơn hàng</NavLink> : null}
            {user ? <NavLink to="/notifications" className="text-stone-600 transition-all hover:text-orange-500">Thông báo</NavLink> : null}
            {user?.role?.name !== 'customer' ? <NavLink to="/admin" className="text-stone-600 transition-all hover:text-orange-500">Quản trị</NavLink> : null}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="hidden text-sm text-stone-600 lg:inline">
                {user.fullName} ({getRoleLabel(user.role?.name)})
              </span>
              <button id="cart-button-anchor" onClick={() => void openCartDrawer()} className="relative flex cursor-pointer items-center gap-2 rounded-full p-2 text-stone-600 transition-all hover:scale-105 hover:bg-orange-100/50">
                <span className="material-symbols-outlined text-orange-600">shopping_cart</span>
                {cartCount > 0 ? <span className="grid h-5 min-w-5 place-items-center rounded-full bg-orange-600 px-1 text-[11px] text-white absolute -right-1 -top-1">{cartCount}</span> : null}
              </button>
              <button
                onClick={async () => {
                  const confirmed = await confirmLogout();
                  if (!confirmed) return;
                  logout();
                  navigate('/');
                }}
                className="cursor-pointer rounded-full bg-orange-600 px-6 py-2 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-orange-700"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="cursor-pointer font-semibold text-stone-700 transition-colors hover:text-orange-600">
                Đăng nhập
              </button>
              <button onClick={() => navigate('/register')} className="cursor-pointer rounded-full bg-orange-600 px-6 py-2 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-orange-700">
                Đăng ký
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
