import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://comemoscomopensamos.es';

const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  article = null,
  product = null,
  noindex = false
}) => {
  const siteTitle = 'Comemos Como Pensamos';
  const defaultDescription = 'Productos frescos y sostenibles directamente de productores locales verificados. Alimentación consciente y de proximidad.';
  const defaultImage = `${BASE_URL}/icons/icon-512x512.svg`;

  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const metaDescription = description || defaultDescription;
  const metaImage = image || defaultImage;
  const canonicalUrl = url ? `${BASE_URL}${url}` : BASE_URL;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content="es_ES" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {/* Article specific (for blog posts) */}
      {article && (
        <>
          <meta property="article:published_time" content={article.publishedAt} />
          {article.modifiedAt && (
            <meta property="article:modified_time" content={article.modifiedAt} />
          )}
          {article.author && (
            <meta property="article:author" content={article.author} />
          )}
          {article.category && (
            <meta property="article:section" content={article.category} />
          )}
        </>
      )}

      {/* Product specific (for product pages) */}
      {product && (
        <>
          <meta property="product:price:amount" content={product.price} />
          <meta property="product:price:currency" content="EUR" />
          {product.availability && (
            <meta property="product:availability" content={product.availability} />
          )}
        </>
      )}

      {/* JSON-LD Structured Data */}
      {product && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "description": metaDescription,
            "image": metaImage,
            "offers": {
              "@type": "Offer",
              "price": product.price,
              "priceCurrency": "EUR",
              "availability": product.stock > 0 
                ? "https://schema.org/InStock" 
                : "https://schema.org/OutOfStock"
            },
            ...(product.rating && {
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": product.rating,
                "reviewCount": product.reviewCount || 0
              }
            })
          })}
        </script>
      )}

      {article && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": title,
            "description": metaDescription,
            "image": metaImage,
            "datePublished": article.publishedAt,
            "dateModified": article.modifiedAt || article.publishedAt,
            "author": {
              "@type": "Organization",
              "name": siteTitle
            },
            "publisher": {
              "@type": "Organization",
              "name": siteTitle,
              "logo": {
                "@type": "ImageObject",
                "url": `${BASE_URL}/icons/icon-192x192.svg`
              }
            }
          })}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
