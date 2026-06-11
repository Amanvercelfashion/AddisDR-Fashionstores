import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, LayoutGrid } from 'lucide-react';

export default function CategoryFilter({ categories, active, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  const allOption = { id: 'all', name: 'All Products' };
  const options = [allOption, ...categories];

  const activeLabel = active === 'all'
    ? 'All Products'
    : (categories.find(c => c.name === active)?.name || 'All Products');

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (cat) => {
    onChange(cat.id === 'all' ? 'all' : cat.name);
    setOpen(false);
  };

  return (
    <div className="relative inline-block" ref={ref}>
      {/* Trigger button — secondary color when closed, primary when open */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors min-w-44 justify-between"
        style={open
          ? { backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)', color: 'var(--on-primary)' }
          : { backgroundColor: 'white', borderColor: 'var(--color-secondary)', color: 'var(--color-secondary)', opacity: 1 }
        }
      >
        <span className="flex items-center gap-2">
          <LayoutGrid size={15} style={{ opacity: open ? 1 : 0.6 }} />
          {activeLabel}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-30 py-1.5 overflow-hidden">
          {options.map(cat => {
            const isActive = cat.id === 'all' ? active === 'all' : active === cat.name;
            return (
              <button
                key={cat.id}
                onClick={() => handleSelect(cat)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-gray-50"
                style={{
                  color: isActive ? 'var(--color-primary)' : 'var(--color-secondary)',
                  fontWeight: isActive ? 600 : 400,
                  backgroundColor: isActive ? 'rgba(var(--color-primary-rgb),0.06)' : undefined,
                }}
              >
                {cat.name}
                {isActive && (
                  <Check size={14} className="flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
