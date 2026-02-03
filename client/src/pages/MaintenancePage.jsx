import React from 'react';
import { useTranslation } from 'react-i18next';
import './ErrorPages.css';

const MaintenancePage = () => {
  const { t } = useTranslation();

  return (
    <div className="error-page maintenance-page">
      <div className="error-container">
        <div className="error-icon maintenance-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>
        
        <h1 className="error-code">503</h1>
        <h2 className="error-title">
          {t('errors.maintenance.title', 'Sitio en mantenimiento')}
        </h2>
        <p className="error-message">
          {t('errors.maintenance.message', 'Estamos realizando mejoras para ofrecerte una mejor experiencia. Volveremos pronto.')}
        </p>
        
        <div className="maintenance-info">
          <p className="maintenance-hint">
            {t('errors.maintenance.hint', 'Mientras tanto, puedes contactarnos en:')}
          </p>
          <a href="mailto:info@comemoscomopensamos.es" className="maintenance-email">
            info@comemoscomopensamos.es
          </a>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
