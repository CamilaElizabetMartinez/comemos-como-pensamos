import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../services/api';
import { IconCheckCircle } from '../components/common/Icons';
import './AuthPages.css';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const { token } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error(t('auth.passwordsDoNotMatch'));
      return;
    }

    if (password.length < 6) {
      toast.error(t('auth.passwordTooShort'));
      return;
    }

    setLoading(true);

    try {
      await api.post(`/email/reset-password/${token}`, { password });
      setResetSuccess(true);
      toast.success(t('auth.passwordResetSuccess'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('auth.passwordResetError'));
    } finally {
      setLoading(false);
    }
  };

  if (resetSuccess) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="email-sent-message">
            <h2><IconCheckCircle size={24} /> {t('auth.passwordChanged')}</h2>
            <p>{t('auth.passwordChangedDescription')}</p>
            <Link to="/login" className="btn btn-primary">
              {t('auth.loginButton')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>{t('auth.resetPasswordTitle')}</h2>
        <p className="auth-description">{t('auth.resetPasswordDescription')}</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>{t('auth.newPassword')}</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t('auth.newPasswordPlaceholder')}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>
          <div className="form-group">
            <label>{t('auth.confirmPassword')}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder={t('auth.confirmPasswordPlaceholder')}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? t('common.loading') : t('auth.resetPasswordButton')}
          </button>
        </form>
        <p className="auth-link">
          <Link to="/login">{t('auth.backToLogin')}</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

