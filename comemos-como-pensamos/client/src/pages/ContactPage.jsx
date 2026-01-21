import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../services/api';
import './ContactPage.css';

const ContactPage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/contact', formData);
      setSubmitted(true);
      toast.success(t('contact.successMessage'));
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error(t('contact.errorMessage'));
    } finally {
      setLoading(false);
    }
  }, [formData, t]);

  return (
    <div className="contact-page">
      <div className="container">
        <div className="contact-header">
          <h1>{t('contact.title')}</h1>
          <p>{t('contact.subtitle')}</p>
        </div>

        <div className="contact-content">
          <div className="contact-info">
            <div className="info-card">
              <span className="info-icon">📍</span>
              <h3>{t('contact.address')}</h3>
              <p>Calle Principal 123<br />28001 Madrid, España</p>
            </div>
            
            <div className="info-card">
              <span className="info-icon">📧</span>
              <h3>{t('contact.email')}</h3>
              <p>info@comemoscomopensamos.es</p>
            </div>
            
            <div className="info-card">
              <span className="info-icon">📞</span>
              <h3>{t('contact.phone')}</h3>
              <p>+34 900 123 456</p>
            </div>
            
            <div className="info-card">
              <span className="info-icon">🕐</span>
              <h3>{t('contact.hours')}</h3>
              <p>{t('contact.hoursDetail')}</p>
            </div>
          </div>

          <div className="contact-form-container">
            {submitted ? (
              <div className="success-message">
                <span className="success-icon">✅</span>
                <h2>{t('contact.thankYou')}</h2>
                <p>{t('contact.responseTime')}</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setSubmitted(false)}
                >
                  {t('contact.sendAnother')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <h2>{t('contact.formTitle')}</h2>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">{t('contact.name')}</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t('contact.namePlaceholder')}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">{t('contact.emailField')}</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t('contact.emailPlaceholder')}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">{t('contact.subject')}</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">{t('contact.selectSubject')}</option>
                    <option value="general">{t('contact.subjects.general')}</option>
                    <option value="order">{t('contact.subjects.order')}</option>
                    <option value="product">{t('contact.subjects.product')}</option>
                    <option value="producer">{t('contact.subjects.producer')}</option>
                    <option value="technical">{t('contact.subjects.technical')}</option>
                    <option value="other">{t('contact.subjects.other')}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">{t('contact.message')}</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t('contact.messagePlaceholder')}
                    rows="6"
                    required
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary btn-submit"
                  disabled={loading}
                >
                  {loading ? t('common.loading') : t('contact.send')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;



