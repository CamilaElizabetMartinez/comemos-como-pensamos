import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ProductsPage from './ProductsPage';
import i18n from '../i18n/config';
import { I18nextProvider } from 'react-i18next';
import { productService } from '../services/productService';
import api from '../services/api';
import { CartProvider } from '../context/CartContext';

vi.mock('../services/productService', () => ({
  productService: {
    getProducts: vi.fn(),
  },
}));

vi.mock('../services/api', () => ({
  default: { get: vi.fn() },
}));

vi.mock('../components/common/SearchAutocomplete', () => ({
  default: ({ value, onChange, placeholder }) => (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label="search"
    />
  ),
}));

const mockProducts = [
  {
    _id: '1',
    name: { es: 'Tomate', en: 'Tomato' },
    price: 3.5,
    stock: 10,
    images: [],
    isAvailable: true,
    producerId: 'p1',
    producerName: 'Finca Test',
  },
];

function renderProductsPage() {
  return render(
    <MemoryRouter>
      <HelmetProvider>
        <I18nextProvider i18n={i18n}>
          <CartProvider>
            <ProductsPage />
          </CartProvider>
        </I18nextProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

describe('ProductsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: { data: { producers: [] } } });
    productService.getProducts.mockResolvedValue({
      data: {
        products: mockProducts,
        totalPages: 1,
        total: 1,
      },
    });
  });

  it('renders products list after loading', async () => {
    renderProductsPage();
    await waitFor(() => {
      expect(productService.getProducts).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(screen.getByText('Tomate')).toBeInTheDocument();
    });
  });

  it('shows skeleton while loading', async () => {
    productService.getProducts.mockImplementation(() => new Promise(() => {}));
    renderProductsPage();
    await waitFor(() => {
      expect(productService.getProducts).toHaveBeenCalled();
    });
    const skeleton = document.querySelector('.skeleton');
    expect(skeleton || document.querySelector('[class*="skeleton"]')).toBeTruthy();
  });

  it('renders filter controls', async () => {
    renderProductsPage();
    await waitFor(() => {
      expect(productService.getProducts).toHaveBeenCalled();
    });
    const filterBtn = screen.getByRole('button', { name: /filtrar|filter/i });
    expect(filterBtn).toBeInTheDocument();
  });

  it('renders sort select', async () => {
    renderProductsPage();
    await waitFor(() => {
      expect(productService.getProducts).toHaveBeenCalled();
    });
    const sortSelect = document.querySelector('select');
    expect(sortSelect).toBeInTheDocument();
  });

  it('calls getProducts again when sort changes', async () => {
    renderProductsPage();
    await waitFor(() => {
      expect(productService.getProducts).toHaveBeenCalled();
    });
    const initialCalls = productService.getProducts.mock.calls.length;
    const sortSelects = document.querySelectorAll('select');
    const sortSelect = Array.from(sortSelects).find((select) =>
      select.options.length > 1
    );
    if (sortSelect) {
      await userEvent.selectOptions(sortSelect, sortSelect.options[1]?.value || sortSelect.value);
      await waitFor(() => {
        expect(productService.getProducts.mock.calls.length).toBeGreaterThan(initialCalls);
      });
    }
  });

  it('renders add to cart on product cards', async () => {
    renderProductsPage();
    await waitFor(() => {
      expect(screen.getByText('Añadir al carrito')).toBeInTheDocument();
    });
  });
});
