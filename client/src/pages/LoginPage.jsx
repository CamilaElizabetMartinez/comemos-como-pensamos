import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { IconEye, IconEyeOff } from '../components/common/Icons';
import './AuthPages.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleEmailChange = useCallback((event) => {
    setEmail(event.target.value);
  }, []);

  const handlePasswordChange = useCallback((event) => {
    setPassword(event.target.value);
  }, []);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await login({ email, password });
      toast.success(t('auth.welcomeMessage'));
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  }, [email, password, login, navigate, t]);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <header className="auth-header">
          <h1>{t('auth.loginTitle')}</h1>
        </header>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="login-email">{t('auth.email')}</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder={t('auth.emailPlaceholder')}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">{t('auth.password')}</label>
            <div className="password-input-wrapper">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                placeholder={t('auth.passwordPlaceholder')}
                autoComplete="current-password"
                required
                aria-describedby="password-toggle-hint"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
              >
                {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? t('common.loading') : t('auth.loginButton')}
          </button>
        </form>

        <footer className="auth-footer">
          <nav className="auth-links">
            <Link to="/forgot-password" className="link-secondary">
              {t('auth.forgotPassword')}
            </Link>
            <span className="auth-links-divider">|</span>
            <Link to="/register" className="link-primary">
              {t('auth.registerButton')}
            </Link>
          </nav>
        </footer>
      </div>
    </div>
  );
};

export default LoginPage;
