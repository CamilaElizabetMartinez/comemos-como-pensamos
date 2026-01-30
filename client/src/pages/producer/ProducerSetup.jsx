import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import ImageUploader from '../../components/common/ImageUploader';
import { IconSmartphone, IconInfo } from '../../components/common/Icons';
import './ProducerSetup.css';

const CERTIFICATIONS_OPTIONS = [
  'organic',
  'local',
  'sustainable',
  'fair-trade',
  'vegan',
  'gluten-free'
];

const ProducerSetup = () => {
  const savedReferralCode = localStorage.getItem('referralCode') || '';
  
  const [formData, setFormData] = useState({
    businessName: '',
    description: {
      es: '',
      en: '',
      fr: '',
      de: ''
    },
    logo: '',
    location: {
      address: '',
      city: '',
      region: ''
    },
    certifications: [],
    whatsapp: '',
    referralCode: savedReferralCode
  });
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [referralValidated, setReferralValidated] = useState(null);
  const [validatingReferral, setValidatingReferral] = useState(false);
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    if (user && user.role !== 'producer') {
      navigate('/');
      return;
    }
    checkExistingProfile();
  }, [user, navigate]);

  useEffect(() => {
    if (savedReferralCode && !referralValidated) {
      validateReferralCode();
    }
  }, [savedReferralCode]);

  const checkExistingProfile = async () => {
    try {
      const response = await api.get('/producers/me');
      if (response.data.success && response.data.data.producer) {
        navigate('/producer');
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Error checking profile:', error);
      }
    } finally {
      setCheckingProfile(false);
    }
  };

  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prevData => ({
        ...prevData,
        location: {
          ...prevData.location,
          [locationField]: value
        }
      }));
    } else if (name.startsWith('description.')) {
      const langField = name.split('.')[1];
      setFormData(prevData => ({
        ...prevData,
        description: {
          ...prevData.description,
          [langField]: value
        }
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: value
      }));
    }
  }, []);

  const handleCertificationToggle = useCallback((certification) => {
    setFormData(prevData => {
      const currentCertifications = prevData.certifications;
      const isSelected = currentCertifications.includes(certification);
      
      return {
        ...prevData,
        certifications: isSelected
          ? currentCertifications.filter(cert => cert !== certification)
          : [...currentCertifications, certification]
      };
    });
  }, []);

  const handleLogoUpload = useCallback((images) => {
    if (images.length > 0) {
      const logoUrl = typeof images[0] === 'object' ? images[0].url : images[0];
      setFormData(prevData => ({
        ...prevData,
        logo: logoUrl
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        logo: ''
      }));
    }
  }, []);

  const handleReferralCodeChange = useCallback((event) => {
    const code = event.target.value.toUpperCase();
    setFormData(prevData => ({ ...prevData, referralCode: code }));
    setReferralValidated(null);
  }, []);

  const validateReferralCode = useCallback(async () => {
    if (!formData.referralCode.trim()) return;
    
    setValidatingReferral(true);
    try {
      const response = await api.get(`/referrals/validate/${formData.referralCode}`);
      if (response.data.success) {
        setReferralValidated(response.data.data.referrer);
        toast.success(t('producer.setup.referralValid', { name: response.data.data.referrer.businessName }));
      }
    } catch (error) {
      setReferralValidated(false);
      toast.error(t('producer.setup.referralInvalid'));
    } finally {
      setValidatingReferral(false);
    }
  }, [formData.referralCode, t]);

  const validateForm = useCallback(() => {
    if (!formData.businessName.trim()) {
      toast.error(t('producer.setup.businessNameRequired'));
      return false;
    }
    if (!formData.description.es.trim()) {
      toast.error(t('producer.setup.descriptionRequired'));
      return false;
    }
    if (!formData.location.city.trim()) {
      toast.error(t('producer.setup.cityRequired'));
      return false;
    }
    return true;
  }, [formData, t]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await api.post('/producers', formData);
      
      if (response.data.success) {
        localStorage.removeItem('referralCode');
        toast.success(t('producer.setup.success'));
        navigate('/producer');
      }
    } catch (error) {
      console.error('Error creating producer profile:', error);
      const errorMessage = error.response?.data?.message || t('producer.setup.error');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (checkingProfile) {
    return (
      <div className="producer-setup">
        <div className="container">
          <div className="loading">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="producer-setup">
      <div className="container">
        <div className="setup-card">
          <header className="setup-header">
            <div className="setup-icon">🌾</div>
            <h1>{t('producer.setup.title')}</h1>
            <p className="setup-subtitle">{t('producer.setup.subtitle')}</p>
          </header>

          <form onSubmit={handleSubmit} className="setup-form">
            <section className="form-section">
              <h2>{t('producer.setup.businessInfo')}</h2>
              
              <div className="form-group">
                <label htmlFor="businessName">{t('producer.setup.businessName')} *</label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  placeholder={t('producer.setup.businessNamePlaceholder')}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description.es">{t('producer.setup.description')} *</label>
                <textarea
                  id="description.es"
                  name="description.es"
                  value={formData.description.es}
                  onChange={handleInputChange}
                  placeholder={t('producer.setup.descriptionPlaceholder')}
                  rows={4}
                  required
                />
              </div>

              <div className="form-group">
                <label>{t('producer.setup.logo')}</label>
                <ImageUploader
                  images={formData.logo ? [formData.logo] : []}
                  onImagesChange={handleLogoUpload}
                  maxImages={1}
                />
              </div>
            </section>

            <section className="form-section">
              <h2>{t('producer.setup.location')}</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="location.address">{t('producer.setup.address')}</label>
                  <input
                    type="text"
                    id="location.address"
                    name="location.address"
                    value={formData.location.address}
                    onChange={handleInputChange}
                    placeholder={t('producer.setup.addressPlaceholder')}
                  />
                </div>
              </div>

              <div className="form-row two-columns">
                <div className="form-group">
                  <label htmlFor="location.city">{t('producer.setup.city')} *</label>
                  <input
                    type="text"
                    id="location.city"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleInputChange}
                    placeholder={t('producer.setup.cityPlaceholder')}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="location.region">{t('producer.setup.region')}</label>
                  <input
                    type="text"
                    id="location.region"
                    name="location.region"
                    value={formData.location.region}
                    onChange={handleInputChange}
                    placeholder={t('producer.setup.regionPlaceholder')}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half-width">
                  <label htmlFor="location.postalCode">{t('producer.setup.postalCode')}</label>
                  <input
                    type="text"
                    id="location.postalCode"
                    name="location.postalCode"
                    value={formData.location.postalCode}
                    onChange={handleInputChange}
                    placeholder={t('producer.setup.postalCodePlaceholder')}
                  />
                </div>
              </div>
            </section>

            <section className="form-section">
              <h2>{t('producer.setup.contactInfo')}</h2>
              <p className="section-hint">{t('producer.setup.contactInfoHint')}</p>
              
              <div className="form-group">
                <label htmlFor="whatsapp">
                  <span className="whatsapp-label-icon"><IconSmartphone size={16} /></span>
                  {t('producer.setup.whatsapp')}
                </label>
                <input
                  type="tel"
                  id="whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  placeholder={t('producer.setup.whatsappPlaceholder')}
                />
                <p className="field-hint">{t('producer.setup.whatsappHint')}</p>
              </div>
            </section>

            <section className="form-section">
              <h2>{t('producer.setup.certifications')}</h2>
              <p className="section-hint">{t('producer.setup.certificationsHint')}</p>
              
              <div className="certifications-grid">
                {CERTIFICATIONS_OPTIONS.map((certification) => (
                  <button
                    key={certification}
                    type="button"
                    className={`certification-chip ${formData.certifications.includes(certification) ? 'selected' : ''}`}
                    onClick={() => handleCertificationToggle(certification)}
                  >
                    {t(`producer.setup.cert_${certification}`)}
                  </button>
                ))}
              </div>
            </section>

            <section className="form-section referral-section">
              <h2>{t('producer.setup.referralTitle')}</h2>
              <p className="section-hint">{t('producer.setup.referralHint')}</p>
              
              <div className="form-group">
                <label htmlFor="referralCode">{t('producer.setup.referralCode')}</label>
                <div className="referral-input-wrapper">
                  <input
                    type="text"
                    id="referralCode"
                    name="referralCode"
                    value={formData.referralCode}
                    onChange={handleReferralCodeChange}
                    placeholder={t('producer.setup.referralPlaceholder')}
                    className={referralValidated === false ? 'invalid' : referralValidated ? 'valid' : ''}
                  />
                  <button
                    type="button"
                    className="btn-validate-referral"
                    onClick={validateReferralCode}
                    disabled={!formData.referralCode.trim() || validatingReferral}
                  >
                    {validatingReferral ? '...' : t('producer.setup.validateCode')}
                  </button>
                </div>
                {referralValidated && (
                  <div className="referral-success">
                    <span className="referral-icon">✓</span>
                    {t('producer.setup.referredBy', { name: referralValidated.businessName })}
                    <span className="referral-bonus">{t('producer.setup.referralBonus')}</span>
                  </div>
                )}
              </div>
            </section>

            <div className="form-actions">
              <p className="approval-notice">
                <span className="notice-icon"><IconInfo size={18} /></span>
                {t('producer.setup.approvalNotice')}
              </p>
              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? t('common.loading') : t('producer.setup.submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProducerSetup;

