import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from './RegisterPage';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { LanguageProvider } from '../context/LanguageContext';
import i18n from '../i18n/config';
import { I18nextProvider } from 'react-i18next';
import { authService } from '../services/authService';
import api from '../services/api';

vi.mock('../services/authService', () => ({
  authService: { register: vi.fn() },
}));

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

function renderRegisterPage(options = {}) {
  return render(
    <MemoryRouter initialEntries={options.initialEntries || ['/register']}>
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <CartProvider>
            <LanguageProvider>
              <RegisterPage />
            </LanguageProvider>
          </CartProvider>
        </AuthProvider>
      </I18nextProvider>
    </MemoryRouter>
  );
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders register form with title and fields', () => {
    renderRegisterPage();
    expect(screen.getByRole('heading', { name: /crear cuenta/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/apellido/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrarse/i })).toBeInTheDocument();
  });

  it('shows link to login', () => {
    renderRegisterPage();
    const link = screen.getByRole('link', { name: /entrar|ya tienes cuenta|iniciar sesión|auth\.hasAccount/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/login');
  });

  it('calls register with form data on submit', async () => {
    authService.register.mockResolvedValue({
      data: { user: { _id: '1', email: 'test@test.com' }, token: 'token' },
    });
    renderRegisterPage();
    const nameInput = screen.getByPlaceholderText('Tu nombre');
    const lastNameInput = screen.getByPlaceholderText('Tu apellido');
    const emailInput = screen.getByPlaceholderText('tu@email.com');
    const passwordInput = screen.getByPlaceholderText(/mínimo 6 caracteres/i);
    await userEvent.type(nameInput, 'Juan');
    await userEvent.type(lastNameInput, 'García');
    await userEvent.type(emailInput, 'juan@test.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(screen.getByRole('button', { name: /registrarse/i }));
    expect(authService.register).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'juan@test.com',
        firstName: 'Juan',
        lastName: 'García',
        password: 'password123',
      })
    );
  });

  it('shows referral banner when ref param is present and valid', async () => {
    api.get.mockResolvedValue({
      data: { success: true, data: { referrer: { businessName: 'Finca Test' } } },
    });
    renderRegisterPage({ initialEntries: ['/register?ref=ABC123'] });
    await waitFor(() => {
      expect(screen.getByText(/invitado por|Finca Test/i)).toBeInTheDocument();
    });
  });
});
