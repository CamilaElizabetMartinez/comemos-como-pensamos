import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import CartPage from './CartPage';
import i18n from '../i18n/config';
import { I18nextProvider } from 'react-i18next';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';

vi.mock('../services/api', () => ({ default: { get: vi.fn() } }));

const cartItemStored = {
  _id: 'prod-1',
  quantity: 2,
  price: 5,
  name: { es: 'Tomate' },
  producerId: 'prod-1',
  producerName: 'Finca Sol',
  stock: 10,
  unit: 'kg',
};

function renderCartPage() {
  return render(
    <MemoryRouter>
      <HelmetProvider>
        <I18nextProvider i18n={i18n}>
          <AuthProvider>
            <CartProvider>
              <CartPage />
            </CartProvider>
          </AuthProvider>
        </I18nextProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

describe('CartPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.getItem.mockReturnValue(null);
  });

  it('shows empty cart message when cart is empty', () => {
    renderCartPage();
    expect(screen.getByRole('heading', { name: /carrito de compras/i })).toBeInTheDocument();
    expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument();
    const continueLink = screen.getByRole('link', { name: /continuar comprando/i });
    expect(continueLink).toBeInTheDocument();
    expect(continueLink).toHaveAttribute('href', '/products');
  });

  it('shows cart items and subtotal when cart has items', async () => {
    window.localStorage.getItem.mockReturnValue(JSON.stringify([cartItemStored]));
    renderCartPage();
    await waitFor(() => {
      expect(screen.getByText('Tomate')).toBeInTheDocument();
    });
    expect(screen.getAllByText(/10\.00|10,00/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Finca Sol').length).toBeGreaterThanOrEqual(1);
  });

  it('renders proceed to checkout button when cart has items', async () => {
    window.localStorage.getItem.mockReturnValue(JSON.stringify([cartItemStored]));
    renderCartPage();
    await waitFor(() => {
      expect(screen.getByText('Tomate')).toBeInTheDocument();
    });
    const checkoutButton = screen.getByRole('button', { name: /checkout|finalizar|proceder/i });
    expect(checkoutButton).toBeInTheDocument();
  });

  it('renders quantity controls and remove button for each item', async () => {
    window.localStorage.getItem.mockReturnValue(JSON.stringify([cartItemStored]));
    renderCartPage();
    await waitFor(() => {
      expect(screen.getByText('Tomate')).toBeInTheDocument();
    });
    const quantityButtons = document.querySelectorAll('.item-quantity button');
    const removeButtons = document.querySelectorAll('.btn-remove');
    expect(quantityButtons.length).toBeGreaterThanOrEqual(2);
    expect(removeButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('decrease quantity updates display', async () => {
    window.localStorage.getItem.mockReturnValue(JSON.stringify([cartItemStored]));
    renderCartPage();
    await waitFor(() => {
      expect(screen.getByText('Tomate')).toBeInTheDocument();
    });
    const decreaseButton = document.querySelector('.item-quantity button');
    await userEvent.click(decreaseButton);
    await waitFor(() => {
      const quantityDisplay = screen.getByText('1');
      expect(quantityDisplay).toBeInTheDocument();
    });
  });
});
