import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login({ email, password });
      navigate((location.state as { from?: string } | null)?.from || '/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập không thành công');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <form onSubmit={onSubmit} className="w-full max-w-xl rounded-[32px] bg-surface-container-lowest p-8 shadow-2xl">
        <div className="mb-8">
          <div className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-primary">Urban Cravings</div>
          <h1 className="mb-3 text-4xl font-black">Đăng nhập hệ thống</h1>
          <p className="text-on-surface-variant">Đăng nhập để đặt món, theo dõi đơn hàng và truy cập khu vực quản lý khi tài khoản có quyền phù hợp.</p>
        </div>
        {error ? <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-red-700">{error}</div> : null}
        <div className="space-y-4">
          <input className="w-full rounded-2xl bg-surface-container px-5 py-4 outline-none" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <input className="w-full rounded-2xl bg-surface-container px-5 py-4 outline-none" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu" />
        </div>
        <button disabled={loading} className="mt-6 w-full rounded-2xl bg-primary px-6 py-4 text-lg font-bold text-on-primary shadow-lg shadow-primary/20">
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
        <div className="mt-6 text-sm text-on-surface-variant">
          Chưa có tài khoản? <Link to="/register" className="font-bold text-primary">Đăng ký khách hàng</Link>
        </div>
      </form>
    </div>
  );
}
