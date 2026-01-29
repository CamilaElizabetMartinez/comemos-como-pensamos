import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './Footer.css';

const ICONS = {
  send: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  loader: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spinner-icon">
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
};

const Footer = () => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = useCallback(async (event) => {
    event.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error(t('footer.newsletter.invalidEmail'));
      return;
    }

    setLoading(true);
    try {
      await api.post('/newsletter/subscribe', {
        email,
        source: 'footer',
        language: i18n.language
      });
      setSubscribed(true);
      toast.success(t('footer.newsletter.success'));
      setEmail('');
    } catch (error) {
      const message = error.response?.data?.message || t('footer.newsletter.error');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [email, i18n.language, t]);

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-section footer-brand">
            <h3>Comemos Como Pensamos</h3>
            <p>{t('footer.tagline')}</p>
          </div>

          <div className="footer-section">
            <h4>{t('footer.explore')}</h4>
            <ul>
              <li><Link to="/products">{t('nav.products')}</Link></li>
              <li><Link to="/producers">{t('nav.producers')}</Link></li>
              <li><Link to="/blog">{t('footer.blog')}</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>{t('footer.forProducers')}</h4>
            <ul>
              <li><Link to="/unete">{t('footer.joinUs')}</Link></li>
              <li><Link to="/calculadora-productor">{t('footer.calculator')}</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>{t('footer.help')}</h4>
            <ul>
              <li><Link to="/contact">{t('contact.title')}</Link></li>
              <li><Link to="/terms">{t('footer.terms')}</Link></li>
              <li><Link to="/privacy">{t('footer.privacy')}</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>{t('footer.contact')}</h4>
            <p>info@comemoscomopensamos.es</p>
            <p>+34 900 123 456</p>
          </div>
        </div>

        <div className="footer-newsletter">
          <div className="newsletter-content">
            <h4>{t('footer.newsletter.title')}</h4>
            <p>{t('footer.newsletter.description')}</p>
          </div>
          
          {subscribed ? (
            <div className="newsletter-success">
              {ICONS.check}
              <span>{t('footer.newsletter.subscribed')}</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="newsletter-form">
              <div className="newsletter-input-wrapper">
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={t('footer.newsletter.placeholder')}
                  disabled={loading}
                  required
                />
                <button type="submit" disabled={loading} aria-label={t('footer.newsletter.subscribe')}>
                  {loading ? ICONS.loader : ICONS.send}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2026 Comemos Como Pensamos. {t('footer.rights')}</p>
      </div>
    </footer>
  );
};

export default Footer;
