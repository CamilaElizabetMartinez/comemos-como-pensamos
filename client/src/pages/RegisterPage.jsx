import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../services/api';
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(formData);
      toast.success('¡Cuenta creada exitosamente!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al crear cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>{t('auth.registerTitle')}</h2>
        
        {referrerInfo && (
          <div className="referral-banner">
            <span className="referral-banner-icon">🎁</span>
            <div className="referral-banner-text">
              <strong>{t('auth.referredBy', { name: referrerInfo.businessName })}</strong>
              <span>{t('auth.referralBonusInfo')}</span>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>{t('auth.firstName')}</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>{t('auth.lastName')}</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>{t('auth.email')}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>{t('auth.password')}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>
          <div className="form-group">
            <label>Tipo de cuenta</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="customer">Cliente</option>
              <option value="producer">Productor</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? t('common.loading') : t('auth.registerButton')}
          </button>
        </form>
        <p className="auth-link">
          {t('auth.hasAccount')} <Link to="/login">{t('auth.loginButton')}</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
