
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '@/types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, size?: string, color?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  applyPromoCode: (code: string) => Promise<{ success: boolean; discount: number; message: string }>;
  promoCode: string | null;
  discount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [discount, setDiscount] = useState<number>(0);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity = 1, size?: string, color?: string) => {
    setItems(prev => {
      const existingItem = prev.find(item => 
        item.product.id === product.id && 
        item.size === size && 
        item.color === color
      );

      if (existingItem) {
        return prev.map(item =>
          item.id === existingItem.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prev, {
        id: `${product.id}-${size || 'no-size'}-${color || 'no-color'}`,
        product,
        quantity,
        size,
        color
      }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev => prev.map(item =>
      item.id === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setItems([]);
    setPromoCode(null);
    setDiscount(0);
  };

  const getCartTotal = () => {
    const subtotal = items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    return subtotal - discount;
  };

  const getCartCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const applyPromoCode = async (code: string): Promise<{ success: boolean; discount: number; message: string }> => {
    // Vérification du code promo Team (5% de réduction)
    if (code.length === 6 && /^[A-Z]{3}[0-9]{3}$/.test(code)) {
      const subtotal = items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
      const discountAmount = subtotal * 0.05;
      
      setPromoCode(code);
      setDiscount(discountAmount);
      
      return {
        success: true,
        discount: discountAmount,
        message: 'Code promo appliqué ! 5% de réduction'
      };
    }

    return {
      success: false,
      discount: 0,
      message: 'Code promo invalide'
    };
  };

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    applyPromoCode,
    promoCode,
    discount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
