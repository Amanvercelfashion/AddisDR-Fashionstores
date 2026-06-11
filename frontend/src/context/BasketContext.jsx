import { createContext, useContext, useState, useCallback } from 'react';

const BasketContext = createContext(null);

export function BasketProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((product) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId) => {
    setItems(prev => prev.filter(i => i.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity < 1) return;
    setItems(prev =>
      prev.map(i => i.id === productId ? { ...i, quantity } : i)
    );
  }, []);

  const clearBasket = useCallback(() => {
    setItems([]);
  }, []);

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <BasketContext.Provider value={{
      items,
      isOpen,
      setIsOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearBasket,
      totalCount,
      totalPrice,
    }}>
      {children}
    </BasketContext.Provider>
  );
}

export function useBasket() {
  const ctx = useContext(BasketContext);
  if (!ctx) throw new Error('useBasket must be used inside BasketProvider');
  return ctx;
}
