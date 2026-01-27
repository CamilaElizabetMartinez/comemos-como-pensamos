import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import './AuthPages.css';

const VerifyEmailPage = () => {
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const { token } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const verifyEmail = useCallback(async () => {
    try {
      const response = await api.get(`/email/verify/${token}`);
      if (response.data.success) {
        setStatus('success');
        setMessage(t('auth.emailVerified'));
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setStatus('error');
        setMessage(response.data.message || t('auth.verificationFailed'));
      }
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || t('auth.verificationFailed'));
    }
  }, [token, t, navigate]);

  useEffect(() => {
    if (token) {
      verifyEmail();
    }
  }, [token, verifyEmail]);

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="verify-status verifying">
            <div className="verify-icon">⏳</div>
            <h2>{t('auth.verifyingEmail')}</h2>
            <p>{t('auth.pleaseWait')}</p>
            <div className="verify-spinner"></div>
          </div>
        );
      case 'success':
        return (
          <div className="verify-status success">
            <div className="verify-icon">✅</div>
            <h2>{t('auth.verificationSuccess')}</h2>
            <p>{message}</p>
            <p className="redirect-message">{t('auth.redirectingToLogin')}</p>
            <Link to="/login" className="btn btn-primary">
              {t('auth.goToLogin')}
            </Link>
          </div>
        );
      case 'error':
        return (
          <div className="verify-status error">
            <div className="verify-icon">❌</div>
            <h2>{t('auth.verificationError')}</h2>
            <p>{message}</p>
            <div className="verify-actions">
              <Link to="/resend-verification" className="btn btn-secondary">
                {t('auth.resendVerification')}
              </Link>
              <Link to="/login" className="btn btn-primary">
                {t('auth.goToLogin')}
              </Link>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container verify-container">
        <div className="auth-logo">🥬</div>
        <h1>{t('auth.emailVerification')}</h1>
        {renderContent()}
      </div>
    </div>
  );
};

export default VerifyEmailPage;

