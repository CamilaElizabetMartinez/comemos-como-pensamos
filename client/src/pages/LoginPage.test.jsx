import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { LanguageProvider } from '../context/LanguageContext';
import i18n from '../i18n/config';
import { I18nextProvider } from 'react-i18next';
import { authService } from '../services/authService';

vi.mock('../services/authService', () => ({
  authService: {
    login: vi.fn(),
  },
}));

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <CartProvider>
            <LanguageProvider>
              <LoginPage />
            </LanguageProvider>
          </CartProvider>
        </AuthProvider>
      </I18nextProvider>
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form with title and fields', () => {
    renderLoginPage();
    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('shows link to forgot password', () => {
    renderLoginPage();
    const link = screen.getByRole('link', { name: /olvidaste tu contraseña/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/forgot-password');
  });

  it('shows link to register', () => {
    renderLoginPage();
    const link = screen.getByRole('link', { name: /registrarse/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/register');
  });

  it('calls login with credentials on submit', async () => {
    authService.login.mockResolvedValue({
      data: { user: { _id: '1', email: 'test@test.com', firstName: 'Test' }, token: 'token' },
    });
    renderLoginPage();
    await userEvent.type(screen.getByLabelText(/email/i), 'test@test.com');
    await userEvent.type(screen.getByPlaceholderText(/tu contraseña/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));
    expect(authService.login).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password123',
    });
  });

  it('does not call login when email is empty', async () => {
    renderLoginPage();
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('does not call login when password is too short', async () => {
    renderLoginPage();
    await userEvent.type(screen.getByLabelText(/email/i), 'test@test.com');
    await userEvent.type(screen.getByPlaceholderText(/tu contraseña/i), '12345');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('has password visibility toggle', () => {
    renderLoginPage();
    const toggle = screen.getByRole('button', { name: /auth\.showPassword|auth\.hidePassword|mostrar contraseña|ocultar contraseña|show password|hide password/i });
    expect(toggle).toBeInTheDocument();
  });
});
