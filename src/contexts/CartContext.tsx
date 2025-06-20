
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, size?: string, color?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
  getCartTotal: () => number;
  getCartCount: () => number;
  applyPromoCode: (code: string) => Promise<{ success: boolean; message: string }>;
  promoCode: string | null;
  discount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [discount, setDiscount] = useState<number>(0);
  const { toast } = useToast();

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedPromoCode = localStorage.getItem('promoCode');
    const savedDiscount = localStorage.getItem('discount');
    
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
    
    if (savedPromoCode) {
      setPromoCode(savedPromoCode);
    }
    
    if (savedDiscount) {
      setDiscount(parseFloat(savedDiscount));
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // Save promo code and discount to localStorage
  useEffect(() => {
    if (promoCode) {
      localStorage.setItem('promoCode', promoCode);
      localStorage.setItem('discount', discount.toString());
    } else {
      localStorage.removeItem('promoCode');
      localStorage.removeItem('discount');
    }
  }, [promoCode, discount]);

  const addToCart = (product: Product, quantity = 1, size?: string, color?: string) => {
    console.log('Adding to cart:', { product, quantity, size, color });
    
    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        item => item.product.id === product.id && 
                item.size === size && 
                item.color === color
      );

      if (existingItemIndex >= 0) {
        // Update existing item
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += quantity;
        return newItems;
      } else {
        // Add new item
        const newItem: CartItem = {
          id: `${product.id}-${size || ''}-${color || ''}`,
          product,
          quantity,
          size,
          color
        };
        return [...prevItems, newItem];
      }
    });

    toast({
      title: "Produit ajouté",
      description: `${product.name} a été ajouté au panier`,
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== productId));
    toast({
      title: "Produit retiré",
      description: "Le produit a été retiré du panier",
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setPromoCode(null);
    setDiscount(0);
    localStorage.removeItem('cart');
    localStorage.removeItem('promoCode');
    localStorage.removeItem('discount');
    toast({
      title: "Panier vidé",
      description: "Tous les articles ont été retirés du panier",
    });
  };

  const getTotalPrice = () => {
    const subtotal = items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    return subtotal - discount;
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  // Alias methods for compatibility
  const getCartTotal = () => getTotalPrice();
  const getCartCount = () => getItemCount();

  const applyPromoCode = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Check if it's a team member promo code
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('*')
        .eq('promo_code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (teamMember) {
        const subtotal = items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
        const discountAmount = Math.round(subtotal * 0.05); // 5% discount
        
        setPromoCode(code.toUpperCase());
        setDiscount(discountAmount);
        
        return {
          success: true,
          message: `Code promo ${code.toUpperCase()} appliqué! Réduction de 5%`
        };
      }

      return {
        success: false,
        message: "Code promo invalide ou expiré"
      };
    } catch (error) {
      console.error('Error applying promo code:', error);
      return {
        success: false,
        message: "Erreur lors de l'application du code promo"
      };
    }
  };

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getItemCount,
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

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
