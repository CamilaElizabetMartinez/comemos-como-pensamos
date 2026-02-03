import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ProfilePage from './ProfilePage';
import i18n from '../i18n/config';
import { I18nextProvider } from 'react-i18next';
import { AuthProvider } from '../context/AuthContext';
import api from '../services/api';

vi.mock('../services/api', () => ({ default: { get: vi.fn(), put: vi.fn() } }));

const mockUser = {
  _id: 'user-1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  phone: '600000000',
  address: { street: 'Calle Test', city: 'Madrid', postalCode: '28001', country: 'ES' },
  preferredLanguage: 'es',
};

function renderProfilePage() {
  return render(
    <MemoryRouter>
      <HelmetProvider>
        <I18nextProvider i18n={i18n}>
          <AuthProvider>
            <ProfilePage />
          </AuthProvider>
        </I18nextProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'user') return JSON.stringify(mockUser);
      if (key === 'token') return 'fake-token';
      return null;
    });
  });

  it('renders profile title', () => {
    renderProfilePage();
    expect(screen.getByRole('heading', { name: /perfil|profile/i })).toBeInTheDocument();
  });

  it('renders tabs for personal, address, preferences and notifications', () => {
    renderProfilePage();
    expect(screen.getByText(/datos personales|personal/i)).toBeInTheDocument();
    expect(screen.getByText(/dirección|address/i)).toBeInTheDocument();
    expect(screen.getByText(/preferencias|preferences/i)).toBeInTheDocument();
    expect(screen.getByText(/notificaciones|notifications/i)).toBeInTheDocument();
  });

  it('renders save button', () => {
    renderProfilePage();
    const saveButton = screen.getByRole('button', { name: /guardar|save/i });
    expect(saveButton).toBeInTheDocument();
  });

  it('calls API on profile update submit', async () => {
    api.put.mockResolvedValue({ data: { success: true, data: { user: mockUser } } });
    renderProfilePage();
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test')).toBeInTheDocument();
    });
    const saveButton = screen.getByRole('button', { name: /guardar|save/i });
    await userEvent.click(saveButton);
    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/auth/update-profile', expect.any(Object));
    });
  });
});
