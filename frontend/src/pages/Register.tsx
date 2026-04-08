import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (avatar) data.append('avatar', avatar);

    setLoading(true);
    setError('');
    try {
      await register(data);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký không thành công');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
      <form onSubmit={onSubmit} className="w-full max-w-2xl rounded-[32px] bg-surface-container-lowest p-8 shadow-2xl">
        <h1 className="mb-3 text-4xl font-black">Tạo tài khoản khách hàng</h1>
        <p className="mb-8 text-on-surface-variant">Sau khi đăng ký thành công, hệ thống sẽ tự đăng nhập để bạn đặt món ngay.</p>
        {error ? <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-red-700">{error}</div> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <input className="w-full rounded-2xl bg-surface-container px-5 py-4 outline-none" placeholder="Họ tên" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <input className="w-full rounded-2xl bg-surface-container px-5 py-4 outline-none" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="w-full rounded-2xl bg-surface-container px-5 py-4 outline-none" type="password" placeholder="Mật khẩu" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <input className="w-full rounded-2xl bg-surface-container px-5 py-4 outline-none" placeholder="Số điện thoại" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <textarea className="mt-4 min-h-28 w-full rounded-2xl bg-surface-container px-5 py-4 outline-none" placeholder="Địa chỉ giao hàng" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <input
          className="mt-4 block w-full rounded-2xl bg-surface-container px-4 py-3 text-sm text-on-surface-variant outline-none file:mr-4 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2 file:font-semibold file:text-on-primary hover:file:brightness-105"
          type="file"
          accept="image/*"
          onChange={(e) => setAvatar(e.target.files?.[0] || null)}
        />
        <button disabled={loading} className="mt-6 w-full rounded-2xl bg-primary px-6 py-4 text-lg font-bold text-on-primary shadow-lg shadow-primary/20">
          {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
        </button>
      </form>
    </div>
  );
}
