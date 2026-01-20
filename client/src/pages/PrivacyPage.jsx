import React from 'react';
import { useTranslation } from 'react-i18next';
import './LegalPages.css';

const PrivacyPage = () => {
  const { t } = useTranslation();

  return (
    <div className="legal-page">
      <div className="container">
        <h1>{t('legal.privacy.title')}</h1>
        <p className="last-updated">{t('legal.lastUpdated')}: Enero 2026</p>

        <section>
          <h2>1. {t('legal.privacy.intro.title')}</h2>
          <p>{t('legal.privacy.intro.content')}</p>
        </section>

        <section>
          <h2>2. {t('legal.privacy.dataCollected.title')}</h2>
          <p>{t('legal.privacy.dataCollected.content')}</p>
          <ul>
            <li>{t('legal.privacy.dataCollected.item1')}</li>
            <li>{t('legal.privacy.dataCollected.item2')}</li>
            <li>{t('legal.privacy.dataCollected.item3')}</li>
            <li>{t('legal.privacy.dataCollected.item4')}</li>
          </ul>
        </section>

        <section>
          <h2>3. {t('legal.privacy.usage.title')}</h2>
          <p>{t('legal.privacy.usage.content')}</p>
          <ul>
            <li>{t('legal.privacy.usage.item1')}</li>
            <li>{t('legal.privacy.usage.item2')}</li>
            <li>{t('legal.privacy.usage.item3')}</li>
            <li>{t('legal.privacy.usage.item4')}</li>
          </ul>
        </section>

        <section>
          <h2>4. {t('legal.privacy.sharing.title')}</h2>
          <p>{t('legal.privacy.sharing.content')}</p>
        </section>

        <section>
          <h2>5. {t('legal.privacy.security.title')}</h2>
          <p>{t('legal.privacy.security.content')}</p>
        </section>

        <section>
          <h2>6. {t('legal.privacy.rights.title')}</h2>
          <p>{t('legal.privacy.rights.content')}</p>
          <ul>
            <li>{t('legal.privacy.rights.item1')}</li>
            <li>{t('legal.privacy.rights.item2')}</li>
            <li>{t('legal.privacy.rights.item3')}</li>
            <li>{t('legal.privacy.rights.item4')}</li>
          </ul>
        </section>

        <section>
          <h2>7. {t('legal.privacy.retention.title')}</h2>
          <p>{t('legal.privacy.retention.content')}</p>
        </section>

        <section>
          <h2>8. {t('legal.privacy.contact.title')}</h2>
          <p>{t('legal.privacy.contact.content')}</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPage;


