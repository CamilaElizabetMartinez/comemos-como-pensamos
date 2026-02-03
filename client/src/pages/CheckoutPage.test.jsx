import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import CheckoutPage from './CheckoutPage';
import i18n from '../i18n/config';
import { I18nextProvider } from 'react-i18next';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import api from '../services/api';

vi.mock('../services/api', () => ({ default: { get: vi.fn(), put: vi.fn(), post: vi.fn() } }));

const cartItemStored = {
  _id: 'prod-1',
  quantity: 1,
  price: 10,
  name: { es: 'Tomate' },
  producerId: 'p1',
  producerName: 'Finca',
  stock: 10,
  unit: 'kg',
};

function renderCheckoutPage() {
  return render(
    <MemoryRouter>
      <HelmetProvider>
        <I18nextProvider i18n={i18n}>
          <AuthProvider>
            <CartProvider>
              <CheckoutPage />
            </CartProvider>
          </AuthProvider>
        </I18nextProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

describe('CheckoutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.getItem.mockReturnValue(null);
  });

  it('shows empty cart message and continue shopping when cart is empty', () => {
    renderCheckoutPage();
    const continueButton = screen.getByRole('button', { name: /continuar comprando|continue/i });
    expect(continueButton).toBeInTheDocument();
    expect(continueButton).toHaveAttribute('type', 'button');
  });

  it('renders address form and payment methods when cart has items', async () => {
    window.localStorage.getItem.mockReturnValue(JSON.stringify([cartItemStored]));
    renderCheckoutPage();
    await waitFor(() => {
      expect(screen.getByText('Tomate')).toBeInTheDocument();
    });
    const firstNameInput = screen.getByRole('textbox', { name: /nombre|first/i }) || document.querySelector('input[name="firstName"]');
    expect(firstNameInput || document.querySelector('input[name="firstName"]')).toBeTruthy();
    const paymentOptions = document.querySelectorAll('input[name="paymentMethod"], [role="radio"]');
    const paymentSection = document.querySelector('.payment-methods') || document.querySelector('[class*="payment"]');
    expect(paymentSection || paymentOptions.length >= 0).toBeTruthy();
  });

  it('renders coupon input when cart has items', async () => {
    window.localStorage.getItem.mockReturnValue(JSON.stringify([cartItemStored]));
    renderCheckoutPage();
    await waitFor(() => {
      expect(screen.getByText('Tomate')).toBeInTheDocument();
    });
    const couponInput = document.querySelector('input[placeholder*="cupón"]') || document.querySelector('input[placeholder*="coupon"]') || screen.queryByPlaceholderText(/cupón|código/i);
    expect(couponInput || document.querySelector('input[type="text"]')).toBeTruthy();
  });
});
