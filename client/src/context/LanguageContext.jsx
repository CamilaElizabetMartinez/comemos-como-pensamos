import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext();

const AVAILABLE_LANGUAGES = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' }
];

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language?.split('-')[0] || 'es');

  useEffect(() => {
    const handleLanguageChanged = (lng) => {
      setCurrentLanguage(lng.split('-')[0]);
    };

    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  const changeLanguage = useCallback((lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  }, [i18n]);

  const value = {
    currentLanguage,
    changeLanguage,
    languages: AVAILABLE_LANGUAGES
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
