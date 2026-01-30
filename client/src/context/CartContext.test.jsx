import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock api
vi.mock('../services/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;

const mockProduct = {
  _id: 'prod-1',
  name: { es: 'Tomates', en: 'Tomatoes' },
  price: 3.50,
  stock: 10,
  images: ['tomato.jpg'],
  unit: 'kg',
  category: 'vegetables',
  producerId: 'producer-1',
  producerName: 'Finca El Sol',
};

describe('CartContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('addToCart', () => {
    it('adds a product to empty cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct, 2);
      });

      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0].quantity).toBe(2);
      expect(result.current.cartItems[0]._id).toBe('prod-1');
    });

    it('increases quantity when adding existing product', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct, 2);
      });

      act(() => {
        result.current.addToCart(mockProduct, 3);
      });

      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0].quantity).toBe(5);
    });

    it('returns error when exceeding stock', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        const response = result.current.addToCart(mockProduct, 15);
        expect(response.success).toBe(false);
        expect(response.availableStock).toBe(10);
      });

      expect(result.current.cartItems).toHaveLength(0);
    });

    it('handles products with variants', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const variantProduct = {
        ...mockProduct,
        variantId: 'variant-1',
        variantName: '500g',
      };

      act(() => {
        result.current.addToCart(variantProduct, 1);
      });

      act(() => {
        result.current.addToCart({ ...mockProduct, variantId: 'variant-2' }, 1);
      });

      expect(result.current.cartItems).toHaveLength(2);
    });
  });

  describe('removeFromCart', () => {
    it('removes a product from cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct, 2);
      });

      act(() => {
        result.current.removeFromCart('prod-1');
      });

      expect(result.current.cartItems).toHaveLength(0);
    });

    it('removes specific variant without affecting others', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart({ ...mockProduct, variantId: 'v1' }, 1);
        result.current.addToCart({ ...mockProduct, variantId: 'v2' }, 1);
      });

      act(() => {
        result.current.removeFromCart('prod-1', 'v1');
      });

      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0].variantId).toBe('v2');
    });
  });

  describe('updateQuantity', () => {
    it('updates product quantity', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct, 2);
      });

      act(() => {
        result.current.updateQuantity('prod-1', 5);
      });

      expect(result.current.cartItems[0].quantity).toBe(5);
    });

    it('removes product when quantity is 0', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct, 2);
      });

      act(() => {
        result.current.updateQuantity('prod-1', 0);
      });

      expect(result.current.cartItems).toHaveLength(0);
    });

    it('returns error when exceeding stock', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct, 2);
      });

      act(() => {
        const response = result.current.updateQuantity('prod-1', 15);
        expect(response.success).toBe(false);
      });

      expect(result.current.cartItems[0].quantity).toBe(2);
    });
  });

  describe('clearCart', () => {
    it('removes all items from cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct, 2);
        result.current.addToCart({ ...mockProduct, _id: 'prod-2' }, 3);
      });

      act(() => {
        result.current.clearCart();
      });

      expect(result.current.cartItems).toHaveLength(0);
    });
  });

  describe('getCartTotal', () => {
    it('calculates correct total', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct, 2); // 3.50 * 2 = 7.00
        result.current.addToCart({ ...mockProduct, _id: 'prod-2', price: 5.00 }, 3); // 5.00 * 3 = 15.00
      });

      expect(result.current.getCartTotal()).toBe(22.00);
    });

    it('returns 0 for empty cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      expect(result.current.getCartTotal()).toBe(0);
    });
  });

  describe('getCartCount', () => {
    it('counts total items', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct, 2);
        result.current.addToCart({ ...mockProduct, _id: 'prod-2' }, 3);
      });

      expect(result.current.getCartCount()).toBe(5);
    });
  });

  describe('getItemsGroupedByProducer', () => {
    it('groups items by producer', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct, 2);
        result.current.addToCart({ 
          ...mockProduct, 
          _id: 'prod-2',
          producerId: 'producer-2',
          producerName: 'Huerta Verde'
        }, 1);
        result.current.addToCart({ ...mockProduct, _id: 'prod-3' }, 1);
      });

      const grouped = result.current.getItemsGroupedByProducer;
      expect(grouped).toHaveLength(2);
      
      const producer1 = grouped.find(g => g.producerId === 'producer-1');
      expect(producer1.items).toHaveLength(2);
    });
  });
});
