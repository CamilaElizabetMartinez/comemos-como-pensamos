import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PrivacyPage from './PrivacyPage';
import i18n from '../i18n/config';
import { I18nextProvider } from 'react-i18next';

function renderPrivacyPage() {
  return render(
    <MemoryRouter>
      <I18nextProvider i18n={i18n}>
        <PrivacyPage />
      </I18nextProvider>
    </MemoryRouter>
  );
}

describe('PrivacyPage', () => {
  it('renders privacy title', () => {
    renderPrivacyPage();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders legal sections', () => {
    renderPrivacyPage();
    const sections = document.querySelectorAll('.legal-page section');
    expect(sections.length).toBeGreaterThanOrEqual(1);
  });
});
