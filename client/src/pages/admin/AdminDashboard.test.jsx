import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { toast } from 'react-toastify';
import AdminDashboard from './AdminDashboard';
import i18n from '../../i18n/config';
import { I18nextProvider } from 'react-i18next';
import api from '../../services/api';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { _id: 'a1', role: 'admin' } }),
}));

vi.mock('../../services/api', () => ({ default: { get: vi.fn() } }));

const mockDashboardData = {
  totalUsers: 120,
  totalProducers: 15,
  totalProducts: 80,
  totalOrders: 340,
  totalRevenue: 12500.5,
  pendingProducers: 3,
  recentOrders: [],
  ordersByStatus: { pending: 10, confirmed: 5 },
};

function renderAdminDashboard() {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <HelmetProvider>
        <I18nextProvider i18n={i18n}>
          <Routes>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/" element={<div data-testid="home">Home</div>} />
          </Routes>
        </I18nextProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.getItem.mockImplementation((key) => (key === 'token' ? 'fake-token' : null));
    api.get.mockResolvedValue({
      data: { success: true, data: mockDashboardData },
    });
  });

  it('fetches dashboard data and displays metrics', async () => {
    renderAdminDashboard();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/admin/dashboard');
    });
    await waitFor(() => {
      expect(screen.getByText('120')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('80')).toBeInTheDocument();
      expect(screen.getByText('340')).toBeInTheDocument();
      expect(screen.getByText(/12500|12.500/)).toBeInTheDocument();
    });
  });

  it('shows pending producers alert when pendingProducers > 0', async () => {
    renderAdminDashboard();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/admin/dashboard');
    });
    await waitFor(() => {
      const pendingCard = document.querySelector('.stat-card.pending.alert');
      expect(pendingCard).toBeInTheDocument();
      expect(pendingCard?.textContent).toContain('3');
    });
  });

  it('renders dashboard title', async () => {
    renderAdminDashboard();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/admin/dashboard');
    });
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it('shows skeleton while loading', () => {
    api.get.mockImplementation(() => new Promise(() => {}));
    renderAdminDashboard();
    const skeleton = document.querySelector('.skeleton') || document.querySelector('[class*="skeleton"]');
    expect(skeleton).toBeTruthy();
  });

  it('renders links to admin sections', async () => {
    renderAdminDashboard();
    await waitFor(() => {
      expect(screen.getByText('120')).toBeInTheDocument();
    });
    const links = screen.getAllByRole('link');
    const adminLinks = links.filter((link) => link.getAttribute('href')?.startsWith('/admin'));
    expect(adminLinks.length).toBeGreaterThanOrEqual(1);
  });

  it('shows toast error when dashboard API fails', async () => {
    api.get.mockRejectedValue(new Error('Network error'));
    renderAdminDashboard();
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
