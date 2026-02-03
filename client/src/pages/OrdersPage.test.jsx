import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { toast } from 'react-toastify';
import OrdersPage from './OrdersPage';
import i18n from '../i18n/config';
import { I18nextProvider } from 'react-i18next';
import { AuthProvider } from '../context/AuthContext';
import api from '../services/api';

vi.mock('../services/api', () => ({ default: { get: vi.fn() } }));

const mockOrders = [
  {
    _id: 'order-1',
    orderNumber: 'ORD-001',
    status: 'confirmed',
    total: 25.5,
    createdAt: new Date().toISOString(),
    items: [{ productName: 'Tomate', quantity: 2 }],
  },
];

function renderOrdersPage() {
  return render(
    <MemoryRouter>
      <HelmetProvider>
        <I18nextProvider i18n={i18n}>
          <AuthProvider>
            <OrdersPage />
          </AuthProvider>
        </I18nextProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

describe('OrdersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({
      data: { data: { orders: mockOrders }, totalPages: 1 },
    });
  });

  it('fetches and displays orders list', async () => {
    renderOrdersPage();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('/orders'));
    });
    await waitFor(() => {
      expect(screen.getByText(/ORD-001|#ORD/)).toBeInTheDocument();
    });
    expect(screen.getByText('Tomate')).toBeInTheDocument();
  });

  it('renders status filter select', async () => {
    renderOrdersPage();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });
    const filterSelect = document.querySelector('select.status-filter') || document.querySelector('select');
    expect(filterSelect).toBeInTheDocument();
  });

  it('renders link to order detail', async () => {
    renderOrdersPage();
    await waitFor(() => {
      expect(screen.getByText('Tomate')).toBeInTheDocument();
    });
    const detailLink = screen.getByRole('link', { name: /ver detalle|view details|detalle/i });
    expect(detailLink).toHaveAttribute('href', '/orders/order-1');
  });

  it('shows empty state when no orders', async () => {
    api.get.mockResolvedValue({ data: { data: { orders: [] }, totalPages: 1 } });
    renderOrdersPage();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });
    await waitFor(() => {
      const emptyLink = screen.getByRole('link', { name: /comenzar a comprar|start shopping|productos/i });
      expect(emptyLink).toBeInTheDocument();
    });
  });

  it('shows skeleton while loading', () => {
    api.get.mockImplementation(() => new Promise(() => {}));
    renderOrdersPage();
    const skeleton = document.querySelector('.skeleton') || document.querySelector('[class*="skeleton"]');
    expect(skeleton).toBeTruthy();
  });

  it('shows toast error when orders API fails', async () => {
    api.get.mockRejectedValue(new Error('Network error'));
    renderOrdersPage();
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
