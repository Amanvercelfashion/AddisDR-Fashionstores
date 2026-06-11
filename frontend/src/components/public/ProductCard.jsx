import { ShoppingCart, ImageOff } from 'lucide-react';
import { useBasket } from '../../context/BasketContext';
import { contrastText } from '../../utils/colorContrast';
import { useTheme } from '../../context/ThemeContext';

export default function ProductCard({ product }) {
  const { addItem, items } = useBasket();
  const { primary, secondary } = useTheme();
  const inBasket = items.some(i => i.id === product.id);

  const formatPrice = (price) => Number(price).toLocaleString('en-US');

  // Card bg is always white (#ffffff) — check if secondary is readable on white
  // If secondary is too light (low contrast on white), fall back to #111
  const textOnWhite = (hex) => {
    if (!hex) return '#111111';
    // Simple luminance check — if color is too light (>0.7), use dark fallback
    const clean = hex.replace('#', '');
    const r = parseInt(clean.slice(0, 2), 16) / 255;
    const g = parseInt(clean.slice(2, 4), 16) / 255;
    const b = parseInt(clean.slice(4, 6), 16) / 255;
    const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return L > 0.6 ? '#111111' : hex;
  };

  const safeSecondary = textOnWhite(secondary);
  const safePrimary   = textOnWhite(primary);

  return (
    <div className="card overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative bg-gray-100 aspect-[4/3] overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
            <ImageOff size={40} />
            <span className="text-xs mt-1">No image</span>
          </div>
        )}
        {/* Product code badge — primary bg, on-primary text */}
        <span
          className="absolute top-2 left-2 text-xs font-mono px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--on-primary)',
          }}
        >
          {product.code}
        </span>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1 gap-2">
        <div>
          <h3
            className="font-semibold text-sm leading-snug line-clamp-2"
            style={{ color: safeSecondary }}
          >
            {product.name}
          </h3>
          {product.category_name && (
            <span
              className="text-xs font-medium mt-0.5 block"
              style={{ color: safePrimary, opacity: 0.85 }}
            >
              {product.category_name}
            </span>
          )}
        </div>

        {product.description && (
          <p
            className="text-xs line-clamp-2 flex-1"
            style={{ color: safeSecondary, opacity: 0.65 }}
          >
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
          {/* Price */}
          <span className="font-bold text-base" style={{ color: safeSecondary }}>
            {formatPrice(product.price)}{' '}
            <span className="text-xs font-normal opacity-60">ETB</span>
          </span>

          {/* Add button */}
          <button
            onClick={() => addItem(product)}
            style={inBasket ? {} : {
              backgroundColor: 'var(--color-primary)',
              color: 'var(--on-primary)',
            }}
            className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
              inBasket
                ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                : 'hover:opacity-90'
            }`}
            aria-label={`Add ${product.name} to order`}
          >
            <ShoppingCart size={14} />
            {inBasket ? 'Added' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
