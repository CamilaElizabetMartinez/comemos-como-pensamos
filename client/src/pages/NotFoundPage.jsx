import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './NotFoundPage.css';

const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-illustration">
          <span className="error-code">404</span>
          <div className="vegetables">
            <span className="veg veg-1">🥕</span>
            <span className="veg veg-2">🥬</span>
            <span className="veg veg-3">🍅</span>
            <span className="veg veg-4">🥦</span>
            <span className="veg veg-5">🌽</span>
          </div>
        </div>
        
        <h1>{t('notFound.title')}</h1>
        <p>{t('notFound.message')}</p>
        
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">
            🏠 {t('notFound.goHome')}
          </Link>
          <Link to="/products" className="btn btn-secondary">
            🛒 {t('notFound.goProducts')}
          </Link>
        </div>
        
        <div className="not-found-suggestions">
          <p>{t('notFound.suggestions')}</p>
          <ul>
            <li>
              <Link to="/products">{t('nav.products')}</Link>
            </li>
            <li>
              <Link to="/producers">{t('nav.producers')}</Link>
            </li>
            <li>
              <Link to="/contact">{t('contact.title')}</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;











