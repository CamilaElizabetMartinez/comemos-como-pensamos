import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ProducerOrders from './ProducerOrders';
import i18n from '../../i18n/config';
import { I18nextProvider } from 'react-i18next';
import api from '../../services/api';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { _id: 'u1', role: 'producer' } }),
}));

vi.mock('../../services/api', () => ({ default: { get: vi.fn(), put: vi.fn() } }));

const mockOrders = [
  {
    _id: 'o1',
    orderNumber: 'ORD-001',
    status: 'pending',
    total: 30,
    items: [{ productName: 'Tomate', quantity: 2, priceAtPurchase: 3.5 }],
    shippingAddress: {},
    customerId: { firstName: 'Juan', lastName: 'Test', email: 'j@test.com' },
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'o2',
    orderNumber: 'ORD-002',
    status: 'confirmed',
    total: 45,
    items: [],
    shippingAddress: {},
    customerId: { firstName: 'Ana', lastName: 'Test', email: 'a@test.com' },
    createdAt: new Date().toISOString(),
  },
];

function renderProducerOrders() {
  return render(
    <MemoryRouter initialEntries={['/producer/orders']}>
      <HelmetProvider>
        <I18nextProvider i18n={i18n}>
          <Routes>
            <Route path="/producer/orders" element={<ProducerOrders />} />
            <Route path="/login" element={<div data-testid="login">Login</div>} />
          </Routes>
        </I18nextProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

describe('ProducerOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key) => (key === 'token' ? 'fake-token' : null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
    });
    api.get.mockResolvedValue({
      data: { data: { orders: mockOrders }, totalPages: 1 },
    });
  });

  it('fetches and displays orders list', async () => {
    renderProducerOrders();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('/orders/producer/orders'));
    });
    await waitFor(() => {
      expect(screen.getByText('Tomate')).toBeInTheDocument();
      expect(screen.getAllByText(/Juan|Ana/).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders status filter buttons', async () => {
    renderProducerOrders();
    await waitFor(() => {
      const filterButtons = document.querySelectorAll('.filter-btn');
      expect(filterButtons.length).toBeGreaterThanOrEqual(1);
    });
    expect(document.querySelectorAll('.filter-btn').length).toBeGreaterThanOrEqual(1);
  });

  it('calls API when changing order status', async () => {
    api.put.mockResolvedValue({});
    renderProducerOrders();
    await waitFor(() => {
      expect(screen.getByText('Tomate')).toBeInTheDocument();
    });
    const advanceButton = document.querySelector('.btn-advance');
    expect(advanceButton).toBeInTheDocument();
    await userEvent.click(advanceButton);
    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(expect.stringContaining('/orders/'), expect.any(Object));
    });
  });

  it('renders link back to dashboard', async () => {
    renderProducerOrders();
    await waitFor(() => {
      expect(screen.getByText('Tomate')).toBeInTheDocument();
    });
    const backLink = screen.getByRole('link', { name: /volver al panel|dashboard|panel/i });
    expect(backLink).toHaveAttribute('href', '/producer');
  });

  it('shows skeleton while loading', () => {
    api.get.mockImplementation(() => new Promise(() => {}));
    renderProducerOrders();
    const skeleton = document.querySelector('.skeleton') || document.querySelector('[class*="skeleton"]');
    expect(skeleton).toBeTruthy();
  });
});
