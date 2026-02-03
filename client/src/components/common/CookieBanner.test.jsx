import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CookieBanner from './CookieBanner';
import i18n from '../../i18n/config';
import { I18nextProvider } from 'react-i18next';

const COOKIE_CONSENT_KEY = 'cookie_consent';

function renderCookieBanner() {
  return render(
    <MemoryRouter>
      <I18nextProvider i18n={i18n}>
        <CookieBanner />
      </I18nextProvider>
    </MemoryRouter>
  );
}

describe('CookieBanner', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.getItem.mockImplementation((key) =>
      key === COOKIE_CONSENT_KEY ? null : null
    );
    window.localStorage.setItem.mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows banner after delay when no consent is stored', async () => {
    renderCookieBanner();
    expect(screen.queryByRole('heading', { name: /utilizamos cookies|cookies/i })).not.toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByRole('heading', { name: /utilizamos cookies|cookies/i })).toBeInTheDocument();
  });

  it('does not show banner when consent is already stored', async () => {
    window.localStorage.getItem.mockImplementation((key) =>
      key === COOKIE_CONSENT_KEY ? JSON.stringify({ necessary: true, analytics: false, marketing: false }) : null
    );
    renderCookieBanner();
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.queryByRole('heading', { name: /utilizamos cookies|cookies/i })).not.toBeInTheDocument();
  });

  it('has accept all, reject all and customize buttons', async () => {
    renderCookieBanner();
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByRole('button', { name: /aceptar todas/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /rechazar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /personalizar/i })).toBeInTheDocument();
  });

  it('closes banner and saves consent when accept all is clicked', async () => {
    renderCookieBanner();
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    fireEvent.click(screen.getByRole('button', { name: /aceptar todas/i }));
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      COOKIE_CONSENT_KEY,
      expect.stringContaining('"analytics":true')
    );
    expect(screen.queryByRole('heading', { name: /utilizamos cookies|cookies/i })).not.toBeInTheDocument();
  });

  it('closes banner and saves only necessary when reject all is clicked', async () => {
    renderCookieBanner();
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    fireEvent.click(screen.getByRole('button', { name: /rechazar/i }));
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      COOKIE_CONSENT_KEY,
      expect.stringContaining('"analytics":false')
    );
    expect(screen.queryByRole('heading', { name: /utilizamos cookies|cookies/i })).not.toBeInTheDocument();
  });

  it('shows preferences panel when customize is clicked', async () => {
    renderCookieBanner();
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    fireEvent.click(screen.getByRole('button', { name: /personalizar/i }));
    expect(screen.getByText(/cookies necesarias|necessary/i)).toBeInTheDocument();
    expect(screen.getByText(/analíticas|analytics/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /guardar preferencias|save preferences/i })).toBeInTheDocument();
  });

  it('has link to privacy page', async () => {
    renderCookieBanner();
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    const privacyLink = screen.getByRole('link', { name: /más información|learn more/i });
    expect(privacyLink).toHaveAttribute('href', '/privacy');
  });
});
