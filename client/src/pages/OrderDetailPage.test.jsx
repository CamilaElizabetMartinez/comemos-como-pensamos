import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import OrderDetailPage from './OrderDetailPage';
import i18n from '../i18n/config';
import { I18nextProvider } from 'react-i18next';
import { AuthProvider } from '../context/AuthContext';
import api from '../services/api';

vi.mock('../services/api', () => ({ default: { get: vi.fn() } }));

const mockOrder = {
  _id: 'order-1',
  orderNumber: 'ORD-001',
  status: 'delivered',
  total: 35.5,
  subtotal: 30.5,
  shippingCost: 5,
  shippingAddress: { street: 'Calle Test', city: 'Madrid', postalCode: '28001', country: 'ES' },
  items: [
    { productId: { _id: 'p1' }, productName: 'Tomate', quantity: 2, price: 5, priceAtPurchase: 5 },
  ],
  createdAt: new Date().toISOString(),
  customerId: { _id: 'user-1' },
};

function renderOrderDetail(id = 'order-1') {
  return render(
    <MemoryRouter initialEntries={[`/orders/${id}`]}>
      <HelmetProvider>
        <I18nextProvider i18n={i18n}>
          <AuthProvider>
            <Routes>
              <Route path="/orders/:id" element={<OrderDetailPage />} />
            </Routes>
          </AuthProvider>
        </I18nextProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

describe('OrderDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockImplementation((url) => {
      if (url.includes('/orders/order-1')) {
        return Promise.resolve({ data: { data: { order: mockOrder } } });
      }
      if (url.includes('/reviews/product')) {
        return Promise.resolve({ data: { data: { reviews: [] } } });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  it('fetches and displays order details', async () => {
    renderOrderDetail();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/orders/order-1');
    });
    await screen.findByText('Tomate');
    const orderNumberElements = screen.getAllByText((content, element) => content.includes('ORD-001'));
    expect(orderNumberElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Tomate')).toBeInTheDocument();
  });

  it('renders link back to orders', async () => {
    renderOrderDetail();
    await screen.findByText('Tomate');
    const backLink = screen.getByRole('link', { name: /volver a pedidos|back to orders|pedidos/i }) ||
      document.querySelector('a[href="/orders"]');
    expect(backLink).toBeTruthy();
    expect(backLink?.getAttribute?.('href')).toBe('/orders');
  });

  it('shows skeleton while loading', () => {
    api.get.mockImplementation(() => new Promise(() => {}));
    renderOrderDetail();
    const skeleton = document.querySelector('.skeleton') || document.querySelector('[class*="skeleton"]');
    expect(skeleton).toBeTruthy();
  });
});
