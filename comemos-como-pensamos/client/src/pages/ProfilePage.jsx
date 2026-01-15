import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import NotificationSettings from '../components/common/NotificationSettings';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    street: '',
    city: '',
    postalCode: '',
    country: '',
    preferredLanguage: 'es'
  });

  const initializeForm = useCallback(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        street: user.address?.street || '',
        city: user.address?.city || '',
        postalCode: user.address?.postalCode || '',
        country: user.address?.country || '',
        preferredLanguage: user.preferredLanguage || 'es'
      });
    }
  }, [user]);

  useEffect(() => {
    initializeForm();
  }, [initializeForm]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country
        },
        preferredLanguage: formData.preferredLanguage
      };

      const response = await api.put('/auth/update-profile', updateData);
      
      if (response.data.success) {
        updateUser(response.data.data.user);
        toast.success(t('profile.updateSuccess'));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('profile.updateError'));
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'personal', label: t('profile.personalInfo') },
    { id: 'address', label: t('profile.addressInfo') },
    { id: 'preferences', label: t('profile.preferences') },
    { id: 'notifications', label: t('profile.notifications') }
  ];

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>{t('profile.title')}</h1>
        
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
          <div className="profile-user-info">
            <h2>{user?.firstName} {user?.lastName}</h2>
            <p>{user?.email}</p>
            <span className={`role-badge role-${user?.role}`}>
              {t(`profile.role.${user?.role}`)}
            </span>
          </div>
        </div>

        <div className="profile-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          {activeTab === 'personal' && (
            <div className="form-section">
              <div className="form-row">
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
              </div>
              <div className="form-group">
                <label>{t('profile.phone')}</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+34 600 000 000"
                />
              </div>
            </div>
          )}

          {activeTab === 'address' && (
            <div className="form-section">
              <div className="form-group">
                <label>{t('profile.street')}</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder={t('profile.streetPlaceholder')}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('profile.city')}</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>{t('profile.postalCode')}</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>{t('profile.country')}</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="form-section">
              <div className="form-group">
                <label>{t('profile.language')}</label>
                <select
                  name="preferredLanguage"
                  value={formData.preferredLanguage}
                  onChange={handleChange}
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="form-section">
              <NotificationSettings />
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={initializeForm}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;

