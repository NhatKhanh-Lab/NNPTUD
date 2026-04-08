import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import { fetchCategories, fetchProducts, formatCurrency, imageUrl } from '../lib/api';
import type { Category, Product } from '../types';

export default function Landing() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchCategories().then((res) => setCategories(res.data.slice(0, 6))).catch(() => setCategories([]));
    fetchProducts().then((res) => setProducts(res.data.slice(0, 6))).catch(() => setProducts([]));
  }, []);

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 pb-32">
        <section className="grid grid-cols-1 items-center gap-12 py-12 md:py-20 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <span className="mb-6 inline-block rounded-full bg-primary-container/20 px-4 py-1 text-sm font-bold text-primary">
              Giao món nóng nhanh trong khoảng 20 phút
            </span>
            <h1 className="mb-6 text-5xl font-bold leading-tight text-on-background md:text-7xl">
              Thưởng thức
              <br />
              <span className="italic text-primary">món ngon</span>
              <br />
              mỗi ngày
            </h1>
            <p className="mb-10 max-w-md text-lg leading-relaxed text-on-surface-variant">
              Khám phá thực đơn đa dạng từ món chính, đồ uống đến món ăn vặt. Đặt món nhanh, theo dõi đơn hàng và nhận cập nhật trạng thái ngay trên website.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="rounded-xl bg-gradient-to-br from-primary to-primary-container px-10 py-4 text-lg font-bold text-on-primary shadow-xl shadow-primary/20 transition-transform hover:scale-105">
                Đặt món ngay
              </Link>
              <Link to="/orders" className="rounded-xl bg-surface-container-high px-10 py-4 text-lg font-bold text-on-surface-variant transition-colors hover:bg-surface-container-highest">
                Theo dõi đơn hàng
              </Link>
            </div>
          </div>
          <div className="relative order-1 lg:order-2">
            <div className="relative z-10 aspect-square overflow-hidden rounded-xl shadow-2xl">
              <img alt="Món ăn nổi bật" className="h-full w-full object-cover" src={imageUrl(products[0]?.image)} />
            </div>
            <div className="absolute -bottom-6 -left-6 z-20 flex items-center gap-4 rounded-lg bg-white p-4 shadow-xl">
              <div className="h-16 w-16 overflow-hidden rounded-full">
                <img alt="Món ăn nổi bật" className="h-full w-full object-cover" src={imageUrl(products[1]?.image)} />
              </div>
              <div>
                <p className="text-sm font-bold text-black">{products[1]?.name || 'Món được yêu thích hôm nay'}</p>
                <p className="font-bold text-primary">{formatCurrency(products[1]?.price || 0)}</p>
              </div>
            </div>
            <div className="-z-10 absolute -right-10 -top-10 h-64 w-64 rounded-full bg-primary-container/20 blur-3xl" />
          </div>
        </section>

        <section className="mb-16">
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-orange-600 to-orange-400 p-8 text-white md:p-12">
            <div className="z-10 max-w-3xl">
              <h2 className="mb-4 text-3xl font-black md:text-4xl">Đặt món gọn, theo dõi đơn rõ ràng</h2>
              <p className="mb-6 text-xl opacity-90">
                Chọn món trong vài bước, kiểm tra giỏ hàng nhanh và nhận thông báo khi đơn được xác nhận, giao đi hoặc hoàn tất.
              </p>
              <div className="flex flex-wrap gap-4">
                <span className="rounded-lg border border-white/30 bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur-md">Thực đơn trực quan</span>
                <span className="rounded-lg border border-white/30 bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur-md">Cập nhật trạng thái theo thời gian thực</span>
                <span className="rounded-lg border border-white/30 bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur-md">Quản lý đơn hàng thuận tiện</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Danh mục món ăn</h2>
            <Link className="flex items-center gap-1 font-semibold text-primary" to="/products">Xem tất cả</Link>
          </div>
          <div className="no-scrollbar flex flex-nowrap gap-4 overflow-x-auto pb-4">
            {categories.map((category) => (
              <Link key={category._id} to={`/products?category=${category._id}`} className="flex-shrink-0 rounded-sm bg-surface-container-high px-8 py-3 font-medium text-on-surface-variant transition-all hover:bg-orange-100">
                {category.name}
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-20">
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="mb-2 text-3xl font-bold">Món nổi bật</h2>
              <p className="text-on-surface-variant">Một vài lựa chọn đang được quan tâm nhiều để bạn bắt đầu nhanh hơn.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div key={product._id} className="group rounded-lg bg-surface-container-low p-6 transition-colors duration-300 hover:bg-surface-container">
                <div className="-mt-12 relative mb-6 transition-transform duration-500 group-hover:-translate-y-2">
                  <img alt={product.name} className="aspect-[4/3] w-full rounded-lg object-cover shadow-xl shadow-orange-900/10" src={imageUrl(product.image)} />
                </div>
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="mb-1 text-xl font-bold">{product.name}</h3>
                    <p className="text-sm text-on-surface-variant">{product.category?.name || 'Chưa phân loại'}</p>
                  </div>
                  <span className="text-xl font-black text-primary">{formatCurrency(product.price)}</span>
                </div>
                <p className="mb-4 text-sm text-on-surface-variant">Tồn kho: {product.stock}</p>
                <Link to={`/products/${product._id}`} className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-orange-600 shadow-md transition-all hover:bg-orange-600 hover:text-white">
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>
      <MobileNav />
    </div>
  );
}
