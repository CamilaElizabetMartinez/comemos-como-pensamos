import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Footer.css';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer-container">
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
      
      <div className="footer-bottom">
        <p>&copy; 2026 Comemos Como Pensamos. {t('footer.rights')}</p>
      </div>
    </footer>
  );
};

export default Footer;
