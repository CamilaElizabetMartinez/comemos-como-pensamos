import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../services/api';
import useSEO from '../hooks/useSEO';
import { ListSkeleton } from '../components/common/Skeleton';
import { IconFile } from '../components/common/Icons';
import './BlogPage.css';

const ShareButtons = ({ url, title }) => {
  const shareUrl = encodeURIComponent(url);
  const shareTitle = encodeURIComponent(title);
  
  return (
    <div className="share-buttons" onClick={(e) => e.preventDefault()}>
      <a 
        href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="share-btn twitter"
        aria-label="Compartir en Twitter"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </a>
      <a 
        href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="share-btn facebook"
        aria-label="Compartir en Facebook"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </a>
      <a 
        href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="share-btn linkedin"
        aria-label="Compartir en LinkedIn"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      </a>
    </div>
  );
};

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
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);

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

  const handleNewsletterSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    
    setNewsletterLoading(true);
    try {
      await api.post('/newsletter/subscribe', { email: newsletterEmail });
      toast.success(t('blog.newsletter.success'));
      setNewsletterEmail('');
    } catch (error) {
      const errorMsg = error.response?.data?.message || t('blog.newsletter.error');
      toast.error(errorMsg);
    } finally {
      setNewsletterLoading(false);
    }
  }, [newsletterEmail, t]);

  const getArticleUrl = useCallback((slug) => {
    return `${window.location.origin}/blog/${slug}`;
  }, []);

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
                <div className="featured-article-wrapper">
                  <Link to={`/blog/${featuredArticle.slug}`} className="featured-article">
                    <div className="featured-image">
                      {featuredArticle.featuredImage ? (
                        <img 
                          src={featuredArticle.featuredImage} 
                          alt={getLocalizedContent(featuredArticle.title)}
                          loading="lazy"
                        />
                      ) : (
                        <div className="image-placeholder"><IconFile size={48} /></div>
                      )}
                      <span className="category-badge">
                        {t(`blog.categories.${featuredArticle.category}`)}
                      </span>
                    </div>
                    <div className="featured-content">
                      <span className="featured-label">{t('blog.featured')}</span>
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
                  <div className="featured-share">
                    <ShareButtons 
                      url={getArticleUrl(featuredArticle.slug)} 
                      title={getLocalizedContent(featuredArticle.title)} 
                    />
                  </div>
                </div>
              )}

              <div className="articles-grid">
                {(currentPage === 1 && !selectedCategory ? remainingArticles : articles).map((article) => (
                  <article key={article._id} className="article-card">
                    <Link to={`/blog/${article.slug}`} className="article-link">
                      <div className="article-image">
                        {article.featuredImage ? (
                          <img 
                            src={article.featuredImage} 
                            alt={getLocalizedContent(article.title)}
                            loading="lazy"
                          />
                        ) : (
                          <div className="image-placeholder"><IconFile size={32} /></div>
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
                    <div className="article-share">
                      <ShareButtons 
                        url={getArticleUrl(article.slug)} 
                        title={getLocalizedContent(article.title)} 
                      />
                    </div>
                  </article>
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

      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-content">
            <div className="newsletter-text">
              <h2>{t('blog.newsletter.title')}</h2>
              <p>{t('blog.newsletter.subtitle')}</p>
            </div>
            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                placeholder={t('blog.newsletter.placeholder')}
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
              />
              <button type="submit" disabled={newsletterLoading}>
                {newsletterLoading ? t('common.loading') : t('blog.newsletter.subscribe')}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
