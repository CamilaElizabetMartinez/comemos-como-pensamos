import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import AdminLeads from './AdminLeads';
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

vi.mock('../../components/common/InputModal', () => ({
  default: () => null,
}));

const mockLeads = [
  {
    _id: 'l1',
    name: 'Lead Uno',
    businessName: 'Negocio 1',
    status: 'new',
    email: 'lead1@test.com',
    phone: '600000001',
    source: 'market',
    priority: 'medium',
  },
];

function renderAdminLeads() {
  return render(
    <MemoryRouter initialEntries={['/admin/leads']}>
      <HelmetProvider>
        <I18nextProvider i18n={i18n}>
          <Routes>
            <Route path="/admin/leads" element={<AdminLeads />} />
            <Route path="/admin" element={<div data-testid="admin-dashboard">Dashboard</div>} />
          </Routes>
        </I18nextProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

describe('AdminLeads', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.getItem.mockImplementation((key) => (key === 'token' ? 'fake-token' : null));
    api.get.mockResolvedValue({
      data: {
        success: true,
        data: { leads: mockLeads },
        statusCounts: { new: 1, contacted: 0, interested: 0, negotiating: 0, registered: 0, lost: 0 },
        overdueCount: 0,
      },
    });
  });

  it('fetches and displays leads', async () => {
    renderAdminLeads();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
      const calls = api.get.mock.calls.map((call) => call[0]);
      expect(calls.some((url) => String(url).includes('leads'))).toBe(true);
    });
    await waitFor(() => {
      expect(screen.getByText('Lead Uno')).toBeInTheDocument();
      expect(screen.getByText('Negocio 1')).toBeInTheDocument();
    });
  });

  it('renders filter or list controls', async () => {
    renderAdminLeads();
    await waitFor(() => {
      expect(screen.getByText('Lead Uno')).toBeInTheDocument();
    });
    const filterButtons = document.querySelectorAll('.filter-btn');
    expect(filterButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('shows loading state while fetching', () => {
    api.get.mockImplementation(() => new Promise(() => {}));
    renderAdminLeads();
    const loadingEl = document.querySelector('.loading') || document.querySelector('[class*="loading"]');
    expect(loadingEl).toBeTruthy();
  });
});
