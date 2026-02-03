import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import AdminOrders from './AdminOrders';
import i18n from '../../i18n/config';
import { I18nextProvider } from 'react-i18next';
import api from '../../services/api';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { _id: 'a1', role: 'admin' } }),
}));

vi.mock('../../services/api', () => ({ default: { get: vi.fn(), put: vi.fn() } }));

const mockOrders = [
  {
    _id: 'o1',
    orderNumber: 'ORD-100',
    status: 'pending',
    total: 45,
    items: [{ productName: 'Tomate', quantity: 2, priceAtPurchase: 3.5 }],
    customerId: { firstName: 'Maria', lastName: 'López', email: 'maria@test.com' },
    createdAt: new Date().toISOString(),
  },
];

function renderAdminOrders() {
  return render(
    <MemoryRouter initialEntries={['/admin/orders']}>
      <HelmetProvider>
        <I18nextProvider i18n={i18n}>
          <Routes>
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin" element={<div data-testid="admin-dashboard">Dashboard</div>} />
          </Routes>
        </I18nextProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

describe('AdminOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.getItem.mockImplementation((key) => (key === 'token' ? 'fake-token' : null));
    api.get.mockResolvedValue({
      data: { success: true, data: { orders: mockOrders } },
      totalPages: 1,
    });
  });

  it('fetches and displays orders list', async () => {
    renderAdminOrders();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('/admin/orders'));
    });
    await waitFor(() => {
      expect(screen.getByText(/Maria|López/)).toBeInTheDocument();
      expect(screen.getByText('€45.00')).toBeInTheDocument();
    });
  });

  it('renders status filter buttons', async () => {
    renderAdminOrders();
    await waitFor(() => {
      expect(screen.getByText(/Maria|López/)).toBeInTheDocument();
    });
    const filterButtons = document.querySelectorAll('.filter-btn');
    expect(filterButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('calls API when changing order status', async () => {
    api.put.mockResolvedValue({});
    renderAdminOrders();
    await waitFor(() => {
      expect(screen.getByText(/Maria|López/)).toBeInTheDocument();
    });
    const statusSelect = document.querySelector('select.status-select');
    expect(statusSelect).toBeInTheDocument();
    await userEvent.selectOptions(statusSelect, 'confirmed');
    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(expect.stringContaining('/orders/'), expect.objectContaining({ status: 'confirmed' }));
    });
  });

  it('shows loading state while fetching', () => {
    api.get.mockImplementation(() => new Promise(() => {}));
    renderAdminOrders();
    const skeleton = document.querySelector('.skeleton') || document.querySelector('[class*="skeleton"]');
    expect(skeleton).toBeTruthy();
  });
});
