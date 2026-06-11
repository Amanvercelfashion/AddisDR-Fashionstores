import { useState, useEffect, useCallback } from 'react';
import { Package, AlertCircle } from 'lucide-react';
import Header from '../components/public/Header';
import Footer from '../components/public/Footer';
import ProductCard from '../components/public/ProductCard';
import CategoryFilter from '../components/public/CategoryFilter';
import SearchBar from '../components/public/SearchBar';
import Basket from '../components/public/Basket';
import { useBusiness } from '../context/BusinessContext';
import { useTheme } from '../context/ThemeContext';
import { getProducts, getCategories } from '../api';
import { contrastText } from '../utils/colorContrast';

export default function StorePage() {
  const { business, businessId, loading: bizLoading, error: bizError } = useBusiness();
  const { secondary } = useTheme();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Page background is white — ensure secondary is readable on white
  // contrastText(secondary) gives black or white; we want the colour itself
  // if it has enough contrast on white, otherwise fall back to #111
  const safeSecondary = (() => {
    if (!secondary) return '#111111';
    const clean = secondary.replace('#', '');
    if (clean.length !== 6) return '#111111';
    const r = parseInt(clean.slice(0, 2), 16) / 255;
    const g = parseInt(clean.slice(2, 4), 16) / 255;
    const b = parseInt(clean.slice(4, 6), 16) / 255;
    const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return L > 0.55 ? '#111111' : secondary;
  })();

  useEffect(() => {
    if (!businessId) return;
    getCategories(businessId).then(setCategories).catch(console.error);
  }, [businessId]);

  const loadProducts = useCallback(() => {
    if (!businessId) return;
    setLoading(true);
    const params = {};
    if (activeCategory !== 'all') params.category = activeCategory;
    if (search.trim()) params.search = search.trim();
    getProducts(businessId, params)
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [businessId, activeCategory, search]);

  useEffect(() => {
    const timer = setTimeout(loadProducts, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [loadProducts, search]);

  if (bizLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (bizError || !businessId) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">Store Not Found</h2>
        <p className="text-gray-500 text-sm">
          {bizError || 'No business selected. Add ?business=ID to the URL.'}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header company={business} />
      <Basket />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold" style={{ color: safeSecondary }}>
            Our Collection
          </h2>
          <p className="text-sm mt-1" style={{ color: safeSecondary, opacity: 0.65 }}>
            Browse our fashion collection and place your order
          </p>
        </div>

        {/* Search + Category filter */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1">
            <SearchBar value={search} onChange={setSearch} />
          </div>
          <CategoryFilter
            categories={categories}
            active={activeCategory}
            onChange={setActiveCategory}
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 rounded mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20"
            style={{ color: safeSecondary, opacity: 0.5 }}
          >
            <Package size={56} className="mb-3" />
            <p className="text-lg font-medium">No fashion items found</p>
            {search && (
              <p className="text-sm mt-1">
                No results for &quot;{search}&quot;.{' '}
                <button onClick={() => setSearch('')} className="underline hover:opacity-80">
                  Clear search
                </button>
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer company={business} />
    </div>
  );
}
