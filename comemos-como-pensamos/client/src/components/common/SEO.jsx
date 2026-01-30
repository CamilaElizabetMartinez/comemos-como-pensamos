import { useEffect } from 'react';

const SEO = ({ 
  title, 
  description, 
  image, 
  url,
  type = 'website'
}) => {
  const siteName = 'Comemos Como Pensamos';
  const defaultDescription = 'Productos frescos directamente de productores locales verificados';
  const defaultImage = '/og-image.jpg';
  
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const metaDescription = description || defaultDescription;
  const metaImage = image || defaultImage;
  const metaUrl = url || window.location.href;

  useEffect(() => {
    document.title = fullTitle;

    const updateMeta = (name, content, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateMeta('description', metaDescription);
    updateMeta('og:title', fullTitle, true);
    updateMeta('og:description', metaDescription, true);
    updateMeta('og:image', metaImage, true);
    updateMeta('og:url', metaUrl, true);
    updateMeta('og:type', type, true);
    updateMeta('og:site_name', siteName, true);
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', fullTitle);
    updateMeta('twitter:description', metaDescription);
    updateMeta('twitter:image', metaImage);

  }, [fullTitle, metaDescription, metaImage, metaUrl, type]);

  return null;
};

export default SEO;
