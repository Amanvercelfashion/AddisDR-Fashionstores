import { useEffect, useState, useRef } from 'react';
import {
  ShieldCheck, Building2, Shirt,
  ArrowRight, Sparkles, Settings, Eye
} from 'lucide-react';
import axios from 'axios';

// ── Per-business card menu ────────────────────────────────────────────────────

function BusinessCardMenu({ biz, onClose }) {
  const ref = useRef();

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute top-8 right-0 w-48 bg-slate-800 border border-white/15 rounded-xl shadow-2xl z-20 py-1.5 overflow-hidden"
    >
      <a
        href={`/adminmanager?business=${biz.id}`}
        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/10 transition-colors"
        onClick={onClose}
      >
        <Settings size={14} className="text-blue-400 flex-shrink-0" />
        Admin Manager
      </a>
      <a
        href={`/store/${biz.subdomain}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/10 transition-colors"
        onClick={onClose}
      >
        <Eye size={14} className="text-slate-400 flex-shrink-0" />
        View Store
      </a>
    </div>
  );
}

function BusinessCard({ biz }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl p-4 transition-all flex items-center gap-4">
      {/* Logo */}
      {biz.logo_url ? (
        <img
          src={biz.logo_url}
          alt={biz.name}
          className="h-12 w-12 object-contain rounded-xl flex-shrink-0 bg-white/10"
        />
      ) : (
        <div className="h-12 w-12 bg-blue-600/30 rounded-xl flex items-center justify-center flex-shrink-0">
          <Building2 size={20} className="text-blue-400" />
        </div>
      )}

      {/* Info — clicking goes to store */}
      <a href={`/store/${biz.subdomain}`} className="flex-1 min-w-0 block">
        <p className="font-semibold text-white truncate">{biz.name}</p>
        {biz.tagline && (
          <p className="text-xs text-slate-400 truncate mt-0.5">{biz.tagline}</p>
        )}
        <p className="text-xs text-slate-500 font-mono mt-1">{biz.subdomain}</p>
      </a>

      {/* ☰ Hamburger button — always visible */}
      <div className="relative flex-shrink-0">
        <button
          onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); }}
          className="flex flex-col items-center justify-center gap-[5px] w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          aria-label={`Options for ${biz.name}`}
          title="Admin options"
        >
          <span className="block w-4 h-[2px] bg-white rounded-full" />
          <span className="block w-4 h-[2px] bg-white rounded-full" />
          <span className="block w-4 h-[2px] bg-white rounded-full" />
        </button>

        {menuOpen && (
          <BusinessCardMenu biz={biz} onClose={() => setMenuOpen(false)} />
        )}
      </div>
    </div>
  );
}

export default function PlatformHome() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/business/directory')
      .then(res => setBusinesses(res.data || []))
      .catch(() => setBusinesses([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex flex-col">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="bg-pink-600 rounded-lg p-1.5">
            <Shirt size={18} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg">FashionStore Hub</span>
        </div>
        <a
          href="/superadmin"
          className="flex items-center gap-2 text-sm text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
        >
          <ShieldCheck size={15} />
          Super Admin
        </a>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="inline-flex items-center gap-2 bg-pink-600/20 border border-pink-500/30 text-pink-300 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <Sparkles size={12} />
          Multi-tenant fashion store platform
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
          Fashion Stores &amp;<br className="hidden sm:block" /> Order Capture
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mb-10">
          Each fashion brand gets its own branded storefront. Customers browse collections and send orders directly to Telegram.
        </p>
        <a
          href="/superadmin"
          className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          <ShieldCheck size={18} />
          Go to Super Admin
          <ArrowRight size={16} />
        </a>
      </div>

      {/* Active stores directory */}
      <div className="max-w-5xl mx-auto w-full px-4 pb-16">
          <h2 className="text-center text-sm font-semibold text-slate-500 uppercase tracking-widest mb-6">
            Active Fashion Stores
          </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-2xl h-24 animate-pulse" />
            ))}
          </div>
        ) : businesses.length === 0 ? (
          <p className="text-center text-slate-600 text-sm py-8">
            No active fashion stores yet. Create one in the{' '}
            <a href="/superadmin" className="text-pink-400 hover:underline">Super Admin</a>.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {businesses.map(biz => (
              <BusinessCard key={biz.id} biz={biz} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-600">
        FashionStore Hub &mdash; White-label fashion catalog &amp; order capture
      </div>
    </div>
  );
}
