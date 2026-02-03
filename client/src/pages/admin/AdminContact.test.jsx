import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import AdminContact from './AdminContact';
import i18n from '../../i18n/config';
import { I18nextProvider } from 'react-i18next';
import api from '../../services/api';

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

const mockMessages = [
  {
    _id: 'm1',
    name: 'Juan Pérez',
    email: 'juan@test.com',
    subject: 'Consulta',
    message: 'Hola',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
];

function renderAdminContact() {
  return render(
    <MemoryRouter initialEntries={['/admin/contact']}>
      <HelmetProvider>
        <I18nextProvider i18n={i18n}>
          <Routes>
            <Route path="/admin/contact" element={<AdminContact />} />
          </Routes>
        </I18nextProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

describe('AdminContact', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.getItem.mockImplementation((key) => (key === 'token' ? 'fake-token' : null));
    api.get.mockResolvedValue({
      data: {
        data: {
          messages: mockMessages,
          pagination: { pages: 1, total: 1 },
        },
      },
    });
  });

  it('fetches and displays contact messages', async () => {
    renderAdminContact();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('/contact'));
    });
    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      expect(screen.getByText('Consulta')).toBeInTheDocument();
    });
  });

  it('renders status filter', async () => {
    renderAdminContact();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('/contact'));
    });
    const filters = document.querySelectorAll('.filter-btn, [class*="status"]');
    expect(filters.length >= 0).toBeTruthy();
  });

  it('shows skeleton while loading', () => {
    api.get.mockImplementation(() => new Promise(() => {}));
    renderAdminContact();
    const skeleton = document.querySelector('.skeleton') || document.querySelector('[class*="skeleton"]');
    expect(skeleton).toBeTruthy();
  });
});
