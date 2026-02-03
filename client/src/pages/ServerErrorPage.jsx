import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IconHome, IconRefresh } from '../components/common/Icons';
import './ErrorPages.css';

const ServerErrorPage = () => {
  const { t } = useTranslation();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="error-page">
      <div className="error-container">
        <div className="error-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        
        <h1 className="error-code">500</h1>
        <h2 className="error-title">
          {t('errors.serverError.title', 'Error del servidor')}
        </h2>
        <p className="error-message">
          {t('errors.serverError.message', 'Lo sentimos, algo salió mal en nuestro servidor. Por favor, inténtalo de nuevo más tarde.')}
        </p>
        
        <div className="error-actions">
          <button type="button" onClick={handleRefresh} className="btn btn-secondary">
            <IconRefresh size={18} />
            {t('errors.tryAgain', 'Intentar de nuevo')}
          </button>
          <Link to="/" className="btn btn-primary">
            <IconHome size={18} />
            {t('errors.backToHome', 'Volver al inicio')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServerErrorPage;
