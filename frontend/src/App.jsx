import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

            {/* ── Business store + admin (business context) ─── */}
            <Route
              path="/store"
              element={
                <BusinessProvider>
                  <ThemeProvider>
                    <BasketProvider>
                      <StorePage />
                    </BasketProvider>
                  </ThemeProvider>
                </BusinessProvider>
              }
            />
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

            {/* ── 404 ──────────────────────────────────────── */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </AdminAuthProvider>
      </SuperAdminProvider>
    </BrowserRouter>
  );
}
