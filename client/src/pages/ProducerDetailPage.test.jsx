import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProducerDetailPage from './ProducerDetailPage';
import i18n from '../i18n/config';
import { I18nextProvider } from 'react-i18next';
import api from '../services/api';
import { CartProvider } from '../context/CartContext';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockProducer = {
  _id: 'p1',
  businessName: 'Finca El Sol',
  description: { es: 'Productores de aceite ecológico.', en: 'Organic oil producers.' },
  location: { city: 'Málaga', region: 'Andalucía' },
  logo: 'https://example.com/logo.jpg',
  certifications: ['Ecológico'],
  isApproved: true,
};

const mockProducts = [
  {
    _id: 'prod-1',
    name: { es: 'Aceite 500ml', en: 'Oil 500ml' },
    price: 8,
    stock: 20,
    images: [],
    isAvailable: true,
  },
];

function renderProducerDetail(id = 'p1') {
  return render(
    <MemoryRouter initialEntries={[`/producers/${id}`]}>
      <I18nextProvider i18n={i18n}>
        <CartProvider>
          <Routes>
            <Route path="/producers/:id" element={<ProducerDetailPage />} />
          </Routes>
        </CartProvider>
      </I18nextProvider>
    </MemoryRouter>
  );
}

describe('ProducerDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockImplementation((url) => {
      if (url.includes('/producers/p1') && !url.includes('/reviews')) {
        return Promise.resolve({
          data: {
            data: {
              producer: mockProducer,
              products: mockProducts,
            },
          },
        });
      }
      if (url.includes('reviews/producer')) {
        return Promise.resolve({ data: { data: { reviews: [] } } });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  it('renders producer info after load', async () => {
    renderProducerDetail();
    await waitFor(() => {
      expect(screen.getAllByText('Finca El Sol').length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getByText(/productores de aceite|aceite ecológico/i)).toBeInTheDocument();
  });

  it('renders producer location', async () => {
    renderProducerDetail();
    await waitFor(() => {
      expect(screen.getAllByText('Finca El Sol').length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getAllByText(/Málaga/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders certifications when present', async () => {
    renderProducerDetail();
    await waitFor(() => {
      expect(screen.getAllByText('Finca El Sol').length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getByText('Ecológico')).toBeInTheDocument();
  });

  it('renders producer products list', async () => {
    renderProducerDetail();
    await waitFor(() => {
      expect(screen.getAllByText('Finca El Sol').length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getByText('Aceite 500ml')).toBeInTheDocument();
  });

  it('shows skeleton while loading', () => {
    api.get.mockImplementation(() => new Promise(() => {}));
    renderProducerDetail();
    const skeleton = document.querySelector('.skeleton') || document.querySelector('[class*="skeleton"]');
    expect(skeleton).toBeTruthy();
  });
});
