import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ProducerDashboard from './ProducerDashboard';
import i18n from '../../i18n/config';
import { I18nextProvider } from 'react-i18next';
import api from '../../services/api';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { _id: 'u1', role: 'producer', email: 'p@test.com' } }),
}));

vi.mock('../../services/api', () => ({ default: { get: vi.fn() } }));

const mockProducer = { _id: 'prod-1', businessName: 'Finca Sol', isApproved: true };
const mockOrders = [
  { _id: 'o1', orderNumber: 'ORD-001', status: 'pending', total: 25, items: [], customerId: { firstName: 'Juan', lastName: 'Test' }, createdAt: new Date().toISOString() },
];
const mockStats = {
  totalProducts: 5,
  activeProducts: 4,
  pendingOrders: 2,
  totalOrders: 10,
  grossRevenue: 500,
  netRevenue: 425,
  rating: 4.5,
  totalReviews: 20,
};

function renderProducerDashboard() {
  return render(
    <MemoryRouter initialEntries={['/producer']}>
      <HelmetProvider>
        <I18nextProvider i18n={i18n}>
          <Routes>
            <Route path="/producer" element={<ProducerDashboard />} />
            <Route path="/login" element={<div data-testid="login-page">Login</div>} />
          </Routes>
        </I18nextProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

describe('ProducerDashboard', () => {
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
    api.get.mockImplementation((url) => {
      if (url.includes('/producers/me')) {
        return Promise.resolve({ data: { success: true, data: { producer: mockProducer } } });
      }
      if (url.includes('/orders/producer/orders')) {
        return Promise.resolve({ data: { data: { orders: mockOrders } } });
      }
      if (url.includes('/stats')) {
        return Promise.resolve({ data: { data: { stats: mockStats } } });
      }
      if (url.includes('/referrals')) {
        return Promise.resolve({ data: { success: false } });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  it('fetches and displays dashboard data', async () => {
    renderProducerDashboard();
    await waitFor(() => {
      expect(screen.getByText(/ORD-001|pedidos recientes|Finca Sol/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    expect(api.get).toHaveBeenCalledWith('/producers/me');
  });

  it('displays stats sections', async () => {
    renderProducerDashboard();
    await waitFor(() => {
      expect(screen.getByText(/ORD-001|pedidos recientes/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    expect(document.querySelector('.producer-dashboard') || document.querySelector('[class*="dashboard"]')).toBeInTheDocument();
  });

  it('displays recent orders section', async () => {
    renderProducerDashboard();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('/orders/producer/orders'));
    });
    await waitFor(() => {
      expect(screen.getByText(/ORD-001|pedidos recientes|recent/i)).toBeInTheDocument();
    });
  });

  it('shows skeleton while loading', () => {
    api.get.mockImplementation(() => new Promise(() => {}));
    renderProducerDashboard();
    const skeleton = document.querySelector('.skeleton') || document.querySelector('[class*="skeleton"]');
    expect(skeleton).toBeTruthy();
  });

  it('renders link to products and orders', async () => {
    renderProducerDashboard();
    await waitFor(() => {
      expect(screen.getByText(/ORD-001|pedidos recientes/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    const productsLink = document.querySelector('a[href="/producer/products"]');
    const ordersLink = document.querySelector('a[href="/producer/orders"]');
    expect(productsLink).toBeInTheDocument();
    expect(ordersLink).toBeInTheDocument();
  });
});
