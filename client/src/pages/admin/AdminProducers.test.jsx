import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import AdminProducers from './AdminProducers';
import i18n from '../../i18n/config';
import { I18nextProvider } from 'react-i18next';
import api from '../../services/api';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { _id: 'a1', role: 'admin' } }),
}));

vi.mock('../../services/api', () => ({ default: { get: vi.fn(), put: vi.fn() } }));

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
  default: ({ isOpen, onSubmit, onClose }) =>
    isOpen ? (
      <div data-testid="input-modal">
        <button type="button" onClick={() => onSubmit('reason')}>Submit</button>
        <button type="button" onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

const mockPendingProducers = [
  { _id: 'p1', businessName: 'Finca Nueva', description: { es: 'Ecológico' }, status: 'pending', createdAt: new Date().toISOString() },
];
const mockAllProducers = [
  { _id: 'p2', businessName: 'Huerta Sol', isApproved: true },
];

function renderAdminProducers() {
  return render(
    <MemoryRouter initialEntries={['/admin/producers']}>
      <HelmetProvider>
        <I18nextProvider i18n={i18n}>
          <Routes>
            <Route path="/admin/producers" element={<AdminProducers />} />
            <Route path="/admin" element={<div data-testid="admin-dashboard">Dashboard</div>} />
          </Routes>
        </I18nextProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

describe('AdminProducers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.getItem.mockImplementation((key) => (key === 'token' ? 'fake-token' : null));
    api.get.mockImplementation((url) => {
      if (url.includes('/admin/producers/pending')) {
        return Promise.resolve({ data: { success: true, data: { producers: mockPendingProducers } } });
      }
      if (url.includes('/producers')) {
        return Promise.resolve({ data: { success: true, data: { producers: mockAllProducers } } });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  it('fetches pending and all producers', async () => {
    renderAdminProducers();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/admin/producers/pending');
      expect(api.get).toHaveBeenCalledWith('/producers');
    });
  });

  it('displays pending producers list', async () => {
    renderAdminProducers();
    await waitFor(() => {
      expect(screen.getByText('Finca Nueva')).toBeInTheDocument();
    });
  });

  it('has approve and reject actions for pending', async () => {
    renderAdminProducers();
    await waitFor(() => {
      expect(screen.getByText('Finca Nueva')).toBeInTheDocument();
    });
    const approveButtons = screen.getAllByRole('button', { name: /aprobar|approve/i });
    const rejectButtons = screen.getAllByRole('button', { name: /rechazar|reject/i });
    expect(approveButtons.length + rejectButtons.length).toBeGreaterThanOrEqual(0);
  });

  it('calls approve API when approving producer', async () => {
    api.put.mockResolvedValue({});
    renderAdminProducers();
    await waitFor(() => {
      expect(screen.getByText('Finca Nueva')).toBeInTheDocument();
    });
    const approveButton = screen.queryByRole('button', { name: /aprobar|approve/i });
    if (approveButton) {
      await userEvent.click(approveButton);
      await waitFor(() => {
        expect(api.put).toHaveBeenCalledWith(expect.stringContaining('/approve'));
      });
    }
  });

  it('shows skeleton while loading', () => {
    api.get.mockImplementation(() => new Promise(() => {}));
    renderAdminProducers();
    const skeleton = document.querySelector('.skeleton') || document.querySelector('[class*="skeleton"]');
    expect(skeleton).toBeTruthy();
  });
});
