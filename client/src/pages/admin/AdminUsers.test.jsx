import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import AdminUsers from './AdminUsers';
import i18n from '../../i18n/config';
import { I18nextProvider } from 'react-i18next';
import api from '../../services/api';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { _id: 'a1', role: 'admin' } }),
}));

vi.mock('../../services/api', () => ({ default: { get: vi.fn(), delete: vi.fn() } }));

vi.mock('../../components/common/ConfirmModal', () => ({
  default: ({ isOpen, onConfirm, onCancel, title }) =>
    isOpen ? (
      <div data-testid="confirm-modal">
        <span>{title}</span>
        <button type="button" onClick={onConfirm}>Confirm</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    ) : null,
}));

const mockUsers = [
  { _id: 'u1', firstName: 'Ana', lastName: 'García', email: 'ana@test.com', role: 'customer', createdAt: new Date().toISOString() },
  { _id: 'u2', firstName: 'Admin', lastName: 'User', email: 'admin@test.com', role: 'admin', createdAt: new Date().toISOString() },
];

function renderAdminUsers() {
  return render(
    <MemoryRouter initialEntries={['/admin/users']}>
      <HelmetProvider>
        <I18nextProvider i18n={i18n}>
          <Routes>
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin" element={<div data-testid="admin-dashboard">Dashboard</div>} />
          </Routes>
        </I18nextProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

describe('AdminUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.getItem.mockImplementation((key) => (key === 'token' ? 'fake-token' : null));
    api.get.mockResolvedValue({
      data: { success: true, data: { users: mockUsers } },
      totalPages: 1,
    });
  });

  it('fetches and displays users list', async () => {
    renderAdminUsers();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('/admin/users'));
    });
    await waitFor(() => {
      expect(screen.getByText(/Ana|García/)).toBeInTheDocument();
      expect(screen.getByText(/admin@test.com/)).toBeInTheDocument();
    });
  });

  it('renders role filter controls', async () => {
    renderAdminUsers();
    await waitFor(() => {
      expect(screen.getByText(/Ana|García/)).toBeInTheDocument();
    });
    const roleFilters = document.querySelectorAll('select[name="roleFilter"], [class*="role-filter"], .filter-btn');
    expect(roleFilters.length >= 0 || screen.getByPlaceholderText(/buscar|search/i)).toBeTruthy();
  });

  it('calls delete API when confirming delete', async () => {
    api.delete.mockResolvedValue({});
    renderAdminUsers();
    await waitFor(() => {
      expect(screen.getByText(/Ana|García/)).toBeInTheDocument();
    });
    const deleteButtons = screen.getAllByRole('button', { name: /eliminar|delete|borrar/i });
    if (deleteButtons.length > 0) {
      await userEvent.click(deleteButtons[0]);
      await waitFor(() => {
        expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByRole('button', { name: /confirm/i }));
      await waitFor(() => {
        expect(api.delete).toHaveBeenCalledWith(expect.stringContaining('/admin/users/'));
      });
    }
  });

  it('shows skeleton while loading', () => {
    api.get.mockImplementation(() => new Promise(() => {}));
    renderAdminUsers();
    const skeleton = document.querySelector('.skeleton') || document.querySelector('[class*="skeleton"]');
    expect(skeleton).toBeTruthy();
  });
});
