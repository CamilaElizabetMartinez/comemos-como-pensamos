import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Footer from './Footer';
import i18n from '../../i18n/config';
import { I18nextProvider } from 'react-i18next';
import api from '../../services/api';

vi.mock('../../services/api', () => ({
  default: { post: vi.fn() },
}));

function renderFooter() {
  return render(
    <MemoryRouter>
      <I18nextProvider i18n={i18n}>
        <Footer />
      </I18nextProvider>
    </MemoryRouter>
  );
}

describe('Footer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders brand name', () => {
    renderFooter();
    expect(screen.getByRole('heading', { name: /comemos como pensamos/i })).toBeInTheDocument();
  });

  it('renders explore links: Productos, Productores, Blog', () => {
    renderFooter();
    expect(screen.getByRole('link', { name: /productos/i })).toHaveAttribute('href', '/products');
    expect(screen.getByRole('link', { name: /productores/i })).toHaveAttribute('href', '/producers');
    expect(screen.getByRole('link', { name: /blog/i })).toHaveAttribute('href', '/blog');
  });

  it('renders help links: Contacto, Términos, Privacidad', () => {
    renderFooter();
    expect(screen.getByRole('link', { name: /contacto|contact/i })).toHaveAttribute('href', '/contact');
    expect(screen.getByRole('link', { name: /términos|terms/i })).toHaveAttribute('href', '/terms');
    expect(screen.getByRole('link', { name: /privacidad|privacy/i })).toHaveAttribute('href', '/privacy');
  });

  it('renders newsletter form', () => {
    renderFooter();
    const input = screen.getByPlaceholderText(/tu correo|email/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'email');
    const submitButton = screen.getByRole('button', { name: /suscribir|subscribe/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('subscribes to newsletter on valid email submit', async () => {
    api.post.mockResolvedValue({ data: { success: true } });
    renderFooter();
    await userEvent.type(screen.getByPlaceholderText(/tu correo|email/i), 'user@test.com');
    await userEvent.click(screen.getByRole('button', { name: /suscribir|subscribe/i }));
    expect(api.post).toHaveBeenCalledWith(
      '/newsletter/subscribe',
      expect.objectContaining({ email: 'user@test.com', source: 'footer' })
    );
  });

  it('social links open in new tab', () => {
    renderFooter();
    const instagram = screen.getByRole('link', { name: /instagram/i });
    const facebook = screen.getByRole('link', { name: /facebook/i });
    const twitter = screen.getByRole('link', { name: /twitter/i });
    expect(instagram).toHaveAttribute('target', '_blank');
    expect(facebook).toHaveAttribute('target', '_blank');
    expect(twitter).toHaveAttribute('target', '_blank');
  });
});
