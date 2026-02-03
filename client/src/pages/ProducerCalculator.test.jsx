import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProducerCalculator from './ProducerCalculator';
import i18n from '../i18n/config';
import { I18nextProvider } from 'react-i18next';

function renderProducerCalculator() {
  return render(
    <MemoryRouter>
      <I18nextProvider i18n={i18n}>
        <ProducerCalculator />
      </I18nextProvider>
    </MemoryRouter>
  );
}

describe('ProducerCalculator', () => {
  it('renders page heading', () => {
    renderProducerCalculator();
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });

  it('renders category or form controls', () => {
    renderProducerCalculator();
    const selects = document.querySelectorAll('select');
    const inputs = document.querySelectorAll('input[type="number"]');
    expect(selects.length + inputs.length).toBeGreaterThanOrEqual(1);
  });

  it('renders link back to home', () => {
    renderProducerCalculator();
    const link = screen.getByRole('link', { name: /volver al inicio|back to home|inicio/i });
    expect(link).toHaveAttribute('href', '/');
  });
});
