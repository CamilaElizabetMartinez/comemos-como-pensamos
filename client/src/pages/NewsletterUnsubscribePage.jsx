import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../services/api';
import SEO from '../components/common/SEO';
import './NewsletterUnsubscribePage.css';

const NewsletterUnsubscribePage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [email, setEmail] = useState('');

  const handleUnsubscribe = useCallback(async (emailToUnsubscribe) => {
    try {
      await api.post('/newsletter/unsubscribe', { email: emailToUnsubscribe });
      setStatus('success');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error';
      if (errorMessage.includes('not found') || errorMessage.includes('no encontrado')) {
        setStatus('not_found');
      } else {
        setStatus('error');
        toast.error(t('newsletter.unsubscribeError'));
      }
    }
  }, [t]);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      handleUnsubscribe(emailParam);
    } else {
      setStatus('manual');
    }
  }, [searchParams, handleUnsubscribe]);

  const handleManualUnsubscribe = async (event) => {
    event.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    await handleUnsubscribe(email);
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="unsubscribe-loading">
            <div className="spinner"></div>
            <p>{t('newsletter.processing')}</p>
          </div>
        );

      case 'success':
        return (
          <div className="unsubscribe-success">
            <div className="success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2>{t('newsletter.unsubscribeSuccess')}</h2>
            <p>{t('newsletter.unsubscribeSuccessDesc')}</p>
            <p className="email-display">{email}</p>
            <div className="unsubscribe-actions">
              <Link to="/" className="btn btn-primary">
                {t('common.backToHome')}
              </Link>
            </div>
          </div>
        );

      case 'not_found':
        return (
          <div className="unsubscribe-not-found">
            <div className="warning-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2>{t('newsletter.emailNotFound')}</h2>
            <p>{t('newsletter.emailNotFoundDesc')}</p>
            <div className="unsubscribe-actions">
              <Link to="/" className="btn btn-primary">
                {t('common.backToHome')}
              </Link>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="unsubscribe-error">
            <div className="error-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h2>{t('newsletter.unsubscribeErrorTitle')}</h2>
            <p>{t('newsletter.unsubscribeErrorDesc')}</p>
            <div className="unsubscribe-actions">
              <button 
                onClick={() => handleUnsubscribe(email)} 
                className="btn btn-primary"
              >
                {t('common.tryAgain')}
              </button>
              <Link to="/contact" className="btn btn-secondary">
                {t('common.contactUs')}
              </Link>
            </div>
          </div>
        );

      case 'manual':
      default:
        return (
          <div className="unsubscribe-manual">
            <div className="mail-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <h2>{t('newsletter.unsubscribeTitle')}</h2>
            <p>{t('newsletter.unsubscribeDesc')}</p>
            <form onSubmit={handleManualUnsubscribe} className="unsubscribe-form">
              <div className="form-group">
                <label htmlFor="email">{t('common.email')}</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={t('newsletter.emailPlaceholder')}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                {t('newsletter.unsubscribeButton')}
              </button>
            </form>
          </div>
        );
    }
  };

  return (
    <>
      <SEO
        title={t('newsletter.unsubscribeTitle')}
        description={t('newsletter.unsubscribeDesc')}
        url="/newsletter/unsubscribe"
        noindex={true}
      />
      <div className="newsletter-unsubscribe-page">
        <div className="container">
          <div className="unsubscribe-card">
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
};

export default NewsletterUnsubscribePage;
