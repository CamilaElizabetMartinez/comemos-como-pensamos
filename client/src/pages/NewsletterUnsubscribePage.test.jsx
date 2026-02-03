import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import NewsletterUnsubscribePage from './NewsletterUnsubscribePage';
import i18n from '../i18n/config';
import { I18nextProvider } from 'react-i18next';
import api from '../services/api';

vi.mock('../services/api', () => ({ default: { post: vi.fn() } }));

vi.mock('../components/common/SEO', () => ({ default: () => null }));

function renderNewsletterUnsubscribe(initialEntry = '/newsletter/unsubscribe') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <I18nextProvider i18n={i18n}>
        <Routes>
          <Route path="/newsletter/unsubscribe" element={<NewsletterUnsubscribePage />} />
        </Routes>
      </I18nextProvider>
    </MemoryRouter>
  );
}

describe('NewsletterUnsubscribePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders manual form when no email in URL', () => {
    renderNewsletterUnsubscribe();
    expect(screen.getByRole('heading', { name: /baja|unsubscribe/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /darme de baja|unsubscribe/i })).toBeInTheDocument();
  });

  it('calls API and shows success when unsubscribe with email in URL', async () => {
    api.post.mockResolvedValue({ data: { success: true } });
    renderNewsletterUnsubscribe('/newsletter/unsubscribe?email=user@test.com');
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/newsletter/unsubscribe', { email: 'user@test.com' });
    });
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /inicio|home|volver/i })).toBeInTheDocument();
    });
  });

  it('shows manual form with email input and submit', async () => {
    renderNewsletterUnsubscribe();
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    await userEvent.type(emailInput, 'test@example.com');
    expect(emailInput).toHaveValue('test@example.com');
  });
});
