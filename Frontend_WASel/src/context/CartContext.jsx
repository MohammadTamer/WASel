import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user, isAuthenticated, t } = useAuth();
  const [cart, setCart] = useState(() => {
    if (!localStorage.getItem('wasel_token')) {
      return { storeId: null, storeName: '', deliveryFee: 0, items: [] };
    }
    const saved = localStorage.getItem('wasel_cart');
    return saved ? JSON.parse(saved) : { storeId: null, storeName: '', deliveryFee: 0, items: [] };
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Clear cart whenever user logs out or changes role
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'CUSTOMER') {
      setCart({ storeId: null, storeName: '', deliveryFee: 0, items: [] });
      localStorage.removeItem('wasel_cart');
      setIsDrawerOpen(false);
    }
  }, [isAuthenticated, user?.role]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'CUSTOMER') {
      localStorage.setItem('wasel_cart', JSON.stringify(cart));
    }
  }, [cart, isAuthenticated, user?.role]);

  const addToCart = (product, store) => {
    if (!isAuthenticated || user?.role !== 'CUSTOMER') {
      return false;
    }

    setCart(prev => {
      // If adding from a different store, reset cart to new store
      if (prev.storeId && prev.storeId !== store.id && prev.items.length > 0) {
        if (!window.confirm(t('cartConflictConfirm'))) {
          return prev;
        }
        return {
          storeId: store.id,
          storeName: store.name,
          deliveryFee: store.deliveryFee || 0,
          items: [{ product, quantity: 1, note: '' }]
        };
      }

      const existingIndex = prev.items.findIndex(i => i.product.id === product.id);
      let newItems = [...prev.items];
      if (existingIndex > -1) {
        newItems[existingIndex].quantity += 1;
      } else {
        newItems.push({ product, quantity: 1, note: '' });
      }

      return {
        storeId: store.id,
        storeName: store.name,
        deliveryFee: store.deliveryFee || 0,
        items: newItems
      };
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart(prev => {
      const newItems = prev.items.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);

      return {
        ...prev,
        items: newItems,
        storeId: newItems.length === 0 ? null : prev.storeId,
        storeName: newItems.length === 0 ? '' : prev.storeName,
        deliveryFee: newItems.length === 0 ? 0 : prev.deliveryFee
      };
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => {
      const newItems = prev.items.filter(item => item.product.id !== productId);
      return {
        ...prev,
        items: newItems,
        storeId: newItems.length === 0 ? null : prev.storeId,
        storeName: newItems.length === 0 ? '' : prev.storeName,
        deliveryFee: newItems.length === 0 ? 0 : prev.deliveryFee
      };
    });
  };

  const clearCart = () => {
    setCart({ storeId: null, storeName: '', deliveryFee: 0, items: [] });
  };

  const totalItemsCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const totalAmount = subtotal + (cart.deliveryFee || 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      totalItemsCount,
      subtotal,
      totalAmount,
      isDrawerOpen,
      setIsDrawerOpen
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
