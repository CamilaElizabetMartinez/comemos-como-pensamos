import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import OrderConfirmationPage from './OrderConfirmationPage';
import i18n from '../i18n/config';
import { I18nextProvider } from 'react-i18next';
import { CartProvider } from '../context/CartContext';
import api from '../services/api';

vi.mock('../services/api', () => ({ default: { get: vi.fn() } }));

const mockOrder = {
  _id: 'order-1',
  orderNumber: 'ORD-001',
  total: 35.5,
  shippingCost: 5,
  paymentMethod: 'bank_transfer',
  shippingAddress: { street: 'Calle Test', city: 'Madrid', postalCode: '28001' },
  items: [{ productName: 'Tomate', quantity: 2, priceAtPurchase: 15.25 }],
};

function renderOrderConfirmation(state = { order: mockOrder, paymentMethod: 'bank_transfer' }) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/order-confirmation', state }]}>
      <HelmetProvider>
        <I18nextProvider i18n={i18n}>
          <CartProvider>
            <Routes>
              <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
            </Routes>
          </CartProvider>
        </I18nextProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

describe('OrderConfirmationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays order summary when order is in state', () => {
    renderOrderConfirmation();
    expect(screen.getByText('ORD-001')).toBeInTheDocument();
    expect(screen.getByText(/Tomate/)).toBeInTheDocument();
    expect(screen.getAllByText(/35\.50|35,50/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders link to view order', () => {
    renderOrderConfirmation();
    const viewOrderLink = screen.getByRole('link', { name: /ver pedido|view order|pedido/i });
    expect(viewOrderLink).toHaveAttribute('href', '/orders/order-1');
  });
});
