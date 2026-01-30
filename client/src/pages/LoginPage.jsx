import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { IconEye, IconEyeOff } from '../components/common/Icons';
import useFormValidation from '../hooks/useFormValidation';
import './AuthPages.css';

const VALIDATION_RULES = {
  email: ['required', 'email'],
  password: ['required', { type: 'minLength', value: 6 }],
};

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { values, getFieldProps, getFieldState, validateAll } = useFormValidation(
    { email: '', password: '' },
    VALIDATION_RULES
  );

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    
    if (!validateAll()) return;
    
    setLoading(true);

    try {
      await login({ email: values.email, password: values.password });
      toast.success(t('auth.welcomeMessage'));
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  }, [values, validateAll, login, navigate, t]);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <header className="auth-header">
          <h1>{t('auth.loginTitle')}</h1>
        </header>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className={`form-group ${getFieldState('email').hasError ? 'has-error' : ''}`}>
            <label htmlFor="login-email">{t('auth.email')}</label>
            <input
              id="login-email"
              type="email"
              {...getFieldProps('email')}
              placeholder={t('auth.emailPlaceholder')}
              autoComplete="email"
            />
            {getFieldState('email').hasError && (
              <span id="email-error" className="field-error" role="alert">
                {getFieldState('email').error}
              </span>
            )}
          </div>

          <div className={`form-group ${getFieldState('password').hasError ? 'has-error' : ''}`}>
            <label htmlFor="login-password">{t('auth.password')}</label>
            <div className="password-input-wrapper">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                {...getFieldProps('password')}
                placeholder={t('auth.passwordPlaceholder')}
                autoComplete="current-password"
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
            {getFieldState('password').hasError && (
              <span id="password-error" className="field-error" role="alert">
                {getFieldState('password').error}
              </span>
            )}
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
