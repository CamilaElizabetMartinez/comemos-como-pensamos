import { useEffect } from 'react';

/**
 * Custom hook for setting SEO meta tags
 * @param {Object} options - SEO options
 * @param {string} options.title - Page title
 * @param {string} options.description - Meta description
 * @param {string} options.keywords - Meta keywords
 * @param {string} options.canonicalUrl - Canonical URL
 * @param {Object} options.ogData - Open Graph data
 * @param {Object} options.jsonLd - JSON-LD structured data
 */
const useSEO = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogData,
  jsonLd
}) => {
  useEffect(() => {
    // Set document title
    if (title) {
      document.title = title;
    }

    // Helper to set or create meta tag
    const setMetaTag = (name, content, isProperty = false) => {
      if (!content) return;
      
      const attribute = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Set standard meta tags
    setMetaTag('description', description);
    setMetaTag('keywords', keywords);

    // Set Open Graph tags
    if (ogData) {
      setMetaTag('og:title', ogData.title || title, true);
      setMetaTag('og:description', ogData.description || description, true);
      setMetaTag('og:type', ogData.type || 'website', true);
      setMetaTag('og:url', ogData.url || canonicalUrl, true);
      setMetaTag('og:image', ogData.image, true);
      setMetaTag('og:site_name', 'Comemos Como Pensamos', true);
    }

    // Set canonical URL
    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', canonicalUrl);
    }

    // Set JSON-LD structured data
    if (jsonLd) {
      const scriptId = 'json-ld-structured-data';
      let script = document.getElementById(scriptId);
      
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    }

    // Cleanup function
    return () => {
      const jsonLdScript = document.getElementById('json-ld-structured-data');
      if (jsonLdScript) {
        jsonLdScript.remove();
      }
    };
  }, [title, description, keywords, canonicalUrl, ogData, jsonLd]);
};

export default useSEO;
