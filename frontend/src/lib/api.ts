import type { ApiEnvelope, AuthPayload, CartResponse, Category, Notification, Order, Payment, Product, Role, User } from '../types';

const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000';
const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  (currentOrigin.includes(':3000') || currentOrigin.includes(':5173')
    ? 'http://localhost:5000/api/v1'
    : `${currentOrigin}/api/v1`);
const ASSET_ORIGIN = API_BASE.replace(/\/api\/v1$/, '');

const TOKEN_KEY = 'nnptud_frontend_token';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, init: RequestInit = {}, auth = false): Promise<ApiEnvelope<T>> {
  const headers = new Headers(init.headers || {});
  if (!(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (auth && getStoredToken()) {
    headers.set('Authorization', `Bearer ${getStoredToken()}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || 'Yêu cầu không thành công');
  }
  return payload as ApiEnvelope<T>;
}

export const api = { request };

export const loginApi = async (payload: AuthPayload) => {
  const response = await request<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  setStoredToken(response.data.token);
  return response;
};

export const registerApi = async (payload: FormData) => {
  const response = await request<{ token: string; user: User }>('/auth/register', {
    method: 'POST',
    body: payload,
  });
  setStoredToken(response.data.token);
  return response;
};

export const getUserMe = () => request<User>('/auth/me', {}, true);

export const fetchCategories = () => request<Category[]>('/categories');
export const createCategory = (payload: Partial<Category>) => request<Category>('/categories', { method: 'POST', body: JSON.stringify(payload) }, true);
export const updateCategory = (id: string, payload: Partial<Category>) => request<Category>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(payload) }, true);
export const deleteCategory = (id: string) => request<unknown>(`/categories/${id}`, { method: 'DELETE' }, true);

export const fetchProducts = (params?: { keyword?: string; categoryId?: string }) => {
  const query = new URLSearchParams();
  if (params?.keyword) query.set('keyword', params.keyword);
  if (params?.categoryId) query.set('categoryId', params.categoryId);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request<Product[]>(`/products${suffix}`);
};
export const fetchProductById = (id: string) => request<Product>(`/products/${id}`);
export const createProduct = (payload: FormData) => request<Product>('/products', { method: 'POST', body: payload }, true);
export const updateProduct = (id: string, payload: FormData) => request<Product>(`/products/${id}`, { method: 'PUT', body: payload }, true);
export const deleteProduct = (id: string) => request<unknown>(`/products/${id}`, { method: 'DELETE' }, true);

export const fetchCart = () => request<CartResponse>('/carts/me', {}, true);
export const addToCart = (payload: { productId: string; quantity: number }) => request<CartResponse>('/carts/items', { method: 'POST', body: JSON.stringify(payload) }, true);
export const updateCartItem = (id: string, payload: { quantity: number }) => request<CartResponse>(`/carts/items/${id}`, { method: 'PUT', body: JSON.stringify(payload) }, true);
export const deleteCartItem = (id: string) => request<unknown>(`/carts/items/${id}`, { method: 'DELETE' }, true);

export const createOrder = (payload: { shippingAddress: string; note?: string; paymentMethod: string }) =>
  request<Order>('/orders', { method: 'POST', body: JSON.stringify(payload) }, true);
export const fetchOrders = () => request<Order[]>('/orders', {}, true);
export const fetchOrderDetail = (id: string) => request<{ order: Order; items: Array<{ _id: string; quantity: number; subtotal: number; product?: Product }>; payment: Payment }>(`/orders/${id}`, {}, true);
export const updateOrderStatus = (id: string, status: string) => request<Order>(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }, true);

export const fetchPayments = () => request<Payment[]>('/payments', {}, true);
export const updatePaymentStatus = (id: string, status: string) => request<Payment>(`/payments/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }, true);

export const fetchNotifications = () => request<Notification[]>('/notifications/me', {}, true);
export const markNotificationRead = (id: string) => request<Notification>(`/notifications/${id}/read`, { method: 'PUT' }, true);

export const fetchUsers = () => request<User[]>('/users', {}, true);
export const createUser = (payload: FormData) => request<User>('/users', { method: 'POST', body: payload }, true);
export const updateUser = (id: string, payload: FormData) => request<User>(`/users/${id}`, { method: 'PUT', body: payload }, true);
export const deleteUser = (id: string) => request<unknown>(`/users/${id}`, { method: 'DELETE' }, true);

export const fetchRoles = () => request<Role[]>('/roles', {}, true);
export const createRole = (payload: Partial<Role>) => request<Role>('/roles', { method: 'POST', body: JSON.stringify(payload) }, true);
export const updateRole = (id: string, payload: Partial<Role>) => request<Role>(`/roles/${id}`, { method: 'PUT', body: JSON.stringify(payload) }, true);
export const deleteRole = (id: string) => request<unknown>(`/roles/${id}`, { method: 'DELETE' }, true);

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

export const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleString('vi-VN') : '-';

export const imageUrl = (path?: string) => (path ? `${ASSET_ORIGIN}${path}` : 'https://placehold.co/800x600/f3eadf/8a5c37?text=Mon+an');
