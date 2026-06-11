import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Package, FolderOpen,
  Menu, X, ChevronRight, BarChart2, ShoppingBag,
  ExternalLink, LogOut, Building2
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import AdminLogin from './AdminLogin';

const NAV_ITEMS = [
  { path: '/adminmanager', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/adminmanager/products', label: 'Products', icon: Package },
  { path: '/adminmanager/categories', label: 'Categories', icon: FolderOpen },
  { path: '/adminmanager/orders', label: 'Orders', icon: ShoppingBag },
];

function NoBusiness() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <Building2 size={48} className="text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">No Business Selected</h2>
        <p className="text-gray-500 text-sm mb-4">
          Access the admin panel via your business link.
        </p>
        <p className="text-xs text-gray-400 bg-gray-100 rounded-lg px-3 py-2 inline-block font-mono">
          /adminmanager?business=ID
        </p>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { business, businessId, loading: bizLoading } = useBusiness();
  const { isLoggedIn, logout } = useAdminAuth();

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  // Still loading business info
  if (bizLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // No business in URL/subdomain
  if (!businessId) return <NoBusiness />;

  // Not logged in → show password gate
  if (!isLoggedIn(businessId)) return <AdminLogin />;

  const bizParam = `?business=${businessId}`;
  const storeHref = `/store${bizParam}`;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-gray-900 text-white z-50 flex flex-col
        transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:flex
      `}>
        {/* Brand header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
          <div className="flex items-center gap-2.5 min-w-0">
            {business?.logo_url ? (
              <img src={business.logo_url} alt="" className="h-8 w-8 object-contain rounded-lg flex-shrink-0" />
            ) : (
              <div className="bg-blue-600 rounded-lg p-1.5 flex-shrink-0">
                <BarChart2 size={18} />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-bold text-sm leading-tight truncate">{business?.name || 'Admin Panel'}</p>
              <p className="text-xs text-gray-400 leading-tight">Admin Panel</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.path}
                to={`${item.path}${bizParam}`}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {item.label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="px-3 pb-4 border-t border-gray-700 pt-3 space-y-1">
          <a
            href={storeHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <ExternalLink size={16} />
            View Store
          </a>
          <button
            onClick={() => { logout(businessId); setSidebarOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="bg-white border-b px-4 py-3 flex items-center gap-3 lg:hidden sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-500 hover:text-gray-700" aria-label="Open menu">
            <Menu size={22} />
          </button>
          {business?.logo_url ? (
            <img src={business.logo_url} alt="" className="h-7 w-7 object-contain rounded-md" />
          ) : null}
          <span className="font-bold text-gray-900 truncate">{business?.name || 'Admin Panel'}</span>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
