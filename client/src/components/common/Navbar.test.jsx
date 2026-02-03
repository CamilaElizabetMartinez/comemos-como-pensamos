import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';
import { AuthProvider } from '../../context/AuthContext';
import { CartProvider } from '../../context/CartContext';
import { LanguageProvider } from '../../context/LanguageContext';
import i18n from '../../i18n/config';
import { I18nextProvider } from 'react-i18next';

function renderNavbar() {
  return render(
    <MemoryRouter>
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <CartProvider>
            <LanguageProvider>
              <Navbar />
            </LanguageProvider>
          </CartProvider>
        </AuthProvider>
      </I18nextProvider>
    </MemoryRouter>
  );
}

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders logo linking to home', () => {
    renderNavbar();
    const logoLink = screen.getByRole('link', { name: /comemos como pensamos/i });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('renders nav links: Inicio, Productos, Productores, Blog', () => {
    renderNavbar();
    const links = screen.getAllByRole('link');
    expect(links.find(link => link.getAttribute('href') === '/' && link.textContent?.trim() === 'Inicio')).toBeDefined();
    expect(links.find(link => link.getAttribute('href') === '/products')).toBeDefined();
    expect(links.find(link => link.getAttribute('href') === '/producers')).toBeDefined();
    expect(links.find(link => link.getAttribute('href') === '/blog')).toBeDefined();
  });

  it('renders cart link', () => {
    renderNavbar();
    const cartLink = screen.getByRole('link', { name: /carrito/i });
    expect(cartLink).toBeInTheDocument();
    expect(cartLink).toHaveAttribute('href', '/cart');
  });

  it('renders login and register when not authenticated', () => {
    renderNavbar();
    expect(screen.getByRole('link', { name: /iniciar sesión/i })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: /registrarse/i })).toHaveAttribute('href', '/register');
  });

  it('renders hamburger button for mobile', () => {
    renderNavbar();
    const hamburger = document.querySelector('.hamburger-btn');
    expect(hamburger).toBeInTheDocument();
    expect(hamburger).toHaveAttribute('aria-label', 'Abrir menú');
  });

  it('opens mobile menu when hamburger is clicked', async () => {
    renderNavbar();
    const hamburger = document.querySelector('.hamburger-btn');
    await userEvent.click(hamburger);
    const menu = document.getElementById('mobile-menu');
    expect(menu).toHaveClass('open');
  });

  it('renders mobile overlay when menu is open', async () => {
    renderNavbar();
    const hamburger = document.querySelector('.hamburger-btn');
    await userEvent.click(hamburger);
    const overlay = document.querySelector('.mobile-overlay');
    expect(overlay).toBeInTheDocument();
  });

  it('closes mobile menu when overlay is clicked', async () => {
    renderNavbar();
    const hamburger = document.querySelector('.hamburger-btn');
    await userEvent.click(hamburger);
    const overlay = document.querySelector('.mobile-overlay');
    await userEvent.click(overlay);
    const menu = document.getElementById('mobile-menu');
    expect(menu).not.toHaveClass('open');
  });

  it('has language selector', () => {
    renderNavbar();
    const langButton = screen.getByRole('button', { name: /cambiar idioma/i });
    expect(langButton).toBeInTheDocument();
  });

  it('language selector shows ES, EN, FR, DE options when opened', async () => {
    renderNavbar();
    const langButton = screen.getByRole('button', { name: /cambiar idioma/i });
    await userEvent.click(langButton);
    const dropdown = document.querySelector('.language-dropdown');
    expect(dropdown).toBeInTheDocument();
    expect(screen.getByText('Español')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Français')).toBeInTheDocument();
    expect(screen.getByText('Deutsch')).toBeInTheDocument();
  });
});
