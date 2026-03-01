import React, { createContext, useContext, useState, useCallback } from 'react';
import type { MenuItem, CartItem } from '@/data/mockData';

interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem, modifiers?: CartItem['modifiers'], instructions?: string) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, qty: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  tableNumber: number;
  setTableNumber: (n: number) => void;
  orderIds: string[];
  addPlacedOrderId: (id: string) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumberState] = useState(() => {
    const saved = localStorage.getItem('tableNumber');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [orderIds, setOrderIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('orderIds');
    return saved ? JSON.parse(saved) : [];
  });

  const setTableNumber = useCallback((n: number) => {
    setTableNumberState(n);
    localStorage.setItem('tableNumber', n.toString());
  }, []);

  const addPlacedOrderId = useCallback((id: string) => {
    setOrderIds(prev => {
      const next = prev.includes(id) ? prev : [...prev, id];
      localStorage.setItem('orderIds', JSON.stringify(next));
      return next;
    });
  }, []);

  const addItem = useCallback((menuItem: MenuItem, modifiers: CartItem['modifiers'] = [], instructions?: string) => {
    setItems(prev => {
      const existing = prev.findIndex(i => i.menuItem.id === menuItem.id && JSON.stringify(i.modifiers) === JSON.stringify(modifiers));
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + 1 };
        return updated;
      }
      return [...prev, { menuItem, quantity: 1, modifiers, specialInstructions: instructions }];
    });
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateQuantity = useCallback((index: number, qty: number) => {
    if (qty <= 0) return removeItem(index);
    setItems(prev => prev.map((item, i) => i === index ? { ...item, quantity: qty } : item));
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, item) => {
    return sum + item.menuItem.price * item.quantity;
  }, 0);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      items, addItem, removeItem, updateQuantity, clearCart, 
      total, itemCount, tableNumber, setTableNumber,
      orderIds, addPlacedOrderId
    }}>
      {children}
    </CartContext.Provider>
  );
};
