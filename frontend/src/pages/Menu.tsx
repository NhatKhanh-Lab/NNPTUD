import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import { addToCart, fetchCategories, fetchProducts, formatCurrency, imageUrl } from '../lib/api';
import { useAuth } from '../App';
import { animateAddToCart } from '../lib/uiEffects';
import type { Category, Product } from '../types';

export default function Menu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const { user, notify, openCartDrawer, refreshCartState } = useAuth();
  const navigate = useNavigate();
  const [activeAddId, setActiveAddId] = useState('');

  const keyword = searchParams.get('keyword') || '';
  const categoryId = searchParams.get('category') || '';

  useEffect(() => {
    fetchCategories().then((res) => setCategories(res.data)).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    fetchProducts({
      keyword: keyword || undefined,
      categoryId: categoryId || undefined,
    })
      .then((res) => {
        setProducts(res.data);
        setError('');
      })
      .catch((err) => setError(err.message));
  }, [categoryId, keyword]);

  const onSearchChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set('keyword', value);
    else params.delete('keyword');
    setSearchParams(params);
  };

  const onCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set('category', value);
    else params.delete('category');
    setSearchParams(params);
  };

  const activeCategory = useMemo(() => categories.find((item) => item._id === categoryId)?.name, [categories, categoryId]);

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navbar />
      <main className="mx-auto flex max-w-7xl flex-col gap-12 px-6 py-12 md:flex-row">
        <aside className="w-full flex-shrink-0 md:w-72">
          <div className="sticky top-28 space-y-10">
            <div className="space-y-4">
              <h3 className="text-title-md font-semibold text-on-surface">Tìm món</h3>
              <div className="relative">
                <input
                  className="w-full rounded-2xl border-none bg-surface-container-low px-5 py-4 text-body-lg placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary-container"
                  placeholder="Tên món ăn hoặc đồ uống"
                  type="text"
                  value={keyword}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary">search</span>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-title-md font-semibold text-on-surface">Loại món</h3>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => onCategoryChange('')} className={`rounded-lg px-4 py-2 text-label-md font-medium ${!categoryId ? 'bg-primary text-on-primary shadow-md shadow-primary/20' : 'bg-surface-container-high text-on-surface-variant'}`}>
                  Tất cả
                </button>
                {categories.map((category) => (
                  <button key={category._id} onClick={() => onCategoryChange(category._id)} className={`rounded-lg px-4 py-2 text-label-md font-medium ${categoryId === category._id ? 'bg-primary text-on-primary shadow-md shadow-primary/20' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'}`}>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-3xl bg-surface-container-low p-5">
              <h4 className="mb-2 font-bold">Bộ lọc hiện tại</h4>
              <p className="text-sm text-on-surface-variant">Từ khóa: {keyword || 'Tất cả'}</p>
              <p className="text-sm text-on-surface-variant">Danh mục: {activeCategory || 'Tất cả'}</p>
              <p className="mt-2 text-sm text-on-surface-variant">Đăng nhập tài khoản khách hàng để thêm món vào giỏ và đặt hàng ngay.</p>
            </div>
          </div>
        </aside>

        <section className="flex-grow">
          <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="mb-2 font-headline text-display-lg font-bold leading-none tracking-tight text-on-surface">Thực đơn hôm nay</h1>
              <p className="text-body-lg text-on-surface-variant">Có {products.length} món đang phục vụ và giao nhanh trong ngày.</p>
            </div>
          </div>

          {error ? <div className="mb-8 rounded-2xl bg-red-50 px-4 py-3 text-red-700">{error}</div> : null}

          <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div key={product._id} className="group relative flex h-full flex-col rounded-lg bg-surface-container p-6 pt-0 transition-transform hover:-translate-y-2">
                <Link to={`/products/${product._id}`} className="relative -mt-10 mb-6 block aspect-square overflow-hidden rounded-xl shadow-2xl">
                  <img alt={product.name} className="h-full w-full object-cover duration-500 group-hover:scale-110" src={imageUrl(product.image)} />
                </Link>
                <div className="flex-grow space-y-2">
                  <h3 className="text-title-md font-bold leading-tight text-on-surface">{product.name}</h3>
                  <p className="line-clamp-2 text-body-lg text-on-surface-variant">{product.description || 'Chưa có mô tả.'}</p>
                  <p className="text-sm text-on-surface-variant">Danh mục: {product.category?.name || '-'}</p>
                  <p className="text-sm text-on-surface-variant">Tồn kho: {product.stock}</p>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-title-md font-black text-primary">{formatCurrency(product.price)}</span>
                  <button
                    onClick={async (event) => {
                      if (!user) {
                        notify('Đăng nhập để thêm món vào giỏ', 'info');
                        navigate('/login');
                        return;
                      }
                      setActiveAddId(product._id);
                      try {
                        await addToCart({ productId: product._id, quantity: 1 });
                        await refreshCartState();
                        animateAddToCart(event.currentTarget);
                        notify(`${product.name} đã được thêm vào giỏ`, 'success');
                        setTimeout(() => {
                          void openCartDrawer();
                        }, 320);
                      } catch (err) {
                        notify(err instanceof Error ? err.message : 'Không thể thêm món', 'error');
                      } finally {
                        setTimeout(() => setActiveAddId(''), 350);
                      }
                    }}
                    className={`rounded-full bg-primary-container p-3 text-on-primary-container transition-all active:scale-90 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-container/30 ${activeAddId === product._id ? 'scale-110 ring-4 ring-primary/20 animate-pulse-pop' : ''}`}
                  >
                    <span className="material-symbols-outlined">{activeAddId === product._id ? 'done' : 'add'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <MobileNav />
    </div>
  );
}
