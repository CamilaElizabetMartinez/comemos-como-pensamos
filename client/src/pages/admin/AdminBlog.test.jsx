import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import AdminBlog from './AdminBlog';
import i18n from '../../i18n/config';
import { I18nextProvider } from 'react-i18next';
import api from '../../services/api';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { _id: 'a1', role: 'admin' } }),
}));

vi.mock('../../services/api', () => ({ default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));

vi.mock('../../components/common/ImageUploader', () => ({
  default: () => <div data-testid="image-uploader">Featured image</div>,
}));

vi.mock('../../components/common/ConfirmModal', () => ({
  default: ({ isOpen, onConfirm, onCancel }) =>
    isOpen ? (
      <div data-testid="confirm-modal">
        <button type="button" onClick={onConfirm}>Confirm</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    ) : null,
}));

const mockArticles = [
  { _id: 'art1', title: { es: 'Receta de gazpacho' }, slug: 'receta-gazpacho', status: 'published', category: 'recipes' },
  { _id: 'art2', title: { es: 'Borrador' }, slug: 'borrador', status: 'draft', category: 'tips' },
];

function renderAdminBlog() {
  return render(
    <MemoryRouter initialEntries={['/admin/blog']}>
      <HelmetProvider>
        <I18nextProvider i18n={i18n}>
          <Routes>
            <Route path="/admin/blog" element={<AdminBlog />} />
            <Route path="/admin" element={<div data-testid="admin-dashboard">Dashboard</div>} />
          </Routes>
        </I18nextProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

describe('AdminBlog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.getItem.mockImplementation((key) => (key === 'token' ? 'fake-token' : null));
    api.get.mockResolvedValue({
      data: { success: true, data: { articles: mockArticles } },
    });
  });

  it('fetches and displays articles list', async () => {
    renderAdminBlog();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('/articles/admin'));
    });
    await waitFor(() => {
      expect(screen.getByText('Receta de gazpacho')).toBeInTheDocument();
      expect(screen.getAllByText('Borrador').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders button to create article', async () => {
    renderAdminBlog();
    await waitFor(() => {
      expect(screen.getByText('Receta de gazpacho')).toBeInTheDocument();
    });
    const primaryButtons = document.querySelectorAll('.btn-primary');
    expect(primaryButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('opens modal when clicking create article', async () => {
    renderAdminBlog();
    await waitFor(() => {
      expect(screen.getByText('Receta de gazpacho')).toBeInTheDocument();
    });
    const createButton = document.querySelector('.btn-primary');
    await userEvent.click(createButton);
    await waitFor(() => {
      expect(screen.getByTestId('image-uploader')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching', () => {
    api.get.mockImplementation(() => new Promise(() => {}));
    renderAdminBlog();
    const loadingEl = document.querySelector('.loading') || document.querySelector('[class*="loading"]');
    expect(loadingEl).toBeTruthy();
  });
});
