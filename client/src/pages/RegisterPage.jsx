import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../services/api';
import { IconEye, IconEyeOff, IconGift } from '../components/common/Icons';
import './AuthPages.css';

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const referralCode = useMemo(() => searchParams.get('ref'), [searchParams]);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: referralCode ? 'producer' : 'customer'
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [referrerInfo, setReferrerInfo] = useState(null);
  const { register } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (referralCode) {
      localStorage.setItem('referralCode', referralCode);
      
      api.get(`/referrals/validate/${referralCode}`)
        .then(response => {
          if (response.data.success) {
            setReferrerInfo(response.data.data.referrer);
          }
        })
        .catch(() => {
          setReferrerInfo(null);
        });
    }
  }, [referralCode]);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await register(formData);
      toast.success(t('auth.registerSuccess'));
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || t('auth.registerError'));
    } finally {
      setLoading(false);
    }
  }, [formData, register, navigate, t]);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <header className="auth-header">
          <h1>{t('auth.registerTitle')}</h1>
        </header>
        
        {referrerInfo && (
          <div className="referral-banner">
            <span className="referral-banner-icon"><IconGift size={24} /></span>
            <div className="referral-banner-text">
              <strong>{t('auth.referredBy', { name: referrerInfo.businessName })}</strong>
              <span>{t('auth.referralBonusInfo')}</span>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="register-firstName">{t('auth.firstName')}</label>
              <input
                id="register-firstName"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder={t('auth.firstNamePlaceholder')}
                autoComplete="given-name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="register-lastName">{t('auth.lastName')}</label>
              <input
                id="register-lastName"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder={t('auth.lastNamePlaceholder')}
                autoComplete="family-name"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="register-email">{t('auth.email')}</label>
            <input
              id="register-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('auth.emailPlaceholder')}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-password">{t('auth.password')}</label>
            <div className="password-input-wrapper">
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('auth.newPasswordPlaceholder')}
                autoComplete="new-password"
                required
                minLength="6"
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
            {formData.password && (
              <div className="password-strength">
                <div className={`strength-bar ${formData.password.length >= 8 ? 'strong' : formData.password.length >= 6 ? 'medium' : 'weak'}`} />
                <span className="strength-text">
                  {formData.password.length >= 8 ? t('auth.passwordStrong') : formData.password.length >= 6 ? t('auth.passwordMedium') : t('auth.passwordWeak')}
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="register-role">{t('auth.accountType')}</label>
            <select 
              id="register-role"
              name="role" 
              value={formData.role} 
              onChange={handleChange}
            >
              <option value="customer">{t('auth.roleCustomer')}</option>
              <option value="producer">{t('auth.roleProducer')}</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? t('common.loading') : t('auth.registerButton')}
          </button>
        </form>

        <footer className="auth-footer">
          <nav className="auth-links">
            <Link to="/login" className="link-primary">
              {t('auth.loginButton')}
            </Link>
          </nav>
        </footer>
      </div>
    </div>
  );
};

export default RegisterPage;
