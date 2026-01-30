import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

const Analytics = () => {
  const location = useLocation();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;

    // Load GA script only once
    if (!window.gtag) {
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
      });
    }
  }, []);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || !window.gtag) return;

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
