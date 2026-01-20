import React from 'react';
import { useTranslation } from 'react-i18next';
import './LegalPages.css';

const TermsPage = () => {
  const { t } = useTranslation();

  return (
    <div className="legal-page">
      <div className="container">
        <h1>{t('legal.terms.title')}</h1>
        <p className="last-updated">{t('legal.lastUpdated')}: Enero 2026</p>

        <section>
          <h2>1. {t('legal.terms.acceptance.title')}</h2>
          <p>{t('legal.terms.acceptance.content')}</p>
        </section>

        <section>
          <h2>2. {t('legal.terms.description.title')}</h2>
          <p>{t('legal.terms.description.content')}</p>
        </section>

        <section>
          <h2>3. {t('legal.terms.registration.title')}</h2>
          <p>{t('legal.terms.registration.content')}</p>
        </section>

        <section>
          <h2>4. {t('legal.terms.orders.title')}</h2>
          <p>{t('legal.terms.orders.content')}</p>
        </section>

        <section>
          <h2>5. {t('legal.terms.payments.title')}</h2>
          <p>{t('legal.terms.payments.content')}</p>
        </section>

        <section>
          <h2>6. {t('legal.terms.shipping.title')}</h2>
          <p>{t('legal.terms.shipping.content')}</p>
        </section>

        <section>
          <h2>7. {t('legal.terms.returns.title')}</h2>
          <p>{t('legal.terms.returns.content')}</p>
        </section>

        <section>
          <h2>8. {t('legal.terms.producers.title')}</h2>
          <p>{t('legal.terms.producers.content')}</p>
        </section>

        <section>
          <h2>9. {t('legal.terms.liability.title')}</h2>
          <p>{t('legal.terms.liability.content')}</p>
        </section>

        <section>
          <h2>10. {t('legal.terms.changes.title')}</h2>
          <p>{t('legal.terms.changes.content')}</p>
        </section>

        <section>
          <h2>11. {t('legal.terms.contact.title')}</h2>
          <p>{t('legal.terms.contact.content')}</p>
        </section>
      </div>
    </div>
  );
};

export default TermsPage;


