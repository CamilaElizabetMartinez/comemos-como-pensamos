import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import VerifyEmailPage from './VerifyEmailPage';
import i18n from '../i18n/config';
import { I18nextProvider } from 'react-i18next';
import api from '../services/api';

vi.mock('../services/api', () => ({ default: { get: vi.fn() } }));

function renderVerifyEmail(token = 'test-token-123') {
  return render(
    <MemoryRouter initialEntries={[`/verify-email/${token}`]}>
      <I18nextProvider i18n={i18n}>
        <Routes>
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
        </Routes>
      </I18nextProvider>
    </MemoryRouter>
  );
}

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders verification title', () => {
    api.get.mockImplementation(() => new Promise(() => {}));
    renderVerifyEmail();
    expect(screen.getByRole('heading', { level: 1, name: /verificación|verification/i })).toBeInTheDocument();
  });

  it('shows verifying state while API is pending', () => {
    api.get.mockImplementation(() => new Promise(() => {}));
    renderVerifyEmail();
    expect(screen.getByText(/verificando|verifying/i)).toBeInTheDocument();
  });

  it('shows success and link to login when verification succeeds', async () => {
    api.get.mockResolvedValue({ data: { success: true } });
    renderVerifyEmail();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/email/verify/test-token-123');
    });
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /iniciar sesión|login|go to login/i })).toBeInTheDocument();
    });
  });

  it('shows error state when verification fails', async () => {
    api.get.mockRejectedValue(new Error('Invalid token'));
    renderVerifyEmail();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/email/verify/test-token-123');
    });
    await waitFor(() => {
      const loginLinks = screen.getAllByRole('link', { name: /iniciar sesión|login|go to login/i });
      expect(loginLinks.length).toBeGreaterThanOrEqual(1);
    });
  });
});
