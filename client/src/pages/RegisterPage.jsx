import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import './AuthPages.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'customer'
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

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
