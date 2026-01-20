import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import logoSrc from '../../assets/logo.svg';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { getCartCount } = useCart();
  const { currentLanguage, changeLanguage, languages } = useLanguage();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const handleClickOutside = useCallback((event) => {
    if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
      setShowUserMenu(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src={logoSrc} alt="Logo" className="logo-icon" />
          <span className="logo-text">COMEMOS COMO PENSAMOS</span>
        </Link>

        <div className="navbar-menu">
          <Link to="/" className="navbar-link">{t('nav.home')}</Link>
          <Link to="/products" className="navbar-link">{t('nav.products')}</Link>
          <Link to="/producers" className="navbar-link">{t('nav.producers')}</Link>
        </div>

        <div className="navbar-actions">
          <select
            value={currentLanguage}
            onChange={(event) => changeLanguage(event.target.value)}
            className="language-selector"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>

          {isAuthenticated && (
            <Link to="/favorites" className="navbar-favorites" title={t('nav.favorites')}>
              ❤️
            </Link>
          )}

          <Link to="/cart" className="navbar-cart">
            🛒 {getCartCount()}
          </Link>

          {isAuthenticated ? (
            <div className="user-menu-container" ref={userMenuRef}>
              <button 
                className="user-menu-trigger"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <span className="user-avatar">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
                <span className="user-name">{user?.firstName}</span>
                <span className="dropdown-arrow">▼</span>
              </button>
              
              {showUserMenu && (
                <div className="user-dropdown">
                  <Link 
                    to="/profile" 
                    className="dropdown-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    👤 {t('nav.myAccount')}
                  </Link>
                  <Link 
                    to="/orders" 
                    className="dropdown-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    📦 {t('nav.orders')}
                  </Link>
                  <Link 
                    to="/favorites" 
                    className="dropdown-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    ❤️ {t('nav.favorites')}
                  </Link>
                  {user?.role === 'producer' && (
                    <Link 
                      to="/producer" 
                      className="dropdown-item dropdown-producer"
                      onClick={() => setShowUserMenu(false)}
                    >
                      🏪 {t('nav.dashboard')}
                    </Link>
                  )}
                  {user?.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      className="dropdown-item dropdown-admin"
                      onClick={() => setShowUserMenu(false)}
                    >
                      ⚙️ {t('nav.adminPanel')}
                    </Link>
                  )}
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item dropdown-logout">
                    🚪 {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
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
