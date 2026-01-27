import React, { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useSEO from '../hooks/useSEO';
import './JoinAsProducerPage.css';

const ICONS = {
  noStallFees: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 9h.01M15 9h.01M9 13h.01M15 13h.01"/>
      <path d="M2 12l10-7 10 7" strokeLinecap="round"/>
    </svg>
  ),
  noTransport: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="7" cy="17" r="2"/>
      <circle cx="17" cy="17" r="2"/>
      <path d="M5 17H3V6a1 1 0 011-1h9v12M9 17h6m4 0h2v-6l-3-5h-4v11"/>
      <line x1="2" y1="2" x2="22" y2="22" strokeLinecap="round"/>
    </svg>
  ),
  digitalPresence: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="5" y="2" width="14" height="20" rx="2"/>
      <line x1="12" y1="18" x2="12" y2="18.01" strokeLinecap="round"/>
      <path d="M9 6h6M9 10h6M9 14h3"/>
    </svg>
  ),
  securePayments: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <line x1="2" y1="10" x2="22" y2="10"/>
      <path d="M12 15a2 2 0 100-4 2 2 0 000 4z"/>
      <path d="M17 15h2M5 15h2"/>
    </svg>
  ),
  orderManagement: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 8V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h7"/>
      <path d="M16 3v4M8 3v4M3 10h18"/>
      <path d="M16 19l2 2 4-4"/>
    </svg>
  ),
  salesReports: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18 20V10M12 20V4M6 20v-6"/>
      <rect x="2" y="2" width="20" height="20" rx="2"/>
    </svg>
  ),
  register: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <line x1="19" y1="8" x2="19" y2="14"/>
      <line x1="22" y1="11" x2="16" y2="11"/>
    </svg>
  ),
  approval: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  sell: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4.5 16.5L12 21l7.5-4.5"/>
      <path d="M4.5 12L12 16.5 19.5 12"/>
      <path d="M12 3L4.5 7.5 12 12l7.5-4.5L12 3z"/>
    </svg>
  ),
  platform: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  ),
  traditional: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 3h18v18H3zM3 9h18M9 21V9"/>
    </svg>
  )
};

const BENEFITS = [
  { key: 'noStallFees' },
  { key: 'noTransport' },
  { key: 'digitalPresence' },
  { key: 'securePayments' },
  { key: 'orderManagement' },
  { key: 'salesReports' }
];

const STEPS = [
  { number: '01', key: 'register' },
  { number: '02', key: 'approval' },
  { number: '03', key: 'sell' }
];

const FAQS = [
  { key: 'commission' },
  { key: 'requirements' },
  { key: 'payments' },
  { key: 'shipping' }
];

const TESTIMONIALS = [
  {
    id: 1,
    name: 'María García',
    business: 'Huerta La Esperanza',
    location: 'Vélez-Málaga',
    image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop',
    quote: 'testimonial1'
  },
  {
    id: 2,
    name: 'Antonio Ruiz',
    business: 'Aceites del Valle',
    location: 'Antequera',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
    quote: 'testimonial2'
  },
  {
    id: 3,
    name: 'Carmen López',
    business: 'Quesos Artesanos Sierra',
    location: 'Ronda',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    quote: 'testimonial3'
  }
];

const PLATFORM_STATS = {
  producers: '50+',
  products: '500+',
  customers: '2000+',
  orders: '5000+'
};

