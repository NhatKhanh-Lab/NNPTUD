import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import {
  createCategory,
  createProduct,
  createRole,
  createUser,
  deleteCategory,
  deleteProduct,
  deleteRole,
  deleteUser,
  fetchCategories,
  fetchOrderDetail,
  fetchOrders,
  fetchPayments,
  fetchProducts,
  fetchRoles,
  fetchUsers,
  formatCurrency,
  formatDate,
  updateCategory,
  updateOrderStatus,
  updatePaymentStatus,
  updateProduct,
  updateRole,
  updateUser,
} from '../lib/api';
import { getOrderStatusLabel, getPaymentMethodLabel, getPaymentStatusLabel, getRoleLabel } from '../lib/display';
import { confirmDelete, confirmLogout, confirmSubmit, showError, showSuccess } from '../lib/swal';
import { useAuth } from '../App';
import type { Category, Order, Payment, Product, Role, User } from '../types';

type OrderSummaryDetail = Awaited<ReturnType<typeof fetchOrderDetail>>['data'];

const orderTransitions: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipping', 'cancelled'],
  shipping: ['completed'],
};

const paymentTransitions: Record<string, string[]> = {
  pending: ['paid', 'failed'],
  paid: ['refunded'],
};

export default function Admin() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';
  const { user, logout } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const [categoryForm, setCategoryForm] = useState({ id: '', name: '', description: '' });
  const [productForm, setProductForm] = useState({ id: '', name: '', description: '', price: '', stock: '', categoryId: '' });
  const [roleForm, setRoleForm] = useState({ id: '', name: '', description: '' });
  const [userForm, setUserForm] = useState({ id: '', fullName: '', email: '', password: '', roleName: 'customer', phone: '', address: '' });
  const [productImage, setProductImage] = useState<File | null>(null);
  const [userAvatar, setUserAvatar] = useState<File | null>(null);
  const [orderSummaryOpen, setOrderSummaryOpen] = useState(false);
  const [orderSummaryLoading, setOrderSummaryLoading] = useState(false);
  const [orderSummaryError, setOrderSummaryError] = useState('');
  const [orderSummaryTitle, setOrderSummaryTitle] = useState('Tóm tắt đơn hàng');
  const [orderSummary, setOrderSummary] = useState<OrderSummaryDetail | null>(null);

  const loadAll = async (showOverlay = false) => {
    if (showOverlay) setRefreshing(true);
    try {
      const [categoriesRes, productsRes, ordersRes, paymentsRes] = await Promise.all([
        fetchCategories(),
        fetchProducts(),
        fetchOrders(),
        fetchPayments().catch(() => ({ data: [] as Payment[] } as { data: Payment[] })),
      ]);

      setCategories(categoriesRes.data);
      setProducts(productsRes.data);
      setOrders(ordersRes.data);
      setPayments(paymentsRes.data);

      if (user?.role?.name === 'admin') {
        const [usersRes, rolesRes] = await Promise.all([fetchUsers(), fetchRoles()]);
        setUsers(usersRes.data);
        setRoles(rolesRes.data);
      }

      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu quản trị');
    } finally {
      if (showOverlay) setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadAll(true);
  }, [user?.role?.name]);

  const totalRevenue = useMemo(
    () => payments.filter((item) => item.status === 'paid').reduce((sum, item) => sum + item.amount, 0),
    [payments],
  );

  const productPayload = () => {
    const form = new FormData();
    form.append('name', productForm.name);
    form.append('description', productForm.description);
    form.append('price', productForm.price);
    form.append('stock', productForm.stock);
    form.append('categoryId', productForm.categoryId);
    if (productImage) form.append('image', productImage);
    return form;
  };

  const userPayload = () => {
    const form = new FormData();
    Object.entries(userForm).forEach(([key, value]) => {
      if (key !== 'id' && value) form.append(key, value);
    });
    if (userAvatar) form.append('avatar', userAvatar);
    return form;
  };

  const handleSaveCategory = async () => {
    const confirmed = await confirmSubmit(categoryForm.id ? 'Cập nhật danh mục' : 'Tạo danh mục', 'Bạn muốn lưu thông tin danh mục này?');
    if (!confirmed) return;
    try {
      if (categoryForm.id) await updateCategory(categoryForm.id, categoryForm);
      else await createCategory(categoryForm);
      setCategoryForm({ id: '', name: '', description: '' });
      await showSuccess('Lưu danh mục thành công');
      await loadAll(true);
    } catch (err) {
      await showError('Không thể lưu danh mục', err instanceof Error ? err.message : undefined);
    }
  };

  const handleSaveProduct = async () => {
    const confirmed = await confirmSubmit(productForm.id ? 'Cập nhật món ăn' : 'Tạo món ăn', 'Bạn muốn lưu thông tin món ăn này?');
    if (!confirmed) return;
    try {
      if (productForm.id) await updateProduct(productForm.id, productPayload());
      else await createProduct(productPayload());
      setProductForm({ id: '', name: '', description: '', price: '', stock: '', categoryId: '' });
      setProductImage(null);
      await showSuccess('Lưu món ăn thành công');
      await loadAll(true);
    } catch (err) {
      await showError('Không thể lưu món ăn', err instanceof Error ? err.message : undefined);
    }
  };

  const handleSaveUser = async () => {
    const confirmed = await confirmSubmit(userForm.id ? 'Cập nhật người dùng' : 'Tạo người dùng', 'Bạn muốn lưu thông tin người dùng này?');
    if (!confirmed) return;
    try {
      if (userForm.id) await updateUser(userForm.id, userPayload());
      else await createUser(userPayload());
      setUserForm({ id: '', fullName: '', email: '', password: '', roleName: 'customer', phone: '', address: '' });
      setUserAvatar(null);
      await showSuccess('Lưu người dùng thành công');
      await loadAll(true);
    } catch (err) {
      await showError('Không thể lưu người dùng', err instanceof Error ? err.message : undefined);
    }
  };

  const handleSaveRole = async () => {
    const confirmed = await confirmSubmit(roleForm.id ? 'Cập nhật vai trò' : 'Tạo vai trò', 'Bạn muốn lưu thông tin vai trò này?');
    if (!confirmed) return;
    try {
      if (roleForm.id) await updateRole(roleForm.id, roleForm);
      else await createRole(roleForm);
      setRoleForm({ id: '', name: '', description: '' });
      await showSuccess('Lưu vai trò thành công');
      await loadAll(true);
    } catch (err) {
      await showError('Không thể lưu vai trò', err instanceof Error ? err.message : undefined);
    }
  };

  const handleDelete = async (label: string, action: () => Promise<unknown>) => {
    const confirmed = await confirmDelete(label);
    if (!confirmed) return;
    try {
      await action();
      await showSuccess('Xóa thành công');
      await loadAll(true);
    } catch (err) {
      await showError('Xóa thất bại', err instanceof Error ? err.message : undefined);
    }
  };

  const handleOrderTransition = async (orderId: string, status: string) => {
    const confirmed = await confirmSubmit('Cập nhật đơn hàng', `Chuyển đơn sang trạng thái "${getOrderStatusLabel(status)}"?`);
    if (!confirmed) return;
    try {
      await updateOrderStatus(orderId, status);
      await showSuccess('Đã cập nhật đơn hàng');
      await loadAll(true);
    } catch (err) {
      await showError('Không thể cập nhật đơn hàng', err instanceof Error ? err.message : undefined);
    }
  };

  const handlePaymentTransition = async (paymentId: string, status: string) => {
    const confirmed = await confirmSubmit('Cập nhật thanh toán', `Chuyển thanh toán sang trạng thái "${getPaymentStatusLabel(status)}"?`);
    if (!confirmed) return;
    try {
      await updatePaymentStatus(paymentId, status);
      await showSuccess('Đã cập nhật thanh toán');
      await loadAll(true);
    } catch (err) {
      await showError('Không thể cập nhật thanh toán', err instanceof Error ? err.message : undefined);
    }
  };

  const openOrderSummary = async (orderId: string, title?: string) => {
    setOrderSummaryOpen(true);
    setOrderSummaryLoading(true);
    setOrderSummaryError('');
    setOrderSummary(null);
    setOrderSummaryTitle(title || 'Tóm tắt đơn hàng');

    try {
      const response = await fetchOrderDetail(orderId);
      setOrderSummary(response.data);
    } catch (err) {
      setOrderSummaryError(err instanceof Error ? err.message : 'Không thể tải chi tiết đơn hàng');
    } finally {
      setOrderSummaryLoading(false);
    }
  };

  const closeOrderSummary = () => {
    setOrderSummaryOpen(false);
    setOrderSummaryLoading(false);
    setOrderSummaryError('');
    setOrderSummary(null);
  };

  return (
    <div className="flex min-h-screen bg-surface text-on-surface">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        {refreshing ? (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-white/45 backdrop-blur-[2px]">
            <div className="rounded-3xl bg-white px-8 py-6 shadow-2xl">
              <div className="mx-auto mb-3 h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />
              <p className="font-semibold text-stone-700">Đang làm mới dữ liệu...</p>
            </div>
          </div>
        ) : null}
        <header className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-on-surface">Bảng quản trị</h2>
            <p className="mt-1 text-stone-500">Theo dõi đơn hàng, doanh thu và vận hành cửa hàng theo vai trò hiện tại: {getRoleLabel(user?.role?.name)}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => void loadAll(true)} className="cursor-pointer rounded-xl bg-white px-5 py-3 font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">Tải lại</button>
            <button
              onClick={async () => {
                const confirmed = await confirmLogout();
                if (!confirmed) return;
                logout();
              }}
              className="cursor-pointer rounded-xl bg-gradient-to-br from-primary to-primary-container px-6 py-3 font-semibold text-on-primary shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
            >
              Đăng xuất
            </button>
          </div>
        </header>

        {error ? <div className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-red-700">{error}</div> : null}

        {tab === 'overview' ? (
          <>
            <section className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Tổng doanh thu đã thanh toán" value={formatCurrency(totalRevenue)} icon="payments" />
              <StatCard title="Tổng món ăn" value={String(products.length)} icon="inventory_2" />
              <StatCard title="Tổng đơn hàng" value={String(orders.length)} icon="shopping_bag" />
              <StatCard title="Đơn chờ thanh toán" value={String(payments.filter((item) => item.status === 'pending').length)} icon="hourglass_top" />
            </section>
            <section className="rounded-lg border border-stone-100 bg-surface-container-lowest p-8 shadow-sm">
              <div className="mb-8 flex items-center justify-between">
                <h4 className="text-xl font-bold">Đơn hàng gần đây</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-4 text-left">
                  <thead>
                    <tr className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
                      <th className="px-4 pb-2">Mã đơn</th>
                      <th className="px-4 pb-2">Khách hàng</th>
                      <th className="px-4 pb-2">Tổng tiền</th>
                      <th className="px-4 pb-2">Trạng thái</th>
                      <th className="px-4 pb-2">Ngày tạo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 8).map((order) => (
                      <tr key={order._id} className="bg-surface-container-low/30 transition-colors hover:bg-surface-container-low">
                        <td className="px-4 py-4 font-bold">{order.code}</td>
                        <td className="px-4 py-4">{order.user?.fullName}</td>
                        <td className="px-4 py-4">{formatCurrency(order.totalAmount)}</td>
                        <td className="px-4 py-4">{getOrderStatusLabel(order.status)}</td>
                        <td className="px-4 py-4">{formatDate(order.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : null}

        {tab === 'categories' ? (
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <Panel title="Biểu mẫu danh mục">
              <FormInput label="Tên danh mục" value={categoryForm.name} onChange={(value) => setCategoryForm({ ...categoryForm, name: value })} />
              <FormTextarea label="Mô tả" value={categoryForm.description} onChange={(value) => setCategoryForm({ ...categoryForm, description: value })} />
              <div className="flex gap-3">
                <ActionButton onClick={handleSaveCategory}>Lưu</ActionButton>
                <SecondaryButton onClick={() => setCategoryForm({ id: '', name: '', description: '' })}>Làm mới</SecondaryButton>
              </div>
            </Panel>
            <DataTable
              title="Danh sách danh mục"
              headers={['Tên', 'Mô tả', 'Thao tác']}
              rows={categories.map((item) => [
                item.name,
                item.description || '-',
                <div className="flex gap-2" key={item._id}>
                  <SecondaryButton onClick={() => setCategoryForm({ id: item._id, name: item.name, description: item.description || '' })}>Sửa</SecondaryButton>
                  {user?.role?.name === 'admin' ? <DangerButton onClick={() => void handleDelete(`danh mục "${item.name}"`, () => deleteCategory(item._id))}>Xóa</DangerButton> : null}
                </div>,
              ])}
            />
          </div>
        ) : null}

        {tab === 'products' ? (
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <Panel title="Biểu mẫu món ăn">
              <FormInput label="Tên món ăn" value={productForm.name} onChange={(value) => setProductForm({ ...productForm, name: value })} />
              <FormTextarea label="Mô tả" value={productForm.description} onChange={(value) => setProductForm({ ...productForm, description: value })} />
              <div className="grid gap-4 md:grid-cols-2">
                <FormInput label="Giá" value={productForm.price} onChange={(value) => setProductForm({ ...productForm, price: value })} />
                <FormInput label="Tồn kho" value={productForm.stock} onChange={(value) => setProductForm({ ...productForm, stock: value })} />
              </div>
              <label className="mb-2 block text-sm font-semibold">Danh mục</label>
              <select className="mb-4 w-full rounded-2xl bg-surface-container-low px-4 py-3" value={productForm.categoryId} onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}>
                <option value="">Chọn danh mục</option>
                {categories.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
              </select>
              <FileInput className="mb-4" onChange={(e) => setProductImage(e.target.files?.[0] || null)} />
              <div className="flex gap-3">
                <ActionButton onClick={handleSaveProduct}>Lưu</ActionButton>
                <SecondaryButton onClick={() => { setProductForm({ id: '', name: '', description: '', price: '', stock: '', categoryId: '' }); setProductImage(null); }}>Làm mới</SecondaryButton>
              </div>
            </Panel>
            <DataTable
              title="Danh sách món ăn"
              headers={['Tên', 'Giá', 'Tồn', 'Danh mục', 'Thao tác']}
              rows={products.map((item) => [
                item.name,
                formatCurrency(item.price),
                String(item.stock),
                item.category?.name || '-',
                <div className="flex gap-2" key={item._id}>
                  <SecondaryButton onClick={() => setProductForm({ id: item._id, name: item.name, description: item.description || '', price: String(item.price), stock: String(item.stock), categoryId: item.category?._id || '' })}>Sửa</SecondaryButton>
                  {user?.role?.name === 'admin' ? <DangerButton onClick={() => void handleDelete(`món "${item.name}"`, () => deleteProduct(item._id))}>Xóa</DangerButton> : null}
                </div>,
              ])}
            />
          </div>
        ) : null}

        {tab === 'orders' ? (
          <DataTable
            title="Quản lý đơn hàng"
            headers={['Mã đơn', 'Khách hàng', 'Tổng tiền', 'Trạng thái', 'Ngày tạo', 'Chi tiết', 'Thao tác']}
            rows={orders.map((order) => [
              order.code,
              order.user?.fullName || '-',
              formatCurrency(order.totalAmount),
              getOrderStatusLabel(order.status),
              formatDate(order.createdAt),
              <button
                key={`detail-${order._id}`}
                onClick={() => void openOrderSummary(order._id, `Tóm tắt ${order.code}`)}
                className="cursor-pointer font-semibold text-primary hover:underline"
              >
                Xem nhanh
              </button>,
              <div className="flex flex-wrap gap-2" key={order._id}>
                {(orderTransitions[order.status] || []).map((status) => (
                  <SecondaryButton key={status} onClick={() => void handleOrderTransition(order._id, status)}>
                    {getOrderStatusLabel(status)}
                  </SecondaryButton>
                ))}
              </div>,
            ])}
          />
        ) : null}

        {tab === 'payments' ? (
          <DataTable
            title="Quản lý thanh toán"
            headers={['Mã đơn', 'Khách hàng', 'Phương thức', 'Số tiền', 'Trạng thái', 'Ngày thanh toán', 'Chi tiết đơn', 'Thao tác']}
            rows={payments.map((payment) => [
              payment.order?.code || '-',
              payment.order?.user?.fullName || '-',
              getPaymentMethodLabel(payment.method),
              formatCurrency(payment.amount),
              getPaymentStatusLabel(payment.status),
              formatDate(payment.paidAt),
              payment.order?._id ? (
                <button
                  key={`payment-order-${payment._id}`}
                  onClick={() => void openOrderSummary(payment.order!._id, `Tóm tắt ${payment.order?.code || 'đơn hàng'}`)}
                  className="cursor-pointer font-semibold text-primary hover:underline"
                >
                  Xem nhanh
                </button>
              ) : '-',
              <div className="flex flex-wrap gap-2" key={payment._id}>
                {(paymentTransitions[payment.status] || []).map((status) => (
                  <SecondaryButton key={status} onClick={() => void handlePaymentTransition(payment._id, status)}>
                    {getPaymentStatusLabel(status)}
                  </SecondaryButton>
                ))}
              </div>,
            ])}
          />
        ) : null}

        {tab === 'users' && user?.role?.name === 'admin' ? (
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <Panel title="Biểu mẫu người dùng">
              <div className="grid gap-4 md:grid-cols-2">
                <FormInput label="Họ tên" value={userForm.fullName} onChange={(value) => setUserForm({ ...userForm, fullName: value })} />
                <FormInput label="Email" value={userForm.email} onChange={(value) => setUserForm({ ...userForm, email: value })} />
                <FormInput label="Mật khẩu" value={userForm.password} onChange={(value) => setUserForm({ ...userForm, password: value })} />
                <label className="block text-sm font-semibold">
                  Vai trò
                  <select className="mt-2 w-full rounded-2xl bg-surface-container-low px-4 py-3" value={userForm.roleName} onChange={(e) => setUserForm({ ...userForm, roleName: e.target.value })}>
                    {roles.map((role) => <option key={role._id} value={role.name}>{getRoleLabel(role.name)}</option>)}
                  </select>
                </label>
                <FormInput label="Số điện thoại" value={userForm.phone} onChange={(value) => setUserForm({ ...userForm, phone: value })} />
                <FileInput className="mt-8" onChange={(e) => setUserAvatar(e.target.files?.[0] || null)} />
              </div>
              <FormTextarea label="Địa chỉ" value={userForm.address} onChange={(value) => setUserForm({ ...userForm, address: value })} />
              <div className="flex gap-3">
                <ActionButton onClick={handleSaveUser}>Lưu</ActionButton>
                <SecondaryButton onClick={() => setUserForm({ id: '', fullName: '', email: '', password: '', roleName: 'customer', phone: '', address: '' })}>Làm mới</SecondaryButton>
              </div>
            </Panel>
            <DataTable
              title="Danh sách người dùng"
              headers={['Họ tên', 'Email', 'Vai trò', 'Thao tác']}
              rows={users.map((item) => [
                item.fullName,
                item.email,
                getRoleLabel(item.role?.name),
                <div className="flex gap-2" key={item._id}>
                  <SecondaryButton onClick={() => setUserForm({ id: item._id, fullName: item.fullName, email: item.email, password: '', roleName: item.role?.name || 'customer', phone: item.phone || '', address: item.address || '' })}>Sửa</SecondaryButton>
                  <DangerButton onClick={() => void handleDelete(`người dùng "${item.fullName}"`, () => deleteUser(item._id))}>Xóa</DangerButton>
                </div>,
              ])}
            />
          </div>
        ) : null}

        {tab === 'roles' && user?.role?.name === 'admin' ? (
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <Panel title="Biểu mẫu vai trò">
              <FormInput label="Tên vai trò" value={roleForm.name} onChange={(value) => setRoleForm({ ...roleForm, name: value })} />
              <FormTextarea label="Mô tả" value={roleForm.description} onChange={(value) => setRoleForm({ ...roleForm, description: value })} />
              <div className="flex gap-3">
                <ActionButton onClick={handleSaveRole}>Lưu</ActionButton>
                <SecondaryButton onClick={() => setRoleForm({ id: '', name: '', description: '' })}>Làm mới</SecondaryButton>
              </div>
            </Panel>
            <DataTable
              title="Danh sách vai trò"
              headers={['Tên', 'Mô tả', 'Thao tác']}
              rows={roles.map((item) => [
                getRoleLabel(item.name),
                item.description || '-',
                <div className="flex gap-2" key={item._id}>
                  <SecondaryButton onClick={() => setRoleForm({ id: item._id, name: item.name, description: item.description || '' })}>Sửa</SecondaryButton>
                  <DangerButton onClick={() => void handleDelete(`vai trò "${getRoleLabel(item.name)}"`, () => deleteRole(item._id))}>Xóa</DangerButton>
                </div>,
              ])}
            />
          </div>
        ) : null}
        {orderSummaryOpen ? (
          <OrderSummaryModal
            detail={orderSummary}
            error={orderSummaryError}
            loading={orderSummaryLoading}
            title={orderSummaryTitle}
            onClose={closeOrderSummary}
          />
        ) : null}
      </main>
    </div>
  );
}

function OrderSummaryModal({
  detail,
  error,
  loading,
  title,
  onClose,
}: {
  detail: OrderSummaryDetail | null;
  error: string;
  loading: boolean;
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-stone-950/45 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[32px] border border-orange-100 bg-gradient-to-br from-white via-orange-50/40 to-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-orange-100 bg-white/85 px-8 py-6 backdrop-blur-sm">
          <div>
            <h3 className="text-2xl font-black text-on-surface">{title}</h3>
            <p className="mt-1 text-sm text-on-surface-variant">Xem nhanh món đã đặt, địa chỉ giao hàng và trạng thái thanh toán.</p>
          </div>
          <button className="grid h-11 w-11 cursor-pointer place-items-center rounded-full bg-orange-100 text-orange-700 transition-colors hover:bg-orange-200" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="max-h-[calc(92vh-92px)] overflow-y-auto px-8 py-6">
          {loading ? <div className="rounded-3xl bg-surface-container-low p-6 text-on-surface-variant">Đang tải chi tiết đơn hàng...</div> : null}
          {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-red-700">{error}</div> : null}

          {!loading && !error && detail ? (
            <div className="grid gap-6 lg:grid-cols-[1.18fr_0.82fr]">
              <section className="rounded-[28px] border border-orange-100 bg-white p-6 shadow-[0_16px_40px_rgba(156,63,0,0.08)]">
                <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{detail.order.code}</p>
                    <h4 className="mt-2 text-2xl font-black">Danh sách món trong đơn</h4>
                  </div>
                  <div className="grid gap-2 text-right text-sm">
                    <span className="rounded-full bg-orange-100 px-4 py-2 font-semibold text-orange-800">{getOrderStatusLabel(detail.order.status)}</span>
                    <span className="rounded-full bg-amber-100 px-4 py-2 font-semibold text-amber-800">{getPaymentStatusLabel(detail.payment?.status)}</span>
                  </div>
                </div>

                <div className="overflow-hidden rounded-3xl border border-orange-100 bg-orange-50/45">
                  <table className="w-full table-fixed text-left">
                    <colgroup>
                      <col />
                      <col className="w-20" />
                      <col className="w-40" />
                      <col className="w-44" />
                    </colgroup>
                    <thead className="bg-orange-100/70">
                      <tr className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">
                        <th className="px-5 py-4">Món</th>
                        <th className="px-5 py-4 text-center">SL</th>
                        <th className="px-5 py-4">Đơn giá</th>
                        <th className="px-5 py-4 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.items.map((item, index) => (
                        <tr key={item._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-orange-50/50'} border-b border-orange-100 last:border-b-0`}>
                          <td className="px-5 py-4">
                            <div className="font-semibold">{item.product?.name || 'Sản phẩm đã xóa'}</div>
                            <div className="mt-1 text-sm text-on-surface-variant">{item.product?.category?.name || 'Chưa phân loại'}</div>
                          </td>
                          <td className="px-5 py-4 text-center font-semibold">{item.quantity}</td>
                          <td className="px-5 py-4 text-right font-medium">{formatCurrency(item.subtotal / Math.max(item.quantity, 1))}</td>
                          <td className="px-5 py-4 text-right font-bold text-primary">{formatCurrency(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="space-y-5">
                <div className="rounded-[28px] border border-orange-100 bg-white p-6 shadow-[0_16px_40px_rgba(156,63,0,0.08)]">
                  <h4 className="mb-4 text-xl font-black">Tóm tắt thanh toán</h4>
                  <div className="grid gap-3 text-sm">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 rounded-2xl bg-orange-50/70 px-4 py-3">
                      <span className="text-on-surface-variant">Khách hàng</span>
                      <strong className="text-right">{detail.order.user?.fullName || '-'}</strong>
                    </div>
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 rounded-2xl bg-orange-50/70 px-4 py-3">
                      <span className="text-on-surface-variant">Phương thức</span>
                      <strong className="text-right">{getPaymentMethodLabel(detail.payment?.method)}</strong>
                    </div>
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 rounded-2xl bg-orange-50/70 px-4 py-3">
                      <span className="text-on-surface-variant">Thanh toán</span>
                      <strong className="text-right">{getPaymentStatusLabel(detail.payment?.status)}</strong>
                    </div>
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 rounded-2xl bg-orange-50/70 px-4 py-3">
                      <span className="text-on-surface-variant">Tạo lúc</span>
                      <strong className="text-right">{formatDate(detail.order.createdAt)}</strong>
                    </div>
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-4 text-base text-white">
                      <span>Tổng đơn</span>
                      <strong className="text-right">{formatCurrency(detail.order.totalAmount)}</strong>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-orange-100 bg-white p-6 shadow-[0_16px_40px_rgba(156,63,0,0.08)]">
                  <h4 className="mb-4 text-xl font-black">Thông tin giao hàng</h4>
                  <div className="rounded-3xl bg-orange-50/70 p-4 text-sm leading-6 text-on-surface-variant">
                    {detail.order.shippingAddress || 'Chưa có địa chỉ giao hàng'}
                  </div>
                </div>
              </section>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div className="flex flex-col justify-between rounded-lg border border-orange-100/30 bg-surface-container-lowest p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-4 flex items-start justify-between">
        <div className="rounded-2xl bg-orange-50 p-3 text-orange-600">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-stone-500">{title}</p>
        <h3 className="mt-1 text-2xl font-bold">{value}</h3>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-stone-100 bg-surface-container-lowest p-8 shadow-sm transition-all hover:shadow-md">
      <h4 className="mb-6 text-xl font-bold">{title}</h4>
      {children}
    </section>
  );
}

function DataTable({ title, headers, rows }: { title: string; headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <section className="rounded-lg border border-stone-100 bg-surface-container-lowest p-8 shadow-sm transition-all hover:shadow-md">
      <h4 className="mb-6 text-xl font-bold">{title}</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
              {headers.map((header) => (
                <th key={header} className="pb-3">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-t border-surface-variant transition-colors hover:bg-surface-container-low/40">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="py-4 align-top">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function FormInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="mb-4 block text-sm font-semibold">
      {label}
      <input className="mt-2 w-full rounded-2xl bg-surface-container-low px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-primary/20" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function FormTextarea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="mb-4 block text-sm font-semibold">
      {label}
      <textarea className="mt-2 min-h-28 w-full rounded-2xl bg-surface-container-low px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-primary/20" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function FileInput({
  className = '',
  onChange,
}: {
  className?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <input
      className={`${className} block w-full rounded-2xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant outline-none file:mr-4 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2 file:font-semibold file:text-on-primary hover:file:brightness-105`}
      type="file"
      accept="image/*"
      onChange={onChange}
    />
  );
}

function ActionButton({ children, onClick }: { children: React.ReactNode; onClick: () => void | Promise<void> }) {
  return <button onClick={() => void onClick()} className="cursor-pointer rounded-2xl bg-primary px-6 py-3 font-bold text-on-primary transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/20">{children}</button>;
}

function SecondaryButton({ children, onClick }: { children: React.ReactNode; onClick: () => void | Promise<void> }) {
  return <button onClick={() => void onClick()} className="cursor-pointer rounded-xl bg-surface-container-high px-4 py-2 font-semibold transition-all hover:-translate-y-0.5 hover:bg-surface-container-highest">{children}</button>;
}

function DangerButton({ children, onClick }: { children: React.ReactNode; onClick: () => void | Promise<void> }) {
  return <button onClick={() => void onClick()} className="cursor-pointer rounded-xl bg-red-50 px-4 py-2 font-semibold text-red-700 transition-all hover:-translate-y-0.5 hover:bg-red-100">{children}</button>;
}
