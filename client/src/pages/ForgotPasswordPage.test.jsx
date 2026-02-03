import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ForgotPasswordPage from './ForgotPasswordPage';
import i18n from '../i18n/config';
import { I18nextProvider } from 'react-i18next';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: { post: vi.fn() },
}));

function renderForgotPassword() {
  return render(
    <MemoryRouter>
      <I18nextProvider i18n={i18n}>
        <ForgotPasswordPage />
      </I18nextProvider>
    </MemoryRouter>
  );
}

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with title and email field', () => {
    renderForgotPassword();
    expect(screen.getByRole('heading', { name: /recuperar contraseña/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('tu@email.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar enlace/i })).toBeInTheDocument();
  });

  it('shows link to login', () => {
    renderForgotPassword();
    const link = screen.getByRole('link', { name: /volver a iniciar sesión/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/login');
  });

  it('calls API and shows success message on submit', async () => {
    api.post.mockResolvedValue({ data: { success: true } });
    renderForgotPassword();
    await userEvent.type(screen.getByPlaceholderText('tu@email.com'), 'user@test.com');
    await userEvent.click(screen.getByRole('button', { name: /enviar enlace/i }));
    expect(api.post).toHaveBeenCalledWith('/email/forgot-password', { email: 'user@test.com' });
    await waitFor(() => {
      expect(screen.getByText(/revisa tu correo|check your email/i)).toBeInTheDocument();
    });
  });
});
