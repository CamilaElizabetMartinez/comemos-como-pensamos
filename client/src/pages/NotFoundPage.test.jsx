import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFoundPage from './NotFoundPage';
import i18n from '../i18n/config';
import { I18nextProvider } from 'react-i18next';

function renderNotFoundPage() {
  return render(
    <MemoryRouter>
      <I18nextProvider i18n={i18n}>
        <NotFoundPage />
      </I18nextProvider>
    </MemoryRouter>
  );
}

describe('NotFoundPage', () => {
  it('displays 404 error code', () => {
    renderNotFoundPage();
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('renders title and message', () => {
    renderNotFoundPage();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/página no encontrada|not found|no existe/i)).toBeInTheDocument();
  });

  it('renders link to home', () => {
    renderNotFoundPage();
    const homeLink = screen.getByRole('link', { name: /inicio|home/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('renders link to products', () => {
    renderNotFoundPage();
    const productsLinks = screen.getAllByRole('link', { name: /productos|products/i });
    const productsHref = productsLinks.find((link) => link.getAttribute('href') === '/products');
    expect(productsHref).toBeTruthy();
  });

  it('renders link to contact', () => {
    renderNotFoundPage();
    const contactLinks = screen.getAllByRole('link', { name: /contacto|contact/i });
    expect(contactLinks.length).toBeGreaterThanOrEqual(1);
    const contactHref = contactLinks.find((link) => link.getAttribute('href') === '/contact');
    expect(contactHref).toBeTruthy();
  });
});
