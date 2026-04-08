import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import { addToCart, fetchProductById, formatCurrency, imageUrl } from '../lib/api';
import { useAuth } from '../App';
import { animateAddToCart } from '../lib/uiEffects';
import type { Product } from '../types';

export default function ProductDetail() {
  const { id = '' } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');
  const { user, notify, openCartDrawer, refreshCartState } = useAuth();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchProductById(id)
      .then((res) => {
        setProduct(res.data);
        setError('');
      })
      .catch((err) => setError(err.message));
  }, [id]);

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-12">
        {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-red-700">{error}</div> : null}
        {!product ? (
          <div className="text-on-surface-variant">Đang tải món ăn...</div>
        ) : (
          <div className="grid items-start gap-10 lg:grid-cols-2">
            <div className="overflow-hidden rounded-[28px] bg-surface-container-lowest shadow-2xl">
              <img src={imageUrl(product.image)} alt={product.name} className="aspect-[4/3] w-full object-cover" />
            </div>
            <div className="rounded-[28px] bg-surface-container-lowest p-8 shadow-xl">
              <div className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-primary">{product.category?.name || 'Món ăn'}</div>
              <h1 className="mb-4 text-5xl font-black">{product.name}</h1>
              <div className="mb-5 text-3xl font-black text-primary">{formatCurrency(product.price)}</div>
              <p className="mb-6 text-lg leading-relaxed text-on-surface-variant">{product.description || 'Món được phục vụ trong ngày với thời gian giao nhanh.'}</p>
              <div className="mb-8 space-y-3">
                <div className="flex justify-between"><span>Số phần còn lại</span><strong>{product.stock}</strong></div>
                <div className="flex justify-between"><span>Danh mục</span><strong>{product.category?.name || '-'}</strong></div>
                <div className="flex justify-between"><span>Bếp phụ trách</span><strong>{product.createdBy?.fullName || '-'}</strong></div>
              </div>
              <div className="flex flex-wrap gap-4">
                <button
                  className={`cursor-pointer rounded-2xl bg-primary px-8 py-4 font-bold text-on-primary transition-all hover:-translate-y-0.5 ${adding ? 'scale-[1.02] shadow-xl shadow-primary/20' : ''}`}
                  onClick={async (event) => {
                    if (!user) {
                      notify('Đăng nhập để đặt món này', 'info');
                      navigate('/login');
                      return;
                    }
                    setAdding(true);
                    try {
                      await addToCart({ productId: product._id, quantity: 1 });
                      await refreshCartState();
                      animateAddToCart(event.currentTarget);
                      notify('Thêm món vào giỏ thành công', 'success');
                      setTimeout(() => {
                        void openCartDrawer();
                      }, 320);
                    } catch (err) {
                      notify(err instanceof Error ? err.message : 'Không thể thêm món', 'error');
                    } finally {
                      setTimeout(() => setAdding(false), 300);
                    }
                  }}
                >
                  {adding ? 'Đang thêm...' : 'Thêm vào giỏ và đến checkout'}
                </button>
                <Link to="/products" className="rounded-2xl bg-surface-container-high px-8 py-4 font-bold transition-all hover:bg-surface-container-highest">
                  Xem thêm món khác
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
      <MobileNav />
    </div>
  );
}
