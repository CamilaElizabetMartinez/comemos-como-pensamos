import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { getCartCount } = useCart();
  const { currentLanguage, changeLanguage, languages } = useLanguage();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <h2>Comemos Como Pensamos</h2>
        </Link>

        <div className="navbar-menu">
          <Link to="/" className="navbar-link">{t('nav.home')}</Link>
          <Link to="/products" className="navbar-link">{t('nav.products')}</Link>
          <Link to="/producers" className="navbar-link">{t('nav.producers')}</Link>
        </div>

        <div className="navbar-actions">
          <select
            value={currentLanguage}
            onChange={(e) => changeLanguage(e.target.value)}
            className="language-selector"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>

          <Link to="/cart" className="navbar-cart">
            🛒 {getCartCount()}
          </Link>

          {isAuthenticated ? (
            <>
              <span className="navbar-user">Hola, {user?.firstName}</span>
              <button onClick={handleLogout} className="navbar-btn">
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-btn">{t('nav.login')}</Link>
              <Link to="/register" className="navbar-btn navbar-btn-primary">
                {t('nav.register')}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