const JoinAsProducerPage = () => {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState(null);

  const faqJsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': FAQS.map(faq => ({
      '@type': 'Question',
      'name': t(`join.faq.items.${faq.key}.question`),
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': t(`join.faq.items.${faq.key}.answer`)
      }
    }))
  }), [t]);

  useSEO({
    title: t('join.seo.title'),
    description: t('join.seo.description'),
    keywords: t('join.seo.keywords'),
    canonicalUrl: 'https://comemoscomopensamos.es/unete',
    ogData: {
      title: t('join.seo.title'),
      description: t('join.seo.description'),
      type: 'website',
      image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&h=630&fit=crop'
    },
    jsonLd: faqJsonLd
  });

  const toggleFaq = useCallback((index) => {
    setOpenFaq(prevOpen => prevOpen === index ? null : index);
  }, []);

  const comparisonData = useMemo(() => ({
    platform: [
      { key: 'commission', value: '15%' },
      { key: 'stallCost', value: '0€' },
      { key: 'transport', value: '0€' },
      { key: 'timeInvested', value: t('join.comparison.minimal') },
      { key: 'reach', value: t('join.comparison.unlimited') }
    ],
    traditional: [
      { key: 'commission', value: '0%' },
      { key: 'stallCost', value: '50-150€' },
      { key: 'transport', value: '30-80€' },
      { key: 'timeInvested', value: '8-12h' },
      { key: 'reach', value: t('join.comparison.local') }
    ]
  }), [t]);

  return (
    <div className="join-producer-page">
      {/* Hero Section */}
      <section className="join-hero">
        <div className="join-hero-bg">
          <img 
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1920&q=80" 
            alt="" 
            aria-hidden="true"
          />
          <div className="join-hero-overlay" />
        </div>
        <div className="join-hero-content">
          <span className="join-hero-badge">{t('join.hero.badge')}</span>
          <h1>{t('join.hero.title')}</h1>
          <p className="join-hero-subtitle">{t('join.hero.subtitle')}</p>
          <div className="join-hero-cta">
            <Link to="/register" className="btn btn-primary btn-lg">
              {t('join.hero.cta')}
            </Link>
            <Link to="/calculadora-productor" className="btn btn-outline btn-lg">
              {t('join.hero.calculator')}
            </Link>
          </div>
          <div className="join-hero-stats">
            <div className="stat-item">
              <span className="stat-value">{PLATFORM_STATS.producers}</span>
              <span className="stat-label">{t('join.stats.producers')}</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{PLATFORM_STATS.products}</span>
              <span className="stat-label">{t('join.stats.products')}</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{PLATFORM_STATS.customers}</span>
              <span className="stat-label">{t('join.stats.customers')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="join-section join-how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>{t('join.howItWorks.title')}</h2>
            <p>{t('join.howItWorks.subtitle')}</p>
          </div>
          <div className="steps-grid">
            {STEPS.map((step, index) => (
              <div key={step.key} className="step-card">
                <div className="step-number">{step.number}</div>
                <div className="step-icon">{ICONS[step.key]}</div>
                <h3>{t(`join.howItWorks.steps.${step.key}.title`)}</h3>
                <p>{t(`join.howItWorks.steps.${step.key}.description`)}</p>
                {index < STEPS.length - 1 && <div className="step-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="join-section join-benefits">
        <div className="container">
          <div className="section-header">
            <h2>{t('join.benefits.title')}</h2>
            <p>{t('join.benefits.subtitle')}</p>
          </div>
          <div className="benefits-grid">
            {BENEFITS.map((benefit) => (
              <div key={benefit.key} className="benefit-card">
                <div className="benefit-icon">{ICONS[benefit.key]}</div>
                <h3>{t(`join.benefits.items.${benefit.key}.title`)}</h3>
                <p>{t(`join.benefits.items.${benefit.key}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="join-section join-comparison">
        <div className="container">
          <div className="section-header">
            <h2>{t('join.comparison.title')}</h2>
            <p>{t('join.comparison.subtitle')}</p>
          </div>
          <div className="comparison-table">
            <div className="comparison-column comparison-header">
              <div className="comparison-cell header-cell"></div>
              {comparisonData.platform.map((item) => (
                <div key={item.key} className="comparison-cell label-cell">
                  {t(`join.comparison.labels.${item.key}`)}
                </div>
              ))}
            </div>
            <div className="comparison-column comparison-platform">
              <div className="comparison-cell header-cell highlight">
                <span className="column-icon">{ICONS.platform}</span>
                {t('join.comparison.platformTitle')}
              </div>
              {comparisonData.platform.map((item) => (
                <div key={item.key} className="comparison-cell value-cell highlight">
                  {item.value}
                </div>
              ))}
            </div>
            <div className="comparison-column comparison-traditional">
              <div className="comparison-cell header-cell">
                <span className="column-icon">{ICONS.traditional}</span>
                {t('join.comparison.traditionalTitle')}
              </div>
              {comparisonData.traditional.map((item) => (
                <div key={item.key} className="comparison-cell value-cell">
                  {item.value}
                </div>
              ))}
            </div>
          </div>
          <div className="comparison-cta">
            <Link to="/calculadora-productor" className="btn btn-secondary">
              {t('join.comparison.calculateEarnings')}
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="join-section join-testimonials">
        <div className="container">
          <div className="section-header">
            <h2>{t('join.testimonials.title')}</h2>
            <p>{t('join.testimonials.subtitle')}</p>
          </div>
          <div className="testimonials-grid">
            {TESTIMONIALS.map((testimonial) => (
              <div key={testimonial.id} className="testimonial-card">
                <div className="testimonial-quote">
                  <span className="quote-mark">"</span>
                  <p>{t(`join.testimonials.quotes.${testimonial.quote}`)}</p>
                </div>
                <div className="testimonial-author">
                  <img 
                    src={testimonial.image} 
                    alt={`${testimonial.name}, productor de ${testimonial.business} en ${testimonial.location}`}
                    className="author-image"
                    loading="lazy"
                  />
                  <div className="author-info">
                    <strong>{testimonial.name}</strong>
                    <span>{testimonial.business}</span>
                    <span className="author-location">📍 {testimonial.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="join-section join-faq">
        <div className="container">
          <div className="section-header">
            <h2>{t('join.faq.title')}</h2>
            <p>{t('join.faq.subtitle')}</p>
          </div>
          <div className="faq-list">
            {FAQS.map((faq, index) => (
              <div 
                key={faq.key} 
                className={`faq-item ${openFaq === index ? 'open' : ''}`}
              >
                <button 
                  className="faq-question"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={openFaq === index}
                >
                  <span>{t(`join.faq.items.${faq.key}.question`)}</span>
                  <span className="faq-icon">{openFaq === index ? '−' : '+'}</span>
                </button>
                <div className="faq-answer">
                  <p>{t(`join.faq.items.${faq.key}.answer`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="join-section join-final-cta">
        <div className="container">
          <div className="final-cta-content">
            <h2>{t('join.finalCta.title')}</h2>
            <p>{t('join.finalCta.subtitle')}</p>
            <div className="final-cta-buttons">
              <Link to="/register" className="btn btn-primary btn-lg">
                {t('join.finalCta.register')}
              </Link>
              <Link to="/contact" className="btn btn-outline-light btn-lg">
                {t('join.finalCta.contact')}
              </Link>
            </div>
            <p className="final-cta-hint">{t('join.finalCta.hint')}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JoinAsProducerPage;
