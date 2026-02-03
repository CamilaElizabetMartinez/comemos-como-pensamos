import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ProducerProductForm from './ProducerProductForm';
import i18n from '../../i18n/config';
import { I18nextProvider } from 'react-i18next';
import api from '../../services/api';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { _id: 'u1', role: 'producer' } }),
}));

vi.mock('../../services/api', () => ({ default: { get: vi.fn(), post: vi.fn(), put: vi.fn() } }));

vi.mock('../../components/common/ImageUploader', () => ({
  default: ({ images, onImagesChange }) => (
    <div data-testid="image-uploader">
      <span data-testid="image-count">{images?.length ?? 0}</span>
      <button type="button" onClick={() => onImagesChange([...(images || []), { url: 'https://new.jpg' }])}>
        Add image
      </button>
    </div>
  ),
}));

const mockProduct = {
  _id: 'prod-123',
  name: { es: 'Tomate', en: 'Tomato' },
  description: { es: 'Tomate ecológico', en: '' },
  category: 'vegetables',
  price: 3.5,
  unit: 'kg',
  stock: 20,
  images: ['https://img1.jpg'],
  isAvailable: true,
  hasVariants: false,
  variants: [],
};

function renderCreateForm() {
  return render(
    <MemoryRouter initialEntries={['/producer/products/new']}>
      <HelmetProvider>
        <I18nextProvider i18n={i18n}>
          <Routes>
            <Route path="/producer/products/new" element={<ProducerProductForm />} />
            <Route path="/producer/products" element={<div data-testid="producer-products" />} />
          </Routes>
        </I18nextProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

function renderEditForm() {
  return render(
    <MemoryRouter initialEntries={['/producer/products/prod-123']}>
      <HelmetProvider>
        <I18nextProvider i18n={i18n}>
          <Routes>
            <Route path="/producer/products/:id" element={<ProducerProductForm />} />
            <Route path="/producer/products" element={<div data-testid="producer-products" />} />
          </Routes>
        </I18nextProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

describe('ProducerProductForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.getItem.mockImplementation((key) => (key === 'token' ? 'fake-token' : null));
  });

  describe('Create product', () => {
    it('renders create title and back link', () => {
      renderCreateForm();
      expect(screen.getByRole('heading', { name: /crear producto|create product/i })).toBeInTheDocument();
      const backLink = screen.getByRole('link', { name: /volver|back/i });
      expect(backLink).toHaveAttribute('href', '/producer/products');
    });

    it('renders tabs: General, Images, Pricing', () => {
      renderCreateForm();
      expect(screen.getByRole('button', { name: /general/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /imágenes|images/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /precio|pricing/i })).toBeInTheDocument();
    });

    it('renders name and description inputs in general tab', () => {
      renderCreateForm();
      const nameInput = document.querySelector('input.input-main') || screen.getByPlaceholderText(/tomates cherry|nombre del producto/i);
      const descriptionTextarea = document.querySelector('textarea.input-main') || document.querySelector('textarea[rows="4"]');
      expect(nameInput).toBeInTheDocument();
      expect(descriptionTextarea).toBeInTheDocument();
    });

    it('submits new product with required fields and calls POST /products', async () => {
      api.post.mockResolvedValue({ data: { success: true } });
      renderCreateForm();

      const nameInput = document.querySelector('input.input-main') || screen.getByPlaceholderText(/tomates|nombre/i);
      const descriptionField = document.querySelector('textarea.input-main') || document.querySelector('textarea');
      await userEvent.type(nameInput, 'Tomate cherry');
      await userEvent.type(descriptionField, 'Tomate ecológico');

      await userEvent.click(screen.getByRole('button', { name: /precio|pricing/i }));
      const priceInput = document.querySelector('input[name="price"]') || document.querySelector('input[placeholder="0.00"]');
      const stockInput = document.querySelector('input[name="stock"]') || document.querySelector('input[min="0"]');
      if (priceInput) await userEvent.type(priceInput, '4.5');
      if (stockInput) await userEvent.type(stockInput, '10');

      const submitButton = screen.getByRole('button', { name: /crear producto|create product|guardar/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/products', expect.objectContaining({
          name: expect.objectContaining({ es: 'Tomate cherry' }),
          description: expect.objectContaining({ es: 'Tomate ecológico' }),
        }));
      });
    });

    it('shows ImageUploader in images tab', async () => {
      renderCreateForm();
      await userEvent.click(screen.getByRole('button', { name: /imágenes|images/i }));
      expect(screen.getByTestId('image-uploader')).toBeInTheDocument();
    });

    it('toggle translations shows EN/FR/DE name and description inputs', async () => {
      renderCreateForm();
      const toggleButton = screen.getByRole('button', { name: /añadir traducciones|add translations|traducciones/i });
      await userEvent.click(toggleButton);
      const langLabels = document.querySelectorAll('.lang-label');
      expect(langLabels.length).toBeGreaterThanOrEqual(3);
    });

    it('pricing tab has price, unit, stock and availability toggle when no variants', async () => {
      renderCreateForm();
      await userEvent.click(screen.getByRole('button', { name: /precio|pricing/i }));
      await waitFor(() => {
        const priceInput = document.querySelector('input[name="price"]');
        const unitSelect = document.querySelector('select[name="unit"]');
        const stockInput = document.querySelector('input[name="stock"]');
        const availabilityCheckbox = document.querySelector('input[name="isAvailable"]');
        expect(priceInput).toBeInTheDocument();
        expect(unitSelect).toBeInTheDocument();
        expect(stockInput).toBeInTheDocument();
        expect(availabilityCheckbox).toBeInTheDocument();
        expect(availabilityCheckbox.checked).toBe(true);
      });
    });

    it('shows add variant button when variants are enabled', async () => {
      renderCreateForm();
      await userEvent.click(screen.getByRole('button', { name: /precio|pricing/i }));
      await waitFor(() => {
        const hasVariantsCheckbox = document.querySelector('.variants-toggle-card input[type="checkbox"]');
        expect(hasVariantsCheckbox).toBeInTheDocument();
      });
      const hasVariantsCheckbox = document.querySelector('.variants-toggle-card input[type="checkbox"]');
      await userEvent.click(hasVariantsCheckbox);
      await waitFor(() => {
        const addVariantButton = screen.getByRole('button', { name: /añadir variante|add variant/i });
        expect(addVariantButton).toBeInTheDocument();
      });
    });
  });

  describe('Edit product', () => {
    it('fetches product and shows edit title', async () => {
      api.get.mockResolvedValue({ data: { data: { product: mockProduct } } });
      renderEditForm();
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/products/prod-123');
      });
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /editar producto|edit product/i })).toBeInTheDocument();
      });
    });

    it('prefills form with product data', async () => {
      api.get.mockResolvedValue({ data: { data: { product: mockProduct } } });
      renderEditForm();
      await waitFor(() => {
        expect(screen.getByDisplayValue('Tomate')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Tomate ecológico')).toBeInTheDocument();
      });
      const categorySelect = document.querySelector('select[name="category"]');
      expect(categorySelect?.value).toBe('vegetables');
    });

    it('submits updates with PUT /products/:id', async () => {
      api.get.mockResolvedValue({ data: { data: { product: mockProduct } } });
      api.put.mockResolvedValue({ data: { success: true } });
      renderEditForm();
      await waitFor(() => {
        expect(screen.getByDisplayValue('Tomate')).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /guardar cambios|save changes/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(api.put).toHaveBeenCalledWith('/products/prod-123', expect.any(Object));
        const payload = api.put.mock.calls[0][1];
        expect(payload).toHaveProperty('name');
        expect(payload).toHaveProperty('description');
        expect(payload.category).toBe('vegetables');
      });
    });
  });

});
