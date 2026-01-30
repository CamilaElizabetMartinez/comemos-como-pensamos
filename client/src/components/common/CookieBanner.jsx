import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { IconCookie } from './Icons';
import './CookieBanner.css';

const COOKIE_CONSENT_KEY = 'cookie_consent';

const CookieBanner = () => {
  const { t } = useTranslation();
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always required
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay to avoid flash on page load
      const timer = setTimeout(() => setShowBanner(true), 500);
      return () => clearTimeout(timer);
    } else {
      try {
        const savedPrefs = JSON.parse(consent);
        setPreferences(savedPrefs);
      } catch (e) {
        setShowBanner(true);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(allAccepted));
    setPreferences(allAccepted);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(onlyNecessary));
    setPreferences(onlyNecessary);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    const savedPrefs = {
      ...preferences,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(savedPrefs));
    setShowBanner(false);
    setShowPreferences(false);
  };

  const togglePreference = (key) => {
    if (key === 'necessary') return; // Cannot disable necessary cookies
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!showBanner) return null;

  return (
    <div className="cookie-banner-overlay">
      <div className={`cookie-banner ${showPreferences ? 'expanded' : ''}`}>
        <div className="cookie-banner-content">
          <div className="cookie-icon"><IconCookie size={32} /></div>
          <div className="cookie-text">
            <h3>{t('cookies.title')}</h3>
            <p>
              {t('cookies.message')}{' '}
              <Link to="/privacy">{t('cookies.learnMore')}</Link>
            </p>
          </div>
        </div>

        {showPreferences && (
          <div className="cookie-preferences">
            <div className="preference-item">
              <div className="preference-info">
                <span className="preference-name">{t('cookies.necessary')}</span>
                <span className="preference-desc">{t('cookies.necessaryDesc')}</span>
              </div>
              <label className="toggle disabled">
                <input type="checkbox" checked={true} disabled />
                <span className="slider"></span>
              </label>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <span className="preference-name">{t('cookies.analytics')}</span>
                <span className="preference-desc">{t('cookies.analyticsDesc')}</span>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={() => togglePreference('analytics')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <span className="preference-name">{t('cookies.marketing')}</span>
                <span className="preference-desc">{t('cookies.marketingDesc')}</span>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={() => togglePreference('marketing')}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        )}

        <div className="cookie-actions">
          {!showPreferences ? (
            <>
              <button className="btn-cookie secondary" onClick={() => setShowPreferences(true)}>
                {t('cookies.customize')}
              </button>
              <button className="btn-cookie secondary" onClick={handleRejectAll}>
                {t('cookies.rejectAll')}
              </button>
              <button className="btn-cookie primary" onClick={handleAcceptAll}>
                {t('cookies.acceptAll')}
              </button>
            </>
          ) : (
            <>
              <button className="btn-cookie secondary" onClick={() => setShowPreferences(false)}>
                {t('common.back')}
              </button>
              <button className="btn-cookie primary" onClick={handleSavePreferences}>
                {t('cookies.savePreferences')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;











