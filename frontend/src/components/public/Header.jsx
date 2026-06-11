import { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Settings, ExternalLink } from 'lucide-react';
import { useBasket } from '../../context/BasketContext';
import { useBusiness } from '../../context/BusinessContext';

function AdminMenu({ businessId, onClose }) {
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
      className="absolute right-0 top-12 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1.5 overflow-hidden"
    >
      <a
        href={`/adminmanager?business=${businessId}`}
        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
        style={{
          color: 'var(--color-primary)',
          backgroundColor: 'rgba(var(--color-primary-rgb),0.08)',
        }}
        onClick={onClose}
      >
        <Settings size={14} />
        Admin Manager
      </a>
      <a
        href={`/store?business=${businessId}`}
        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        onClick={onClose}
      >
        <ExternalLink size={14} className="text-gray-400" />
        View Store
      </a>
    </div>
  );
}

export default function Header({ company }) {
  const { totalCount, setIsOpen } = useBasket();
  const { businessId } = useBusiness();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="shadow-sm sticky top-0 z-40"
      style={{ backgroundColor: 'var(--color-tertiary)' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          {company?.logo_url ? (
            <img
              src={company.logo_url}
              alt={company.name}
              className="h-14 w-24 object-contain rounded-lg bg-white/20 border border-white/30 p-1 flex-shrink-0"
            />
          ) : (
            <div
              className="h-14 w-24 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {/* letter on primary bg — use --on-primary */}
              <span className="font-bold text-2xl" style={{ color: 'var(--on-primary)' }}>
                {company?.name?.[0] || 'S'}
              </span>
            </div>
          )}
          <div>
            {/* Store name — forced contrast on tertiary bg */}
            <h1
              className="font-bold text-lg leading-tight"
              style={{ color: 'var(--on-tertiary)' }}
            >
              {company?.name || 'My Store'}
            </h1>
            {company?.tagline && (
              <p
                className="text-xs leading-tight"
                style={{ color: 'var(--on-tertiary)', opacity: 0.75 }}
              >
                {company.tagline}
              </p>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">

          {/* ☰ Admin hamburger */}
          {businessId && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="flex flex-col items-center justify-center gap-[5px] w-9 h-9 rounded-lg transition-colors"
                style={{ backgroundColor: 'rgba(var(--on-tertiary-rgb, 255 255 255),0.15)' }}
                aria-label="Admin menu"
                title="Admin Manager"
              >
                {/* Lines use --on-tertiary so they're always visible */}
                <span className="block w-4 h-[2px] rounded-full" style={{ backgroundColor: 'var(--on-tertiary)' }} />
                <span className="block w-4 h-[2px] rounded-full" style={{ backgroundColor: 'var(--on-tertiary)' }} />
                <span className="block w-4 h-[2px] rounded-full" style={{ backgroundColor: 'var(--on-tertiary)' }} />
              </button>

              {menuOpen && (
                <AdminMenu businessId={businessId} onClose={() => setMenuOpen(false)} />
              )}
            </div>
          )}

          {/* Basket button */}
          <button
            onClick={() => setIsOpen(true)}
            className="relative flex items-center gap-2 hover:opacity-90 px-4 py-2 rounded-full transition-opacity"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--on-primary)',
            }}
            aria-label={`Open basket, ${totalCount} items`}
          >
            <ShoppingCart size={18} />
            <span className="text-sm font-medium hidden sm:inline">Basket</span>
            {totalCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {totalCount > 99 ? '99+' : totalCount}
              </span>
            )}
          </button>

        </div>
      </div>
    </header>
  );
}
