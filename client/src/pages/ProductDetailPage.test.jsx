import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ProductDetailPage from './ProductDetailPage';
import i18n from '../i18n/config';
import { I18nextProvider } from 'react-i18next';
import { productService } from '../services/productService';
import api from '../services/api';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';

vi.mock('../services/productService', () => ({
  productService: {
    getProductById: vi.fn(),
  },
}));

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockProduct = {
  _id: 'prod-1',
  name: { es: 'Aceite de Oliva', en: 'Olive Oil' },
  description: { es: 'Aceite virgen extra.', en: 'Extra virgin.' },
  price: 8,
  stock: 50,
  images: [{ url: 'https://example.com/oil.jpg' }],
  isAvailable: true,
  hasVariants: false,
  producerId: { _id: 'p1', businessName: 'Finca Sol' },
  category: 'aceites',
};

function renderProductDetail(id = 'prod-1') {
  return render(
    <MemoryRouter initialEntries={[`/products/${id}`]}>
      <HelmetProvider>
        <I18nextProvider i18n={i18n}>
          <AuthProvider>
            <CartProvider>
              <Routes>
                <Route path="/products/:id" element={<ProductDetailPage />} />
              </Routes>
            </CartProvider>
          </AuthProvider>
        </I18nextProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

describe('ProductDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    productService.getProductById.mockResolvedValue({
      data: { product: mockProduct },
    });
    api.get.mockImplementation((url) => {
      if (url.includes('favorites/check')) return Promise.resolve({ data: { data: { isFavorite: false } } });
      if (url.includes('reviews/product')) return Promise.resolve({ data: { data: { reviews: [] } } });
      if (url.includes('/related')) return Promise.resolve({ data: { data: { products: [] } } });
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  it('renders product name, price and description after load', async () => {
    renderProductDetail();
    await waitFor(() => {
      expect(screen.getAllByText('Aceite de Oliva').length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getAllByText(/8\.00|8,00/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/aceite virgen extra/i)).toBeInTheDocument();
  });

  it('renders breadcrumbs', async () => {
    renderProductDetail();
    await waitFor(() => {
      expect(productService.getProductById).toHaveBeenCalledWith('prod-1');
    });
    const breadcrumbs = document.querySelector('.breadcrumbs') || document.querySelector('[class*="breadcrumb"]');
    expect(breadcrumbs || screen.getByRole('navigation')).toBeTruthy();
  });

  it('renders quantity selector', async () => {
    renderProductDetail();
    await waitFor(() => {
      expect(screen.getAllByText('Aceite de Oliva').length).toBeGreaterThanOrEqual(1);
    });
    const quantityInput = document.querySelector('input[type="number"]') || screen.getByRole('spinbutton');
    expect(quantityInput).toBeInTheDocument();
  });

  it('renders add to cart button', async () => {
    renderProductDetail();
    await waitFor(() => {
      expect(screen.getAllByText('Aceite de Oliva').length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getByRole('button', { name: /añadir al carrito/i })).toBeInTheDocument();
  });

  it('renders description and reviews tabs', async () => {
    renderProductDetail();
    await waitFor(() => {
      expect(screen.getAllByText('Aceite de Oliva').length).toBeGreaterThanOrEqual(1);
    });
    const descTab = screen.queryByRole('tab', { name: /descripción|description/i });
    const reviewsTab = screen.queryByRole('tab', { name: /reseñas|reviews|valoraciones/i });
    expect(descTab || screen.getByText(/descripción|description/i)).toBeTruthy();
    expect(reviewsTab || screen.queryByText(/reseñas|reviews|valoraciones/i)).toBeTruthy();
  });

  it('renders link to producer when product has producer', async () => {
    renderProductDetail();
    await waitFor(() => {
      expect(screen.getAllByText('Aceite de Oliva').length).toBeGreaterThanOrEqual(1);
    });
    const producerLink = screen.queryByRole('link', { name: /finca sol|ver productor/i });
    expect(producerLink || document.querySelector('a[href*="producer"]')).toBeTruthy();
  });

  it('shows skeleton while loading', () => {
    productService.getProductById.mockImplementation(() => new Promise(() => {}));
    renderProductDetail();
    const skeleton = document.querySelector('.skeleton') || document.querySelector('[class*="skeleton"]');
    expect(skeleton).toBeTruthy();
  });
});
