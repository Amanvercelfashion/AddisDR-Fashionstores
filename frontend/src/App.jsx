import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { getBusiness } from './api';
import { BasketProvider } from './context/BasketContext';
import { BusinessProvider } from './context/BusinessContext';
import { SuperAdminProvider } from './context/SuperAdminContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Platform home
import PlatformHome from './pages/PlatformHome';

// Business storefront
import StorePage from './pages/StorePage';
import CheckoutPage from './pages/CheckoutPage';

// Business admin
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ProductsPage from './pages/admin/ProductsPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import OrdersPage from './pages/admin/OrdersPage';

// Super Admin
import SuperAdminLogin from './pages/superadmin/SuperAdminLogin';
import SuperAdminLayout from './pages/superadmin/SuperAdminLayout';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import BusinessesPage from './pages/superadmin/BusinessesPage';

function OldStoreRedirect() {
  const { subdomain } = useParams();
  return <Navigate to={`/${subdomain}`} replace />;
}

function OldStoreQueryRedirect() {
  const [params] = useState(() => new URLSearchParams(window.location.search));
  const bizId = params.get('business');
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!bizId) { setDone(true); return; }
    getBusiness(bizId).then(biz => {
      window.location.replace(`/${biz.subdomain}`);
    }).catch(() => setDone(true));
  }, [bizId]);
  if (done) return <Navigate to="/" replace />;
  return <div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
}

function StoreRoute() {
  const { subdomain } = useParams();
  return (
    <BusinessProvider subdomain={subdomain}>
      <ThemeProvider>
        <BasketProvider>
          <StorePage />
        </BasketProvider>
      </ThemeProvider>
    </BusinessProvider>
  );
}

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
      <p className="text-gray-500 mb-6">Page not found</p>
      <a href="/" className="btn-primary inline-block">Back to Home</a>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <SuperAdminProvider>
        <AdminAuthProvider>
          <Routes>

            {/* ── Platform home ─────────────────────────────── */}
            <Route path="/" element={<PlatformHome />} />

            {/* ── Business storefront ──────────────────────── */}
            {/* Redirect old /store?business=X → /subdomain */}
            <Route path="/store" element={<OldStoreQueryRedirect />} />
            {/* Redirect old /store/:subdomain → /:subdomain */}
            <Route path="/store/:subdomain" element={<OldStoreRedirect />} />
            <Route
              path="/checkout"
              element={
                <BusinessProvider>
                  <ThemeProvider>
                    <BasketProvider>
                      <CheckoutPage />
                    </BasketProvider>
                  </ThemeProvider>
                </BusinessProvider>
              }
            />

            {/* Admin panel — each route gets BusinessProvider */}
            <Route
              path="/adminmanager"
              element={
                <BusinessProvider>
                  <AdminLayout />
                </BusinessProvider>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="orders" element={<OrdersPage />} />
            </Route>

            {/* ── Super Admin ───────────────────────────────── */}
            <Route path="/superadmin" element={<SuperAdminLogin />} />
            <Route path="/superadmin" element={<SuperAdminLayout />}>
              <Route path="dashboard" element={<SuperAdminDashboard />} />
              <Route path="businesses" element={<BusinessesPage />} />
            </Route>

            {/* ── Store route (catch-all for single-segment paths) ─── */}
            <Route path="/:subdomain" element={<StoreRoute />} />

            {/* ── 404 ──────────────────────────────────────── */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </AdminAuthProvider>
      </SuperAdminProvider>
    </BrowserRouter>
  );
}
