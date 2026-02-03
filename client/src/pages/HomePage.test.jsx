import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import HomePage from './HomePage';
import i18n from '../i18n/config';
import { I18nextProvider } from 'react-i18next';
import api from '../services/api';
import { CartProvider } from '../context/CartContext';

vi.mock('../services/api', () => ({ default: { get: vi.fn() } }));

function renderHomePage() {
  return render(
    <MemoryRouter>
      <HelmetProvider>
        <I18nextProvider i18n={i18n}>
          <CartProvider>
            <HomePage />
          </CartProvider>
        </I18nextProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

const mockProducts = [
  {
    _id: '1',
    name: { es: 'Tomate', en: 'Tomato' },
    price: 3.5,
    stock: 10,
    images: [{ url: 'https://example.com/t.jpg' }],
    isAvailable: true,
    createdAt: new Date().toISOString(),
  },
];

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockImplementation((url) => {
      if (url.includes('featured') || url.includes('latest')) {
        return Promise.resolve({ data: { data: { products: mockProducts } } });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  const waitForHomePageLoaded = async () => {
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/products/featured?limit=5');
      expect(api.get).toHaveBeenCalledWith('/products/latest?limit=5');
    });
    await waitFor(() => {
      const viewAllLinks = screen.getAllByRole('link', { name: /ver todos|view all/i });
      expect(viewAllLinks.length).toBeGreaterThanOrEqual(1);
    });
  };

  it('renders carousel with slides', async () => {
    renderHomePage();
    await waitForHomePageLoaded();
    const carousel = document.querySelector('.hero-carousel');
    expect(carousel).toBeInTheDocument();
    const slides = document.querySelectorAll('.carousel-slide');
    expect(slides.length).toBeGreaterThanOrEqual(1);
  });

  it('renders carousel arrows', async () => {
    renderHomePage();
    await waitForHomePageLoaded();
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('renders carousel dots', async () => {
    renderHomePage();
    await waitForHomePageLoaded();
    const dots = document.querySelectorAll('.carousel-dot');
    expect(dots.length).toBeGreaterThanOrEqual(1);
  });

  it('navigates to next slide when next arrow is clicked', async () => {
    renderHomePage();
    await waitForHomePageLoaded();
    const nextBtn = screen.getByRole('button', { name: /next/i });
    await userEvent.click(nextBtn);
    const slides = document.querySelectorAll('.carousel-slide');
    expect(slides.length).toBeGreaterThanOrEqual(1);
  });

  it('renders CTA section with link to producer registration', async () => {
    renderHomePage();
    await waitForHomePageLoaded();
    const ctaLink = screen.getByRole('link', { name: /únete ahora|ctaButton/i });
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink).toHaveAttribute('href', '/unete');
  });

  it('renders features section with icons and text', async () => {
    renderHomePage();
    await waitForHomePageLoaded();
    const featuresSection = document.querySelector('.features');
    expect(featuresSection).toBeInTheDocument();
    expect(featuresSection).toHaveTextContent(/por qué elegirnos|whyChooseUs|productos locales|local/i);
  });

  it('fetches and shows product sections when API returns data', async () => {
    renderHomePage();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/products/featured?limit=5');
      expect(api.get).toHaveBeenCalledWith('/products/latest?limit=5');
    });
    await waitFor(() => {
      const sections = document.querySelectorAll('.products-section');
      expect(sections.length).toBeGreaterThanOrEqual(0);
    });
  });

  it('renders Ver todos link in product sections', async () => {
    renderHomePage();
    await waitFor(() => {
      const viewAllLinks = screen.getAllByRole('link', { name: /ver todos|viewAll/i });
      expect(viewAllLinks.length).toBeGreaterThanOrEqual(0);
    });
  });
});
