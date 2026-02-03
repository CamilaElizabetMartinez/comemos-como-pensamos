import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import FavoritesPage from './FavoritesPage';
import i18n from '../i18n/config';
import { I18nextProvider } from 'react-i18next';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import api from '../services/api';

vi.mock('../services/api', () => ({ default: { get: vi.fn(), delete: vi.fn() } }));

const mockFavorites = [
  {
    _id: 'prod-1',
    name: { es: 'Aceite de Oliva', en: 'Olive Oil' },
    price: 8,
    images: [{ url: 'https://example.com/oil.jpg' }],
    stock: 20,
  },
];

function renderFavoritesPage() {
  return render(
    <MemoryRouter>
      <HelmetProvider>
        <I18nextProvider i18n={i18n}>
          <AuthProvider>
            <CartProvider>
              <FavoritesPage />
            </CartProvider>
          </AuthProvider>
        </I18nextProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

describe('FavoritesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: { data: { favorites: mockFavorites } } });
  });

  it('fetches and displays favorites list', async () => {
    renderFavoritesPage();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/favorites');
    });
    await waitFor(() => {
      expect(screen.getByText('Aceite de Oliva')).toBeInTheDocument();
    });
  });

  it('shows empty state when no favorites', async () => {
    api.get.mockResolvedValue({ data: { data: { favorites: [] } } });
    renderFavoritesPage();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(screen.getByText(/no tienes favoritos|empty|favoritos vacíos/i)).toBeInTheDocument();
    });
  });

  it('renders remove and add to cart for each favorite', async () => {
    renderFavoritesPage();
    await waitFor(() => {
      expect(screen.getByText('Aceite de Oliva')).toBeInTheDocument();
    });
    const removeButtons = screen.getAllByRole('button', { name: /quitar|remove|eliminar/i });
    const addToCartButtons = screen.getAllByRole('button', { name: /añadir al carrito|add to cart/i });
    expect(removeButtons.length).toBeGreaterThanOrEqual(1);
    expect(addToCartButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('calls delete API when remove is clicked', async () => {
    api.delete.mockResolvedValue({});
    renderFavoritesPage();
    await waitFor(() => {
      expect(screen.getByText('Aceite de Oliva')).toBeInTheDocument();
    });
    const removeButton = screen.getAllByRole('button', { name: /quitar|remove|eliminar/i })[0];
    await userEvent.click(removeButton);
    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/favorites/prod-1');
    });
  });

  it('shows skeleton while loading', () => {
    api.get.mockImplementation(() => new Promise(() => {}));
    renderFavoritesPage();
    const skeleton = document.querySelector('.skeleton') || document.querySelector('[class*="skeleton"]');
    expect(skeleton).toBeTruthy();
  });
});
