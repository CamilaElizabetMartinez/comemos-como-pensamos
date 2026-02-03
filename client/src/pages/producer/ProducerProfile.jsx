import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import ImageUploader from '../../components/common/ImageUploader';
import { IconSmartphone, IconLeaf, IconSave } from '../../components/common/Icons';
import './ProducerSetup.css';

const CERTIFICATIONS_OPTIONS = [
  'organic',
  'local',
  'sustainable',
  'fair-trade',
  'vegan',
  'gluten-free'
];

const ProducerProfile = () => {
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
    whatsapp: ''
  });
  const [producerId, setProducerId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [activeDescLang, setActiveDescLang] = useState('es');
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
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/producers/me');
      if (response.data.success && response.data.data.producer) {
        const producer = response.data.data.producer;
        setProducerId(producer._id);
        setFormData({
          businessName: producer.businessName || '',
          description: {
            es: producer.description?.es || '',
            en: producer.description?.en || '',
            fr: producer.description?.fr || '',
            de: producer.description?.de || ''
          },
          logo: producer.logo || '',
          location: {
            address: producer.location?.address || '',
            city: producer.location?.city || '',
            region: producer.location?.region || ''
          },
          certifications: producer.certifications || [],
          whatsapp: producer.whatsapp || ''
        });
      } else {
        navigate('/producer/setup');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        navigate('/producer/setup');
      } else {
        toast.error(t('common.errorLoading'));
      }
    } finally {
      setLoadingProfile(false);
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
      const response = await api.put(`/producers/${producerId}`, formData);
      
      if (response.data.success) {
        toast.success(t('producer.profile.updateSuccess'));
        navigate('/producer');
      }
    } catch (error) {
      console.error('Error updating producer profile:', error);
      const errorMessage = error.response?.data?.message || t('producer.profile.updateError');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const DESCRIPTION_LANGS = [
    { code: 'es', label: 'Español' },
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' }
  ];

  if (loadingProfile) {
    return (
      <div className="producer-setup">
        <div className="container">
          <div className="loading">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="producer-setup producer-profile">
      <div className="container">
        <div className="setup-card">
          <header className="setup-header">
            <Link to="/producer" className="back-link">
              ← {t('producer.common.backToPanel')}
            </Link>
            <div className="setup-icon"><IconLeaf size={48} /></div>
            <h1>{t('producer.profile.title')}</h1>
            <p className="setup-subtitle">{t('producer.profile.subtitle')}</p>
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
                <label>{t('producer.setup.description')} *</label>
                <div className="description-tabs">
                  {DESCRIPTION_LANGS.map(lang => (
                    <button
                      key={lang.code}
                      type="button"
                      className={`desc-tab ${activeDescLang === lang.code ? 'active' : ''}`}
                      onClick={() => setActiveDescLang(lang.code)}
                    >
                      {lang.label}
                      {lang.code !== 'es' && formData.description[lang.code] && (
                        <span className="tab-filled">✓</span>
                      )}
                    </button>
                  ))}
                </div>
                <textarea
                  id={`description.${activeDescLang}`}
                  name={`description.${activeDescLang}`}
                  value={formData.description[activeDescLang]}
                  onChange={handleInputChange}
                  placeholder={t('producer.setup.descriptionPlaceholder')}
                  rows={4}
                  required={activeDescLang === 'es'}
                />
                {activeDescLang !== 'es' && (
                  <p className="field-hint">{t('producer.profile.translationHint')}</p>
                )}
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
            </section>

            <section className="form-section">
              <h2>{t('producer.setup.contactInfo')}</h2>
              
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

            <div className="form-actions">
              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? (
                  t('common.saving')
                ) : (
                  <>
                    <IconSave size={18} />
                    {t('producer.profile.saveChanges')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProducerProfile;
