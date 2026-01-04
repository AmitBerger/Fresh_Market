import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCart, addToCart as apiAddToCart, updateCartItem, type Cart } from '../services/api';

interface CartContextType {
  cartCount: number;
  cart: Cart | null;
  refreshCart: () => void;
  addToCartGlobal: (productId: number) => Promise<void>;
  updateQuantityGlobal: (itemId: number, newQuantity: number) => Promise<void>;
  getItemQuantity: (productId: number) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [cart, setCart] = useState<Cart | null>(null);

  const refreshCart = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        setCartCount(0);
        setCart(null);
        return;
      }
      
      const cartData = await getCart();
      setCart(cartData);
      const count = cartData.items.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(count);
    } catch (error) {
      console.log('No active cart');
      setCartCount(0);
      setCart(null);
    }
  };

  const addToCartGlobal = async (productId: number) => {
    await apiAddToCart(productId, 1);
    await refreshCart();
  };

  const updateQuantityGlobal = async (itemId: number, newQuantity: number) => {
    await updateCartItem(itemId, newQuantity);
    await refreshCart();
  };

  const getItemQuantity = (productId: number) => {
    if (!cart) return 0;
    const item = cart.items.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  useEffect(() => {
    refreshCart();
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, cart, refreshCart, addToCartGlobal, updateQuantityGlobal, getItemQuantity }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};