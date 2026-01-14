import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../services/api';
import './AuthPages.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await api.post('/email/forgot-password', { email });
      setEmailSent(true);
      toast.success(t('auth.resetEmailSent'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('auth.resetEmailError'));
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="email-sent-message">
            <h2>✉️ {t('auth.checkYourEmail')}</h2>
            <p>{t('auth.resetEmailInstructions')}</p>
            <Link to="/login" className="btn btn-primary">
              {t('auth.backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>{t('auth.forgotPasswordTitle')}</h2>
        <p className="auth-description">{t('auth.forgotPasswordDescription')}</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t('auth.emailPlaceholder')}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? t('common.loading') : t('auth.sendResetLink')}
          </button>
        </form>
        <p className="auth-link">
          <Link to="/login">{t('auth.backToLogin')}</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

