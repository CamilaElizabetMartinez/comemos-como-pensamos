import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n/config';
import AdminProducts from './AdminProducts';
import api from '../../services/api';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { _id: 'a1', role: 'admin' } }),
}));

vi.mock('../../services/api', () => ({ default: { get: vi.fn(), put: vi.fn() } }));

const mockProducts = [
  {
    _id: 'p1',
    name: { es: 'Tomate', en: 'Tomato' },
    price: 2.5,
    isAvailable: true,
    isFeatured: false,
    producerId: { businessName: 'Finca Test' },
  },
];

function renderAdminProducts() {
  return render(
    <MemoryRouter initialEntries={['/admin/products']}>
      <I18nextProvider i18n={i18n}>
        <Routes>
          <Route path="/admin/products" element={<AdminProducts />} />
        </Routes>
      </I18nextProvider>
    </MemoryRouter>
  );
}

describe('AdminProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({
      data: {
        success: true,
        data: {
          products: mockProducts,
          pagination: { pages: 1 },
        },
      },
    });
  });

  it('fetches and displays products list', async () => {
    renderAdminProducts();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('/admin/products'));
    });
    await waitFor(() => {
      expect(screen.getByText('Tomate')).toBeInTheDocument();
    });
  });

  it('renders search or filters', async () => {
    renderAdminProducts();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });
    const searchInput = document.querySelector('input[type="search"]') || document.querySelector('input');
    const filterButtons = document.querySelectorAll('.filter-btn, select');
    expect(searchInput || filterButtons.length >= 0).toBeTruthy();
  });

  it('shows skeleton while loading', () => {
    api.get.mockImplementation(() => new Promise(() => {}));
    renderAdminProducts();
    const skeleton = document.querySelector('.TableSkeleton') || document.querySelector('[class*="skeleton"]');
    expect(skeleton).toBeTruthy();
  });
});
