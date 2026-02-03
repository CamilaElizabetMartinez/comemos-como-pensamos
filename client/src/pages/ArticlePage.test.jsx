import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/config';
import ArticlePage from './ArticlePage';
import api from '../services/api';

vi.mock('../services/api', () => ({ default: { get: vi.fn() } }));
vi.mock('../hooks/useSEO', () => ({ default: () => {} }));
vi.mock('../components/common/Breadcrumbs', () => ({ default: () => <nav aria-label="Breadcrumb">Breadcrumb</nav> }));

const mockArticle = {
  _id: 'art1',
  slug: 'test-article',
  title: { es: 'Artículo de prueba', en: 'Test article' },
  excerpt: { es: 'Resumen del artículo.', en: 'Article excerpt.' },
  content: { es: 'Contenido del artículo.\n\nPárrafo dos.', en: 'Article content.' },
  category: 'recipes',
  featuredImage: 'https://example.com/img.jpg',
  publishedAt: '2025-01-15T10:00:00.000Z',
  updatedAt: '2025-01-15T10:00:00.000Z',
  readingTime: 5,
  author: { firstName: 'Ana', lastName: 'García' },
  tags: ['recetas', 'salud'],
};

function renderArticlePage(slug = 'test-article') {
  return render(
    <MemoryRouter initialEntries={[`/blog/${slug}`]}>
      <I18nextProvider i18n={i18n}>
        <Routes>
          <Route path="/blog/:slug" element={<ArticlePage />} />
          <Route path="/blog" element={<div>Blog list</div>} />
        </Routes>
      </I18nextProvider>
    </MemoryRouter>
  );
}

describe('ArticlePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows skeleton while loading', () => {
    api.get.mockImplementation(() => new Promise(() => {}));
    renderArticlePage();
    const skeleton = document.querySelector('.skeleton') || document.querySelector('[class*="skeleton"]');
    expect(skeleton).toBeTruthy();
  });

  it('fetches article by slug and displays title and content', async () => {
    api.get.mockResolvedValue({
      data: { data: { article: mockArticle } },
    });
    renderArticlePage();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/articles/test-article');
    });
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Artículo de prueba' })).toBeInTheDocument();
    });
    expect(screen.getByText(/Contenido del artículo/)).toBeInTheDocument();
  });

  it('displays author and date when article is loaded', async () => {
    api.get.mockResolvedValue({
      data: { data: { article: mockArticle } },
    });
    renderArticlePage();
    await waitFor(() => {
      expect(screen.getByText('Ana García')).toBeInTheDocument();
    });
  });

  it('shows not found state when article fetch fails', async () => {
    api.get.mockRejectedValue(new Error('Not found'));
    renderArticlePage();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /artículo no encontrado|article not found/i })).toBeInTheDocument();
    });
    const backLink = screen.getByRole('link', { name: /volver al blog|back to blog/i });
    expect(backLink).toHaveAttribute('href', '/blog');
  });

  it('renders link back to blog when article is loaded', async () => {
    api.get.mockResolvedValue({
      data: { data: { article: mockArticle } },
    });
    renderArticlePage();
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
    const blogLinks = screen.getAllByRole('link', { name: /blog|artículos/i });
    const backToBlog = blogLinks.find((link) => link.getAttribute('href') === '/blog');
    expect(backToBlog).toBeTruthy();
  });
});
