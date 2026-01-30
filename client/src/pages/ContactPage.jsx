import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../services/api';
import useFormValidation from '../hooks/useFormValidation';
import SEO from '../components/common/SEO';
import './ContactPage.css';

const ICONS = {
  location: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  email: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
};

const VALIDATION_RULES = {
  name: ['required', { type: 'minLength', value: 2 }],
  email: ['required', 'email'],
  subject: ['required', { type: 'minLength', value: 5 }],
  message: ['required', { type: 'minLength', value: 20 }],
};

const ContactPage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const { values, getFieldProps, getFieldState, validateAll, reset } = useFormValidation(
    { name: '', email: '', subject: '', message: '' },
    VALIDATION_RULES
  );

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateAll()) return;
    
    setLoading(true);

    try {
      await api.post('/contact', values);
      setSubmitted(true);
      toast.success(t('contact.successMessage'));
      reset();
    } catch (error) {
      toast.error(t('contact.errorMessage'));
    } finally {
      setLoading(false);
    }
  }, [values, validateAll, reset, t]);

  return (
    <div className="contact-page">
      <SEO 
        title={t('contact.seoTitle', 'Contacto')}
        description={t('contact.seoDescription', 'Contacta con nosotros. Estamos aquí para ayudarte con cualquier pregunta sobre productos, pedidos o productores.')}
      />
      <div className="container">
        <div className="contact-header">
          <h1>{t('contact.title')}</h1>
          <p>{t('contact.subtitle')}</p>
        </div>

        <div className="contact-content">
          <div className="contact-info">
            <div className="info-card">
              <span className="info-icon">{ICONS.location}</span>
              <h3>{t('contact.address')}</h3>
              <p>Calle Principal 123<br />28001 Madrid, España</p>
            </div>
            
            <div className="info-card">
              <span className="info-icon">{ICONS.email}</span>
              <h3>{t('contact.email')}</h3>
              <p>info@comemoscomopensamos.es</p>
            </div>
            
            <div className="info-card">
              <span className="info-icon">{ICONS.phone}</span>
              <h3>{t('contact.phone')}</h3>
              <p>+34 900 123 456</p>
            </div>
            
            <div className="info-card">
              <span className="info-icon">{ICONS.clock}</span>
              <h3>{t('contact.hours')}</h3>
              <p>{t('contact.hoursDetail')}</p>
            </div>
          </div>

          <div className="contact-form-container">
            {submitted ? (
              <div className="success-message">
                <span className="success-icon">{ICONS.check}</span>
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
              <form onSubmit={handleSubmit} className="contact-form" noValidate>
                <h2>{t('contact.formTitle')}</h2>
                
                <div className="form-row">
                  <div className={`form-group ${getFieldState('name').hasError ? 'has-error' : ''}`}>
                    <label htmlFor="name">{t('contact.name')}</label>
                    <input
                      type="text"
                      id="name"
                      {...getFieldProps('name')}
                      placeholder={t('contact.namePlaceholder')}
                    />
                    {getFieldState('name').hasError && (
                      <span id="name-error" className="field-error" role="alert">
                        {getFieldState('name').error}
                      </span>
                    )}
                  </div>
                  
                  <div className={`form-group ${getFieldState('email').hasError ? 'has-error' : ''}`}>
                    <label htmlFor="email">{t('contact.emailField')}</label>
                    <input
                      type="email"
                      id="email"
                      {...getFieldProps('email')}
                      placeholder={t('contact.emailPlaceholder')}
                    />
                    {getFieldState('email').hasError && (
                      <span id="email-error" className="field-error" role="alert">
                        {getFieldState('email').error}
                      </span>
                    )}
                  </div>
                </div>

                <div className={`form-group ${getFieldState('subject').hasError ? 'has-error' : ''}`}>
                  <label htmlFor="subject">{t('contact.subject')}</label>
                  <select
                    id="subject"
                    {...getFieldProps('subject')}
                  >
                    <option value="">{t('contact.selectSubject')}</option>
                    <option value="general">{t('contact.subjects.general')}</option>
                    <option value="order">{t('contact.subjects.order')}</option>
                    <option value="product">{t('contact.subjects.product')}</option>
                    <option value="producer">{t('contact.subjects.producer')}</option>
                    <option value="technical">{t('contact.subjects.technical')}</option>
                    <option value="other">{t('contact.subjects.other')}</option>
                  </select>
                  {getFieldState('subject').hasError && (
                    <span id="subject-error" className="field-error" role="alert">
                      {getFieldState('subject').error}
                    </span>
                  )}
                </div>

                <div className={`form-group ${getFieldState('message').hasError ? 'has-error' : ''}`}>
                  <label htmlFor="message">{t('contact.message')}</label>
                  <textarea
                    id="message"
                    {...getFieldProps('message')}
                    placeholder={t('contact.messagePlaceholder')}
                    rows="6"
                  ></textarea>
                  {getFieldState('message').hasError && (
                    <span id="message-error" className="field-error" role="alert">
                      {getFieldState('message').error}
                    </span>
                  )}
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











