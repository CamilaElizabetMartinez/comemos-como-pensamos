import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ResetPasswordPage from './ResetPasswordPage';
import i18n from '../i18n/config';
import { I18nextProvider } from 'react-i18next';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: { post: vi.fn() },
}));

function renderResetPassword(token = 'valid-token') {
  return render(
    <MemoryRouter initialEntries={[`/reset-password/${token}`]}>
      <I18nextProvider i18n={i18n}>
        <Routes>
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        </Routes>
      </I18nextProvider>
    </MemoryRouter>
  );
}

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with new password and confirm fields', () => {
    renderResetPassword();
    expect(screen.getByPlaceholderText(/mínimo 6 caracteres/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/repite la contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cambiar contraseña/i })).toBeInTheDocument();
  });

  it('calls API with token and new password on submit', async () => {
    api.post.mockResolvedValue({ data: { success: true } });
    renderResetPassword('abc123');
    await userEvent.type(screen.getByPlaceholderText(/mínimo 6 caracteres/i), 'newpass123');
    await userEvent.type(screen.getByPlaceholderText(/repite la contraseña/i), 'newpass123');
    await userEvent.click(screen.getByRole('button', { name: /cambiar contraseña/i }));
    expect(api.post).toHaveBeenCalledWith(
      '/email/reset-password/abc123',
      expect.objectContaining({ password: 'newpass123' })
    );
  });

  it('shows success state after reset', async () => {
    api.post.mockResolvedValue({ data: { success: true } });
    renderResetPassword('abc123');
    await userEvent.type(screen.getByPlaceholderText(/mínimo 6 caracteres/i), 'newpass123');
    await userEvent.type(screen.getByPlaceholderText(/repite la contraseña/i), 'newpass123');
    await userEvent.click(screen.getByRole('button', { name: /cambiar contraseña/i }));
    await waitFor(() => {
      expect(screen.getByText(/contraseña cambiada|password changed/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: /entrar|login/i })).toHaveAttribute('href', '/login');
  });
});
