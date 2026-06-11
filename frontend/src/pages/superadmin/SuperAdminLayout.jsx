import { useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Menu, X, ShieldCheck, LogOut, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useSuperAdmin } from '../../context/SuperAdminContext';

const NAV = [
  { path: '/superadmin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/superadmin/businesses', label: 'Businesses', icon: Building2 },
];

export default function SuperAdminLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, logout, admin } = useSuperAdmin();

  useEffect(() => {
    if (!isLoggedIn) navigate('/superadmin');
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-50 flex flex-col transform transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 rounded-lg p-1.5"><ShieldCheck size={18} /></div>
            <span className="font-bold text-sm">Super Admin</span>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden text-slate-400 hover:text-white"><X size={18} /></button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {NAV.map(item => {
            const Icon = item.icon;
            const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link key={item.path} to={item.path} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                <Icon size={18} />
                {item.label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-4 border-t border-slate-700 pt-3 space-y-2">
          <p className="text-xs text-slate-500 px-3">Logged in as <span className="text-slate-300">{admin?.username}</span></p>
          <button
            onClick={() => { logout(); navigate('/superadmin'); }}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b px-4 py-3 flex items-center gap-3 lg:hidden sticky top-0 z-30">
          <button onClick={() => setOpen(true)} className="text-slate-500 hover:text-slate-700"><Menu size={22} /></button>
          <span className="font-bold text-slate-900">Super Admin</span>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
