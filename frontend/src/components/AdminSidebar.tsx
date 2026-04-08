import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../App';
import { getRoleLabel } from '../lib/display';

const tabs = [
  { key: 'overview', label: 'Tổng quan', icon: 'dashboard' },
  { key: 'categories', label: 'Danh mục', icon: 'category' },
  { key: 'products', label: 'Món ăn', icon: 'inventory_2' },
  { key: 'orders', label: 'Đơn hàng', icon: 'shopping_bag' },
  { key: 'payments', label: 'Thanh toán', icon: 'payments' },
];

const adminOnlyTabs = [
  { key: 'users', label: 'Người dùng', icon: 'group' },
  { key: 'roles', label: 'Vai trò', icon: 'admin_panel_settings' },
];

export default function AdminSidebar() {
  const [searchParams] = useSearchParams();
  const active = searchParams.get('tab') || 'overview';
  const { user } = useAuth();
  const visibleTabs = user?.role?.name === 'admin' ? [...tabs, ...adminOnlyTabs] : tabs;

  return (
    <aside className="sticky top-0 flex h-screen w-72 shrink-0 flex-col gap-2 border-r border-stone-200 bg-stone-50 p-6">
      <div className="mb-8 px-4">
        <Link to="/" className="block text-xl font-black italic text-orange-700">Urban Cravings</Link>
        <p className="mt-1 text-[10px] font-medium uppercase tracking-widest text-stone-500">Bảng điều khiển</p>
      </div>
      <nav className="flex flex-1 flex-col gap-2">
        {visibleTabs.map((tab) => (
          <Link
            key={tab.key}
            to={`/admin?tab=${tab.key}`}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-transform hover:translate-x-1 ${
              active === tab.key
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20'
                : 'text-stone-600 hover:bg-stone-200'
            }`}
          >
            <span className="material-symbols-outlined">{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto flex items-center gap-3 border-t border-stone-200/60 px-2 pt-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-700">
          {user?.fullName?.slice(0, 1) || 'A'}
        </div>
        <div>
          <p className="leading-tight text-on-surface text-sm font-bold">{user?.fullName || 'Quản trị viên'}</p>
          <p className="text-[11px] text-stone-500">{getRoleLabel(user?.role?.name)}</p>
        </div>
      </div>
    </aside>
  );
}
