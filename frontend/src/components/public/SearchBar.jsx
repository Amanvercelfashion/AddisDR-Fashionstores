import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: 'var(--color-secondary)', opacity: 0.5 }}
      />
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search products..."
        className="input-field pl-9 pr-8"
        style={{ color: 'var(--color-secondary)' }}
        aria-label="Search products"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-80"
          style={{ color: 'var(--color-secondary)', opacity: 0.5 }}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
