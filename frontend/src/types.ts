export type RoleName = 'admin' | 'staff' | 'customer';

export interface Role {
  _id: string;
  name: RoleName | string;
  description?: string;
}

export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
  role?: Role;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image?: string;
  category?: Category;
  createdBy?: User;
}

export interface CartItem {
  _id: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CartResponse {
  cart: {
    _id: string;
    totalAmount: number;
  };
  items: CartItem[];
}

export interface Order {
  _id: string;
  code: string;
  totalAmount: number;
  status: string;
  shippingAddress: string;
  createdAt: string;
  user?: User;
}

export interface Payment {
  _id: string;
  amount: number;
  status: string;
  method: string;
  paidAt?: string | null;
  order?: Order & { user?: User };
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: Record<string, unknown>;
}

export interface AuthPayload {
  email: string;
  password: string;
}

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  cartCount: number;
  login: (payload: AuthPayload) => Promise<void>;
  register: (payload: FormData) => Promise<void>;
  logout: () => void;
  notify: (message: string, tone?: 'success' | 'error' | 'info') => void;
  openCartDrawer: () => Promise<void>;
  refreshCartState: () => Promise<void>;
}
