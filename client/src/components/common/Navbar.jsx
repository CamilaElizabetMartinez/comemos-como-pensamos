import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import logoSrc from '../../assets/logo-blanco.svg';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { getCartCount } = useCart();
  const { currentLanguage, changeLanguage, languages } = useLanguage();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [badgeAnimate, setBadgeAnimate] = useState(false);
  const userMenuRef = useRef(null);
  const langMenuRef = useRef(null);
  const prevCartCount = useRef(getCartCount());

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const handleClickOutside = useCallback((event) => {
    if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
      setShowUserMenu(false);
    }
    if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
      setShowLangMenu(false);
    }
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const currentCount = getCartCount();
    if (currentCount > prevCartCount.current) {
      setBadgeAnimate(true);
      const timer = setTimeout(() => setBadgeAnimate(false), 400);
      return () => clearTimeout(timer);
    }
    prevCartCount.current = currentCount;
  }, [getCartCount]);

  return (
    <nav className="navbar" role="navigation" aria-label="Navegación principal">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          <img src={logoSrc} alt="Comemos Como Pensamos" className="logo-icon" />
        </Link>

        {/* Mobile overlay */}
        {mobileMenuOpen && (
          <div 
            className="mobile-overlay" 
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
        )}

        <div id="mobile-menu" className={`navbar-menu ${mobileMenuOpen ? 'open' : ''}`} role="menubar">
          <Link to="/" className="navbar-link" onClick={closeMobileMenu}>{t('nav.home')}</Link>
          <Link to="/products" className="navbar-link" onClick={closeMobileMenu}>{t('nav.products')}</Link>
          <Link to="/producers" className="navbar-link" onClick={closeMobileMenu}>{t('nav.producers')}</Link>
          <Link to="/blog" className="navbar-link" onClick={closeMobileMenu}>{t('nav.blog')}</Link>
        </div>

        {/* Mobile quick actions - always visible */}
        <div className="navbar-mobile-actions">
          <Link to="/cart" className="mobile-cart-btn" aria-label={`Carrito, ${getCartCount()} productos`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {getCartCount() > 0 && (
              <span className={`mobile-cart-badge ${badgeAnimate ? 'animate' : ''}`}>{getCartCount()}</span>
            )}
          </Link>

          {isAuthenticated ? (
            <Link to="/profile" className="mobile-user-btn" aria-label="Mi cuenta">
              <span className="mobile-user-avatar">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </span>
            </Link>
          ) : (
            <Link to="/login" className="mobile-user-btn" aria-label="Iniciar sesión">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
          )}

          <button 
            className={`hamburger-btn ${mobileMenuOpen ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>

        <div className={`navbar-actions ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="language-selector" ref={langMenuRef}>
            <button 
              className="language-trigger"
              onClick={() => setShowLangMenu(!showLangMenu)}
              aria-label={t('nav.changeLanguage')}
              aria-expanded={showLangMenu}
              aria-haspopup="true"
            >
              <svg className="globe-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span className="current-lang">{currentLanguage.toUpperCase()}</span>
              <svg className={`dropdown-icon ${showLangMenu ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {showLangMenu && (
              <div className="language-dropdown">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    className={`language-option ${currentLanguage === lang.code ? 'active' : ''}`}
                    onClick={() => {
                      changeLanguage(lang.code);
                      setShowLangMenu(false);
                    }}
                  >
                    <span className="lang-code">{lang.code.toUpperCase()}</span>
                    <span className="lang-name">{lang.name}</span>
                    {currentLanguage === lang.code && (
                      <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link to="/cart" className="navbar-cart" onClick={closeMobileMenu} aria-label={`Carrito de compras, ${getCartCount()} productos`}>
            <svg className="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span className={`cart-badge ${badgeAnimate ? 'animate' : ''}`}>{getCartCount()}</span>
          </Link>

          {isAuthenticated ? (
            <div className="user-menu-container" ref={userMenuRef}>
              <button 
                className="user-menu-trigger"
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-expanded={showUserMenu}
                aria-haspopup="true"
                aria-label={`Menú de usuario, ${user?.firstName}`}
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
                    onClick={() => { setShowUserMenu(false); closeMobileMenu(); }}
                  >
                    {t('nav.myAccount')}
                  </Link>
                  <Link 
                    to="/orders" 
                    className="dropdown-item"
                    onClick={() => { setShowUserMenu(false); closeMobileMenu(); }}
                  >
                    {t('nav.orders')}
                  </Link>
                  <Link 
                    to="/favorites" 
                    className="dropdown-item"
                    onClick={() => { setShowUserMenu(false); closeMobileMenu(); }}
                  >
                    {t('nav.favorites')}
                  </Link>
                  {user?.role === 'producer' && (
                    <Link 
                      to="/producer" 
                      className="dropdown-item dropdown-producer"
                      onClick={() => { setShowUserMenu(false); closeMobileMenu(); }}
                    >
                      {t('nav.dashboard')}
                    </Link>
                  )}
                  {user?.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      className="dropdown-item dropdown-admin"
                      onClick={() => { setShowUserMenu(false); closeMobileMenu(); }}
                    >
                      {t('nav.adminPanel')}
                    </Link>
                  )}
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item dropdown-logout">
                    {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <nav className="auth-nav">
              <Link 
                to="/login" 
                className="auth-nav-link"
                onClick={closeMobileMenu}
              >
                {t('nav.login')}
              </Link>
              <span className="auth-nav-divider">|</span>
              <Link 
                to="/register" 
                className="auth-nav-link"
                onClick={closeMobileMenu}
              >
                {t('nav.register')}
              </Link>
            </nav>
          )}

        </div>
      </div>
    </nav>
  );
};

export default memo(Navbar);
