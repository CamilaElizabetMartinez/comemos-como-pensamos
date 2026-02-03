import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TermsPage from './TermsPage';
import i18n from '../i18n/config';
import { I18nextProvider } from 'react-i18next';

function renderTermsPage() {
  return render(
    <MemoryRouter>
      <I18nextProvider i18n={i18n}>
        <TermsPage />
      </I18nextProvider>
    </MemoryRouter>
  );
}

describe('TermsPage', () => {
  it('renders terms title', () => {
    renderTermsPage();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders legal sections', () => {
    renderTermsPage();
    const sections = document.querySelectorAll('.legal-page section');
    expect(sections.length).toBeGreaterThanOrEqual(1);
  });
});
