import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import useSEO from '../hooks/useSEO';
import { ListSkeleton } from '../components/common/Skeleton';
import './BlogPage.css';

const CATEGORIES = [
  { key: 'all', value: '' },
  { key: 'recipes', value: 'recipes' },
  { key: 'tips', value: 'tips' },
  { key: 'producers', value: 'producers' },
  { key: 'sustainability', value: 'sustainability' },
  { key: 'news', value: 'news' }
];

const BlogPage = () => {
  const { t, i18n } = useTranslation();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useSEO({
    title: t('blog.seo.title'),
    description: t('blog.seo.description'),
    keywords: t('blog.seo.keywords'),
    canonicalUrl: 'https://comemoscomopensamos.es/blog'
  });

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('limit', 9);
      if (selectedCategory) {
        params.append('category', selectedCategory);
      }

      const response = await api.get(`/articles?${params.toString()}`);
      setArticles(response.data.data.articles);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedCategory]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  }, []);

  const getLocalizedContent = useCallback((field) => {
    if (!field) return '';
    const currentLang = i18n.language;
    return field[currentLang] || field.es || '';
  }, [i18n.language]);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [i18n.language]);

  const featuredArticle = useMemo(() => {
    return articles.length > 0 ? articles[0] : null;
  }, [articles]);

  const remainingArticles = useMemo(() => {
    return articles.slice(1);
  }, [articles]);

  if (loading && articles.length === 0) {
    return (
      <div className="blog-page">
        <section className="blog-hero">
          <div className="container">
            <h1>{t('blog.title')}</h1>
            <p>{t('blog.subtitle')}</p>
          </div>
        </section>
        <section className="blog-content">
          <div className="container">
            <ListSkeleton type="article" count={6} />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="blog-page">
      <section className="blog-hero">
        <div className="container">
          <h1>{t('blog.title')}</h1>
          <p>{t('blog.subtitle')}</p>
        </div>
      </section>

      <section className="blog-content">
        <div className="container">
          <div className="blog-filters">
            {CATEGORIES.map((category) => (
              <button
                key={category.key}
                className={`filter-btn ${selectedCategory === category.value ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category.value)}
              >
                {t(`blog.categories.${category.key}`)}
              </button>
            ))}
          </div>

          {articles.length === 0 ? (
            <div className="no-articles">
              <p>{t('blog.noArticles')}</p>
            </div>
          ) : (
            <>
              {featuredArticle && currentPage === 1 && !selectedCategory && (
                <Link to={`/blog/${featuredArticle.slug}`} className="featured-article">
                  <div className="featured-image">
                    {featuredArticle.featuredImage ? (
                      <img 
                        src={featuredArticle.featuredImage} 
                        alt={getLocalizedContent(featuredArticle.title)}
                        loading="lazy"
                      />
                    ) : (
                      <div className="image-placeholder">📰</div>
                    )}
                    <span className="category-badge">
                      {t(`blog.categories.${featuredArticle.category}`)}
                    </span>
                  </div>
                  <div className="featured-content">
                    <h2>{getLocalizedContent(featuredArticle.title)}</h2>
                    <p className="excerpt">{getLocalizedContent(featuredArticle.excerpt)}</p>
                    <div className="article-meta">
                      <span className="date">{formatDate(featuredArticle.publishedAt)}</span>
                      <span className="reading-time">
                        {t('blog.readingTime', { minutes: featuredArticle.readingTime })}
                      </span>
                    </div>
                  </div>
                </Link>
              )}

              <div className="articles-grid">
                {(currentPage === 1 && !selectedCategory ? remainingArticles : articles).map((article) => (
                  <Link 
                    key={article._id} 
                    to={`/blog/${article.slug}`} 
                    className="article-card"
                  >
                    <div className="article-image">
                      {article.featuredImage ? (
                        <img 
                          src={article.featuredImage} 
                          alt={getLocalizedContent(article.title)}
                          loading="lazy"
                        />
                      ) : (
                        <div className="image-placeholder">📰</div>
                      )}
                      <span className="category-badge">
                        {t(`blog.categories.${article.category}`)}
                      </span>
                    </div>
                    <div className="article-content">
                      <h3>{getLocalizedContent(article.title)}</h3>
                      <p className="excerpt">{getLocalizedContent(article.excerpt)}</p>
                      <div className="article-meta">
                        <span className="date">{formatDate(article.publishedAt)}</span>
                        <span className="reading-time">
                          {t('blog.readingTime', { minutes: article.readingTime })}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    {t('common.previous')}
                  </button>
                  <span className="page-info">
                    {t('common.pageOf', { current: currentPage, total: totalPages })}
                  </span>
                  <button
                    className="pagination-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    {t('common.next')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
