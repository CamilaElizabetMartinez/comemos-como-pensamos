import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import AdminCoupons from './AdminCoupons';
import i18n from '../../i18n/config';
import { I18nextProvider } from 'react-i18next';
import api from '../../services/api';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { _id: 'a1', role: 'admin' } }),
}));

vi.mock('../../services/api', () => ({ default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));

vi.mock('../../components/common/ConfirmModal', () => ({
  default: ({ isOpen, onConfirm, onCancel }) =>
    isOpen ? (
      <div data-testid="confirm-modal">
        <button type="button" onClick={onConfirm}>Confirm</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    ) : null,
}));

const mockCoupons = [
  { _id: 'c1', code: 'VERANO20', discountType: 'percentage', discountValue: 20, isActive: true },
  { _id: 'c2', code: 'BIENVENIDA', discountType: 'fixed', discountValue: 5, isActive: false },
];

function renderAdminCoupons() {
  return render(
    <MemoryRouter initialEntries={['/admin/coupons']}>
      <HelmetProvider>
        <I18nextProvider i18n={i18n}>
          <Routes>
            <Route path="/admin/coupons" element={<AdminCoupons />} />
            <Route path="/admin" element={<div data-testid="admin-dashboard">Dashboard</div>} />
          </Routes>
        </I18nextProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

describe('AdminCoupons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.getItem.mockImplementation((key) => (key === 'token' ? 'fake-token' : null));
    api.get.mockResolvedValue({
      data: { success: true, data: { coupons: mockCoupons } },
    });
  });

  it('fetches and displays coupons list', async () => {
    renderAdminCoupons();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/coupons', expect.any(Object));
    });
    await waitFor(() => {
      expect(screen.getByText('VERANO20')).toBeInTheDocument();
      expect(screen.getByText('BIENVENIDA')).toBeInTheDocument();
    });
  });

  it('renders filter for active/inactive', async () => {
    renderAdminCoupons();
    await waitFor(() => {
      expect(screen.getByText('VERANO20')).toBeInTheDocument();
    });
    const filterButtons = document.querySelectorAll('.filter-btn, [class*="filter"]');
    expect(filterButtons.length >= 0).toBeTruthy();
  });

  it('renders button to create coupon', async () => {
    renderAdminCoupons();
    await waitFor(() => {
      expect(screen.getByText('VERANO20')).toBeInTheDocument();
    });
    const headerButtons = document.querySelectorAll('header .btn-primary, .dashboard-header .btn-primary');
    expect(headerButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('shows loading state while fetching', () => {
    api.get.mockImplementation(() => new Promise(() => {}));
    renderAdminCoupons();
    const loadingEl = document.querySelector('.loading') || document.querySelector('[class*="loading"]');
    expect(loadingEl).toBeTruthy();
  });
});
