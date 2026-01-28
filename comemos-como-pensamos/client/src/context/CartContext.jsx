import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

// Generate unique cart item key based on product and variant
const getCartItemKey = (productId, variantId) => {
  return variantId ? `${productId}_${variantId}` : productId;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [stockIssues, setStockIssues] = useState([]);

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        setCartItems([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback((product, quantity = 1) => {
    const itemKey = getCartItemKey(product._id, product.variantId);
    
    const existingItem = cartItems.find(item => 
      getCartItemKey(item._id, item.variantId) === itemKey
    );
    
    const currentQuantityInCart = existingItem?.quantity || 0;
    const newTotalQuantity = currentQuantityInCart + quantity;

    if (product.stock < newTotalQuantity) {
      return {
        success: false,
        message: `Stock insuficiente. Disponible: ${product.stock}`,
        availableStock: product.stock
      };
    }

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(item => 
        getCartItemKey(item._id, item.variantId) === itemKey
      );

      if (existingIndex !== -1) {
        const newItems = [...prevItems];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + quantity,
          stock: product.stock,
          price: product.price
        };
        return newItems;
      }

      // Extract producer info from populated product
      const producerInfo = product.producerId || {};
      
      return [...prevItems, {
        _id: product._id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        images: product.images,
        unit: product.unit,
        category: product.category,
        variantId: product.variantId || null,
        variantName: product.variantName || null,
        hasVariants: product.hasVariants || false,
        quantity,
        // Producer info for grouping
        producerId: producerInfo._id || product.producerId,
        producerName: producerInfo.businessName || product.producerName,
        producerCity: producerInfo.location?.city || product.producerCity,
        producerLogo: producerInfo.logo || product.producerLogo
      }];
    });

    return { success: true };
  }, [cartItems]);

  const removeFromCart = useCallback((productId, variantId = null) => {
    const itemKey = getCartItemKey(productId, variantId);
    setCartItems((prevItems) => 
      prevItems.filter((item) => getCartItemKey(item._id, item.variantId) !== itemKey)
    );
    setStockIssues((prev) => 
      prev.filter(issue => getCartItemKey(issue.productId, issue.variantId) !== itemKey)
    );
  }, []);

  const updateQuantity = useCallback((productId, quantity, variantId = null) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return { success: true };
    }

    const itemKey = getCartItemKey(productId, variantId);
    const item = cartItems.find(cartItem => 
      getCartItemKey(cartItem._id, cartItem.variantId) === itemKey
    );
    
    if (item && item.stock < quantity) {
      return {
        success: false,
        message: `Stock insuficiente. Disponible: ${item.stock}`,
        availableStock: item.stock
      };
    }

    setCartItems((prevItems) =>
      prevItems.map((cartItem) =>
        getCartItemKey(cartItem._id, cartItem.variantId) === itemKey 
          ? { ...cartItem, quantity } 
          : cartItem
      )
    );

    return { success: true };
  }, [cartItems, removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setStockIssues([]);
  }, []);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartItems]);

  const getCartCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  const getItemsGroupedByProducer = useMemo(() => {
    const grouped = cartItems.reduce((groups, item) => {
      const producerId = item.producerId || 'unknown';
      const producerName = item.producerName || 'Productor';
      const producerLocation = item.producerCity || '';
      const producerLogo = item.producerLogo || '';
      
      if (!groups[producerId]) {
        groups[producerId] = {
          producerId,
          producerName,
          producerLocation,
          producerLogo,
          items: [],
          subtotal: 0
        };
      }
      
      groups[producerId].items.push(item);
      groups[producerId].subtotal += item.price * item.quantity;
      
      return groups;
    }, {});
    
    return Object.values(grouped);
  }, [cartItems]);

  const validateCartStock = useCallback(async () => {
    if (cartItems.length === 0) {
      setStockIssues([]);
      return { valid: true, issues: [] };
    }

    try {
      const response = await api.post('/products/check-stock', {
        items: cartItems.map(item => ({
          productId: item._id,
          variantId: item.variantId,
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

  const value = useMemo(() => ({
    cartItems,
    stockIssues,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    getItemsGroupedByProducer,
    validateCartStock
  }), [
    cartItems,
    stockIssues,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    getItemsGroupedByProducer,
    validateCartStock
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
