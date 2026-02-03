import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IconHome, IconCart, IconLeaf } from '../components/common/Icons';
import './NotFoundPage.css';

const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-illustration">
          <span className="error-code">404</span>
          <div className="floating-icons">
            <span className="float-icon float-1"><IconLeaf size={32} /></span>
            <span className="float-icon float-2"><IconLeaf size={28} /></span>
            <span className="float-icon float-3"><IconLeaf size={36} /></span>
          </div>
        </div>
        
        <h1>{t('notFound.title')}</h1>
        <p>{t('notFound.message')}</p>
        
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary" aria-label={t('notFound.goHome')}>
            <IconHome size={18} /> {t('notFound.goHome')}
          </Link>
          <Link to="/products" className="btn btn-secondary" aria-label={t('notFound.goProducts')}>
            <IconCart size={18} /> {t('notFound.goProducts')}
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











