import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import useSEO from '../hooks/useSEO';
import { PageSpinner } from '../components/common/Spinner';
import './ArticlePage.css';

const ArticlePage = () => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/articles/${slug}`);
        setArticle(response.data.data.article);
      } catch (error) {
        console.error('Error fetching article:', error);
        setError(t('blog.articleNotFound'));
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug, t]);

  useSEO({
    title: article ? `${getLocalizedContent(article.title)} | Comemos Como Pensamos` : t('blog.seo.title'),
    description: article ? getLocalizedContent(article.excerpt) : '',
    canonicalUrl: `https://comemoscomopensamos.es/blog/${slug}`,
    ogData: article ? {
      title: getLocalizedContent(article.title),
      description: getLocalizedContent(article.excerpt),
      type: 'article',
      image: article.featuredImage
    } : null,
    jsonLd: article ? {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': getLocalizedContent(article.title),
      'description': getLocalizedContent(article.excerpt),
      'image': article.featuredImage,
      'datePublished': article.publishedAt,
      'dateModified': article.updatedAt,
      'author': {
        '@type': 'Person',
        'name': article.author ? `${article.author.firstName} ${article.author.lastName}` : 'Comemos Como Pensamos'
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'Comemos Como Pensamos'
      }
    } : null
  });

  const renderContent = useCallback((content) => {
    if (!content) return null;
    
    // Split content by double newlines for paragraphs
    const paragraphs = content.split(/\n\n+/);
    
    return paragraphs.map((paragraph, index) => {
      // Check for headers (lines starting with #)
      if (paragraph.startsWith('### ')) {
        return <h3 key={index}>{paragraph.replace('### ', '')}</h3>;
      }
      if (paragraph.startsWith('## ')) {
        return <h2 key={index}>{paragraph.replace('## ', '')}</h2>;
      }
      if (paragraph.startsWith('# ')) {
        return <h2 key={index}>{paragraph.replace('# ', '')}</h2>;
      }
      
      // Check for lists
      if (paragraph.includes('\n- ')) {
        const lines = paragraph.split('\n');
        return (
          <ul key={index}>
            {lines.filter(line => line.startsWith('- ')).map((line, lineIndex) => (
              <li key={lineIndex}>{line.replace('- ', '')}</li>
            ))}
          </ul>
        );
      }
      
      // Regular paragraph with simple formatting
      let formattedText = paragraph
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br />');
      
      return (
        <p 
          key={index} 
          dangerouslySetInnerHTML={{ __html: formattedText }}
        />
      );
    });
  }, []);

  if (loading) {
    return (
      <div className="article-page">
        <div className="container">
          <PageSpinner text={t('common.loading')} />
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="article-page">
        <div className="container">
          <div className="article-not-found">
            <h2>{t('blog.articleNotFound')}</h2>
            <p>{t('blog.articleNotFoundDesc')}</p>
            <Link to="/blog" className="btn btn-primary">
              {t('blog.backToBlog')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="article-page">
      <article className="article-container">
        <header className="article-header">
          <div className="container">
            <Link to="/blog" className="back-link">
              {t('blog.backToBlog')}
            </Link>
            
            <span className="category-badge">
              {t(`blog.categories.${article.category}`)}
            </span>
            
            <h1>{getLocalizedContent(article.title)}</h1>
            
            <div className="article-meta">
              <div className="author-info">
                {article.author && (
                  <span className="author-name">
                    {article.author.firstName} {article.author.lastName}
                  </span>
                )}
              </div>
              <span className="meta-separator">•</span>
              <span className="date">{formatDate(article.publishedAt)}</span>
              <span className="meta-separator">•</span>
              <span className="reading-time">
                {t('blog.readingTime', { minutes: article.readingTime })}
              </span>
            </div>
          </div>
        </header>

        {article.featuredImage && (
          <div className="article-featured-image">
            <img 
              src={article.featuredImage} 
              alt={getLocalizedContent(article.title)}
            />
          </div>
        )}

        <div className="article-body">
          <div className="container container-narrow">
            <div className="article-content">
              {renderContent(getLocalizedContent(article.content))}
            </div>

            {article.tags && article.tags.length > 0 && (
              <div className="article-tags">
                <span className="tags-label">{t('blog.tags')}:</span>
                {article.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <footer className="article-footer">
          <div className="container container-narrow">
            <div className="share-section">
              <span className="share-label">{t('blog.share')}:</span>
              <div className="share-buttons">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(getLocalizedContent(article.title) + ' ' + window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="share-btn whatsapp"
                  aria-label="Share on WhatsApp"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(getLocalizedContent(article.title))}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="share-btn twitter"
                  aria-label="Share on Twitter"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="share-btn facebook"
                  aria-label="Share on Facebook"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </div>

            <Link to="/blog" className="back-to-blog-btn">
              {t('blog.viewAllArticles')}
            </Link>
          </div>
        </footer>
      </article>
    </div>
  );
};

export default ArticlePage;
