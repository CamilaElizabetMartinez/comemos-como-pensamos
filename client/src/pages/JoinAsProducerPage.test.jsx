import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import JoinAsProducerPage from './JoinAsProducerPage';
import i18n from '../i18n/config';
import { I18nextProvider } from 'react-i18next';

vi.mock('../hooks/useSEO', () => ({
  default: () => {},
}));

function renderJoinAsProducer() {
  return render(
    <MemoryRouter>
      <I18nextProvider i18n={i18n}>
        <JoinAsProducerPage />
      </I18nextProvider>
    </MemoryRouter>
  );
}

describe('JoinAsProducerPage', () => {
  it('renders main heading', () => {
    renderJoinAsProducer();
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });

  it('renders link to register', () => {
    renderJoinAsProducer();
    const registerLinks = screen.getAllByRole('link', { name: /empezar ahora|crear mi cuenta/i });
    const registerLink = registerLinks.find((link) => link.getAttribute('href') === '/register');
    expect(registerLink).toBeDefined();
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  it('renders link to calculator', () => {
    renderJoinAsProducer();
    const calcLinks = screen.getAllByRole('link', { name: /calcular mis ganancias/i });
    const calcLink = calcLinks.find((link) => link.getAttribute('href') === '/calculadora-productor');
    expect(calcLink).toBeDefined();
    expect(calcLink).toHaveAttribute('href', '/calculadora-productor');
  });

  it('renders benefits or steps section', () => {
    renderJoinAsProducer();
    const content = document.body.textContent;
    expect(content).toMatch(/ventajas|beneficios|pasos|steps|comisión|commission/i);
  });
});
