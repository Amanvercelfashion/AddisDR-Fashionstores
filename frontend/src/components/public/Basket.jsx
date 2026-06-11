import { X, Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import { useBasket } from '../../context/BasketContext';
import { useBusiness } from '../../context/BusinessContext';
import { useNavigate } from 'react-router-dom';

export default function Basket() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalCount, totalPrice } = useBasket();
  const { businessId } = useBusiness();
  const navigate = useNavigate();

  const formatPrice = (n) => Number(n).toLocaleString('en-US');

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50 transition-opacity"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-blue-600" />
            <h2 className="font-bold text-gray-900 text-lg">Your Order</h2>
            {totalCount > 0 && (
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {totalCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
            aria-label="Close basket"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <ShoppingCart size={40} className="mb-2 opacity-40" />
              <p className="text-sm">Your order is empty</p>
              <p className="text-xs mt-1">Add products to get started</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                {/* Thumbnail */}
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-14 w-14 object-cover rounded-lg flex-shrink-0"
                  />
                ) : (
                  <div className="h-14 w-14 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <ShoppingCart size={16} className="text-gray-400" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500 font-mono">{item.code}</p>
                  <p className="text-sm font-bold text-blue-700 mt-0.5">
                    {formatPrice(item.price * item.quantity)} ETB
                  </p>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-400 hover:text-red-600 p-0.5"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="h-6 w-6 rounded-md bg-gray-200 hover:bg-gray-300 flex items-center justify-center disabled:opacity-40"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={10} />
                    </button>
                    <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-6 w-6 rounded-md bg-blue-100 hover:bg-blue-200 text-blue-700 flex items-center justify-center"
                      aria-label="Increase quantity"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Total items:</span>
              <span className="font-medium">{totalCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Estimated total:</span>
              <span className="font-bold text-blue-700 text-lg">{formatPrice(totalPrice)} ETB</span>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                navigate(businessId ? `/checkout?business=${businessId}` : '/checkout');
              }}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3"
            >
              Proceed to Order
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
