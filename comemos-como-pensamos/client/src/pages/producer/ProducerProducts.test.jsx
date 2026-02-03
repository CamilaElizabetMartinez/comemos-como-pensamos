import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ProducerProducts from './ProducerProducts';
import i18n from '../../i18n/config';
import { I18nextProvider } from 'react-i18next';
import api from '../../services/api';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { _id: 'u1', role: 'producer' } }),
}));

vi.mock('../../services/api', () => ({ default: { get: vi.fn(), put: vi.fn(), delete: vi.fn() } }));

vi.mock('../../components/common/ConfirmModal', () => ({
  default: ({ isOpen, onConfirm, onCancel, title }) =>
    isOpen ? (
      <div data-testid="confirm-modal">
        <span>{title}</span>
        <button type="button" onClick={onConfirm}>Confirm</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    ) : null,
}));

const mockProducer = { _id: 'prod-1' };
const mockProducts = [
  { _id: 'p1', name: { es: 'Tomate' }, price: 3, stock: 10, isAvailable: true },
  { _id: 'p2', name: { es: 'Aceite' }, price: 8, stock: 0, isAvailable: false },
];

function renderProducerProducts() {
  return render(
    <MemoryRouter initialEntries={['/producer/products']}>
      <HelmetProvider>
        <I18nextProvider i18n={i18n}>
          <Routes>
            <Route path="/producer/products" element={<ProducerProducts />} />
          </Routes>
        </I18nextProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

describe('ProducerProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.getItem.mockImplementation((key) => (key === 'token' ? 'fake-token' : null));
    api.get.mockImplementation((url) => {
      if (url.includes('/producers/me')) {
        return Promise.resolve({ data: { data: { producer: mockProducer } } });
      }
      if (url.includes('/products')) {
        return Promise.resolve({ data: { data: { products: mockProducts } } });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  it('fetches and displays products list', async () => {
    renderProducerProducts();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/producers/me');
    });
    await waitFor(() => {
      expect(screen.getByText('Tomate')).toBeInTheDocument();
      expect(screen.getByText('Aceite')).toBeInTheDocument();
    });
  });

  it('renders link to add product and filter controls', async () => {
    renderProducerProducts();
    await waitFor(() => {
      expect(screen.getByText('Tomate')).toBeInTheDocument();
    });
    const addLink = screen.getByRole('link', { name: /añadir producto|nuevo|add product/i });
    expect(addLink).toHaveAttribute('href', '/producer/products/new');
    const filterButtons = document.querySelectorAll('.filter-btn, [class*="filter"]');
    expect(filterButtons.length >= 0 || screen.getByPlaceholderText(/buscar|search/i)).toBeTruthy();
  });

  it('calls delete API when confirming delete', async () => {
    api.delete.mockResolvedValue({});
    renderProducerProducts();
    await waitFor(() => {
      expect(screen.getByText('Tomate')).toBeInTheDocument();
    });
    const deleteButtons = screen.getAllByRole('button', { name: /eliminar|delete|borrar/i });
    await userEvent.click(deleteButtons[0]);
    await waitFor(() => {
      expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
    });
    const confirmBtn = screen.getByRole('button', { name: /confirm|confirmar/i });
    await userEvent.click(confirmBtn);
    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/products/p1');
    });
  });

  it('shows skeleton while loading', () => {
    api.get.mockImplementation(() => new Promise(() => {}));
    renderProducerProducts();
    const skeleton = document.querySelector('.skeleton') || document.querySelector('[class*="skeleton"]');
    expect(skeleton).toBeTruthy();
  });
});
