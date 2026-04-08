import { Link } from 'react-router-dom';
import { useAuth } from '../App';

export default function MobileNav() {
  const { user, openCartDrawer, cartCount } = useAuth();

  return (
    <>
      <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around rounded-t-[2rem] border-t border-orange-100/20 bg-white/85 px-4 pb-4 pt-2 shadow-[0_-4px_20px_rgba(255,107,0,0.08)] backdrop-blur-lg md:hidden">
        <Link to="/" className="flex flex-col items-center justify-center rounded-2xl px-5 py-2 text-stone-500">
          <span className="material-symbols-outlined mb-1 text-orange-600">home</span>
          <span className="mt-1 font-body text-[11px] font-medium">Trang chủ</span>
        </Link>
        <Link to="/products" className="flex flex-col items-center justify-center rounded-2xl px-5 py-2 text-stone-500">
          <span className="material-symbols-outlined mb-1 text-orange-600">storefront</span>
          <span className="mt-1 font-body text-[11px] font-medium">Thực đơn</span>
        </Link>
        <button onClick={() => { if (user) { void openCartDrawer(); } else { window.location.href = '/login'; } }} className="relative flex cursor-pointer flex-col items-center justify-center rounded-2xl px-5 py-2 text-stone-500">
          <span className="material-symbols-outlined mb-1 text-orange-600">shopping_cart</span>
          {cartCount > 0 ? <span className="absolute right-4 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-orange-600 px-1 text-[11px] text-white">{cartCount}</span> : null}
          <span className="mt-1 font-body text-[11px] font-medium">Giỏ hàng</span>
        </button>
        <Link to={user?.role?.name !== 'customer' ? '/admin' : user ? '/orders' : '/login'} className="flex flex-col items-center justify-center rounded-2xl px-5 py-2 text-stone-500">
          <span className="material-symbols-outlined mb-1 text-orange-600">{user?.role?.name !== 'customer' ? 'dashboard' : 'receipt_long'}</span>
          <span className="mt-1 font-body text-[11px] font-medium">{user?.role?.name !== 'customer' ? 'Quản trị' : 'Đơn hàng'}</span>
        </Link>
      </nav>
      <div className="h-24 md:hidden" />
    </>
  );
}
