import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const COOKIE_CONSENT_KEY = 'cookie_consent';

const hasAnalyticsConsent = () => {
  try {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) return false;
    const preferences = JSON.parse(consent);
    return preferences.analytics === true;
  } catch {
    return false;
  }
};

const Analytics = () => {
  const location = useLocation();
  const [gaLoaded, setGaLoaded] = useState(false);

  const initializeGA = useCallback(() => {
    if (!GA_MEASUREMENT_ID || window.gtag) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: false,
      anonymize_ip: true,
    });
    setGaLoaded(true);
  }, []);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;

    // Check consent on mount
    if (hasAnalyticsConsent()) {
      initializeGA();
    }

    // Listen for consent changes
    const handleStorageChange = (event) => {
      if (event.key === COOKIE_CONSENT_KEY && hasAnalyticsConsent() && !gaLoaded) {
        initializeGA();
      }
    };

    // Custom event for same-tab consent updates
    const handleConsentChange = () => {
      if (hasAnalyticsConsent() && !gaLoaded) {
        initializeGA();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cookieConsentChanged', handleConsentChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cookieConsentChanged', handleConsentChange);
    };
  }, [initializeGA, gaLoaded]);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || !window.gtag || !hasAnalyticsConsent()) return;

    // Track page views on route change
    window.gtag('event', 'page_view', {
      page_path: location.pathname + location.search,
      page_title: document.title,
    });
  }, [location]);

  return null;
};

// Helper functions to track events
export const trackEvent = (eventName, parameters = {}) => {
  if (window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

export const trackPurchase = (transactionId, value, items) => {
  trackEvent('purchase', {
    transaction_id: transactionId,
    value: value,
    currency: 'EUR',
    items: items,
  });
};

export const trackAddToCart = (item, value) => {
  trackEvent('add_to_cart', {
    currency: 'EUR',
    value: value,
    items: [item],
  });
};

export const trackViewItem = (item) => {
  trackEvent('view_item', {
    currency: 'EUR',
    value: item.price,
    items: [item],
  });
};

export const trackSearch = (searchTerm) => {
  trackEvent('search', {
    search_term: searchTerm,
  });
};

export default Analytics;
