import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [badgeAnimate, setBadgeAnimate] = useState(false);
  const userMenuRef = useRef(null);
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
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          <img src={logoSrc} alt="Comemos Como Pensamos" className="logo-icon" />
        </Link>

        <button 
          className={`hamburger-btn ${mobileMenuOpen ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        <div className={`navbar-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <Link to="/" className="navbar-link" onClick={closeMobileMenu}>{t('nav.home')}</Link>
          <Link to="/products" className="navbar-link" onClick={closeMobileMenu}>{t('nav.products')}</Link>
          <Link to="/producers" className="navbar-link" onClick={closeMobileMenu}>{t('nav.producers')}</Link>
        </div>

        <div className={`navbar-actions ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="language-selector">
            <span className="language-label">IDIOMA</span>
            <div className="language-options">
              {languages.map((lang, index) => (
                <React.Fragment key={lang.code}>
                  {index > 0 && <span className="language-divider">|</span>}
                  <button
                    className={`language-option ${currentLanguage === lang.code ? 'active' : ''}`}
                    onClick={() => changeLanguage(lang.code)}
                  >
                    {lang.code.toUpperCase()}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>

          <Link to="/cart" className="navbar-cart" onClick={closeMobileMenu}>
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
            <>
              <Link 
                to="/login" 
                className={`navbar-btn ${location.pathname === '/login' ? 'navbar-btn-primary active' : ''}`}
                onClick={closeMobileMenu}
              >
                {t('nav.login')}
              </Link>
              <Link 
                to="/register" 
                className={`navbar-btn ${location.pathname === '/login' ? '' : 'navbar-btn-primary'} ${location.pathname === '/register' ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
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
