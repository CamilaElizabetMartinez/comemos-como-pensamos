import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/config';
import AdminDashboard from '../pages/admin/AdminDashboard';
import ProducerDashboard from '../pages/producer/ProducerDashboard';
import api from '../services/api';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../services/api', () => ({ default: { get: vi.fn() } }));

import { useAuth } from '../context/AuthContext';

function renderWithRoute(Component, path, initialEntry = path) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <I18nextProvider i18n={i18n}>
        <Routes>
          <Route path={path} element={<Component />} />
          <Route path="/" element={<div data-testid="home">Home</div>} />
          <Route path="/login" element={<div data-testid="login">Login</div>} />
        </Routes>
      </I18nextProvider>
    </MemoryRouter>
  );
}

describe('Security: route protection by role', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.getItem.mockImplementation((key) => (key === 'token' ? null : null));
  });

  describe('Admin panel', () => {
    it('redirects to home when user is not admin (role user)', async () => {
      useAuth.mockReturnValue({ user: { _id: 'u1', role: 'user' } });
      renderWithRoute(AdminDashboard, '/admin');
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('redirects to home when user is producer', async () => {
      useAuth.mockReturnValue({ user: { _id: 'p1', role: 'producer' } });
      renderWithRoute(AdminDashboard, '/admin');
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('redirects to home when user is null (unauthenticated)', async () => {
      useAuth.mockReturnValue({ user: null });
      renderWithRoute(AdminDashboard, '/admin');
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('does not redirect when user is admin', async () => {
      useAuth.mockReturnValue({ user: { _id: 'a1', role: 'admin' } });
      api.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            totalUsers: 0,
            totalProducers: 0,
            totalProducts: 0,
            totalOrders: 0,
            totalRevenue: 0,
            pendingProducers: 0,
            recentOrders: [],
            ordersByStatus: {},
          },
        },
      });
      renderWithRoute(AdminDashboard, '/admin');
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/admin/dashboard');
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Producer panel', () => {
    it('redirects to login when there is no token', async () => {
      window.localStorage.getItem.mockImplementation(() => null);
      useAuth.mockReturnValue({ user: { _id: 'p1', role: 'producer' } });
      renderWithRoute(ProducerDashboard, '/producer');
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    it('redirects to home when user is not producer (role user)', async () => {
      window.localStorage.getItem.mockImplementation((key) => (key === 'token' ? 'fake-token' : null));
      useAuth.mockReturnValue({ user: { _id: 'u1', role: 'user' } });
      api.get.mockResolvedValue({
        data: { success: true, data: { producer: {} } },
      });
      renderWithRoute(ProducerDashboard, '/producer');
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('redirects to home when user is admin', async () => {
      window.localStorage.getItem.mockImplementation((key) => (key === 'token' ? 'fake-token' : null));
      useAuth.mockReturnValue({ user: { _id: 'a1', role: 'admin' } });
      api.get.mockResolvedValue({
        data: { success: true, data: { producer: {} } },
      });
      renderWithRoute(ProducerDashboard, '/producer');
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('does not redirect when user is producer and has token', async () => {
      window.localStorage.getItem.mockImplementation((key) => (key === 'token' ? 'fake-token' : null));
      useAuth.mockReturnValue({ user: { _id: 'p1', role: 'producer' } });
      api.get
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: {
              producer: {
                _id: 'prod1',
                businessName: 'Test Farm',
                commissionRate: 15,
              },
            },
          },
        })
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: {
              orders: [],
              totalPages: 1,
              totalOrders: 0,
            },
          },
        })
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: {
              totalProducts: 0,
              activeProducts: 0,
              pendingOrders: 0,
              completedOrders: 0,
              totalOrders: 0,
              grossRevenue: 0,
              totalCommission: 0,
              netRevenue: 0,
              currentCommissionRate: 15,
              specialCommissionRate: null,
              specialCommissionUntil: null,
              rating: 0,
              totalReviews: 0,
              recentOrders: [],
            },
          },
        })
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: {
              referralCode: 'ABC',
              referralCount: 0,
              referrals: [],
              referredBy: null,
            },
          },
        });
      renderWithRoute(ProducerDashboard, '/producer');
      await waitFor(() => {
        expect(api.get).toHaveBeenCalled();
      });
      expect(mockNavigate).not.toHaveBeenCalledWith('/');
      expect(mockNavigate).not.toHaveBeenCalledWith('/login');
    });
  });
});
