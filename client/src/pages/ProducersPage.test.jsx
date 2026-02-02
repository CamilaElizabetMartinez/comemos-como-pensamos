import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ProducersPage from './ProducersPage';
import i18n from '../i18n/config';
import { I18nextProvider } from 'react-i18next';
import api from '../services/api';

vi.mock('../services/api', () => ({ default: { get: vi.fn() } }));

const mockProducers = [
  {
    _id: 'p1',
    businessName: 'Finca El Sol',
    location: { city: 'Málaga' },
    logo: 'https://example.com/logo.jpg',
    isApproved: true,
  },
];

function renderProducersPage() {
  return render(
    <MemoryRouter>
      <HelmetProvider>
        <I18nextProvider i18n={i18n}>
          <ProducersPage />
        </I18nextProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

describe('ProducersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({
      data: { data: { producers: mockProducers }, totalPages: 1 },
    });
  });

  it('renders producers list after loading', async () => {
    renderProducersPage();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('/producers'));
    });
    await waitFor(() => {
      expect(screen.getByText('Finca El Sol')).toBeInTheDocument();
    });
  });

  it('cards show producer name and location', async () => {
    renderProducersPage();
    await waitFor(() => {
      expect(screen.getByText('Finca El Sol')).toBeInTheDocument();
    });
    expect(screen.getByText('Málaga')).toBeInTheDocument();
  });

  it('renders link to producer profile', async () => {
    renderProducersPage();
    await waitFor(() => {
      expect(screen.getByText('Finca El Sol')).toBeInTheDocument();
    });
    const links = screen.getAllByRole('link', { name: /finca el sol|ver productos/i });
    expect(links.length).toBeGreaterThanOrEqual(1);
  });

  it('shows skeleton while loading', () => {
    api.get.mockImplementation(() => new Promise(() => {}));
    renderProducersPage();
    const skeleton = document.querySelector('.skeleton') || document.querySelector('[class*="skeleton"]');
    expect(skeleton).toBeTruthy();
  });

  it('renders search and filter controls', async () => {
    renderProducersPage();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('/producers'));
    });
    const searchInput = document.querySelector('.search-input') || document.querySelector('input[type="text"]');
    const submitButton = screen.getByRole('button', { name: /buscar|search/i });
    expect(searchInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });
});
