import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [stockIssues, setStockIssues] = useState([]);

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    const currentQuantityInCart = cartItems.find(item => item._id === product._id)?.quantity || 0;
    const newTotalQuantity = currentQuantityInCart + quantity;

    if (product.stock < newTotalQuantity) {
      return {
        success: false,
        message: `Stock insuficiente. Disponible: ${product.stock}`,
        availableStock: product.stock
      };
    }

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item._id === product._id);

      if (existingItem) {
        return prevItems.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity, stock: product.stock }
            : item
        );
      }

      return [...prevItems, { ...product, quantity }];
    });

    return { success: true };
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item._id !== productId));
    setStockIssues((prev) => prev.filter(issue => issue.productId !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return { success: true };
    }

    const item = cartItems.find(cartItem => cartItem._id === productId);
    if (item && item.stock < quantity) {
      return {
        success: false,
        message: `Stock insuficiente. Disponible: ${item.stock}`,
        availableStock: item.stock
      };
    }

    setCartItems((prevItems) =>
      prevItems.map((cartItem) =>
        cartItem._id === productId ? { ...cartItem, quantity } : cartItem
      )
    );

    return { success: true };
  };

  const clearCart = () => {
    setCartItems([]);
    setStockIssues([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const validateCartStock = useCallback(async () => {
    if (cartItems.length === 0) {
      setStockIssues([]);
      return { valid: true, issues: [] };
    }

    try {
      const response = await api.post('/products/check-stock', {
        items: cartItems.map(item => ({
          productId: item._id,
          quantity: item.quantity
        }))
      });

      const issues = response.data.data.stockIssues || [];
      setStockIssues(issues);

      return {
        valid: issues.length === 0,
        issues
      };
    } catch (error) {
      console.error('Error validating cart stock:', error);
      return { valid: true, issues: [] };
    }
  }, [cartItems]);

  const value = {
    cartItems,
    stockIssues,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    validateCartStock
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
