import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import ProductCard from '../components/common/ProductCard';
import { ListSkeleton } from '../components/common/Skeleton';
import SEO from '../components/common/SEO';
import './HomePage.css';

const CAROUSEL_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1920&q=80&auto=format&fit=crop',
    titleKey: 'home.carousel.slide1Title',
    subtitleKey: 'home.carousel.slide1Subtitle'
  },
  {
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1920&q=80&auto=format&fit=crop',
    titleKey: 'home.carousel.slide2Title',
    subtitleKey: 'home.carousel.slide2Subtitle'
  },
  {
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1920&q=80&auto=format&fit=crop',
    titleKey: 'home.carousel.slide3Title',
    subtitleKey: 'home.carousel.slide3Subtitle'
  },
  {
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1920&q=80&auto=format&fit=crop',
    titleKey: 'home.carousel.slide4Title',
    subtitleKey: 'home.carousel.slide4Subtitle'
  }
];

const AUTOPLAY_INTERVAL = 6000;
const SWIPE_THRESHOLD = 50;

const ICONS = {
  location: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  truck: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="3" width="15" height="13" rx="2" />
      <polyline points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  leaf: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  sparkles: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3L14.5 8.5L20 11L14.5 13.5L12 19L9.5 13.5L4 11L9.5 8.5L12 3Z" />
      <path d="M19 3L20 5L22 6L20 7L19 9L18 7L16 6L18 5L19 3Z" />
    </svg>
  ),
  flame: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  ),
  arrowRight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
};

const HomePage = () => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingLatest, setLoadingLatest] = useState(true);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  const goToNextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  }, []);

  const goToPrevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(goToNextSlide, AUTOPLAY_INTERVAL);
    return () => clearInterval(interval);
  }, [isAutoPlaying, goToNextSlide]);

  const handleMouseEnter = useCallback(() => setIsAutoPlaying(false), []);
  const handleMouseLeave = useCallback(() => setIsAutoPlaying(true), []);

  const handleTouchStart = useCallback((event) => {
    touchStartX.current = event.touches[0].clientX;
    setIsAutoPlaying(false);
  }, []);

  const handleTouchMove = useCallback((event) => {
    touchEndX.current = event.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    
    if (Math.abs(swipeDistance) > SWIPE_THRESHOLD) {
      if (swipeDistance > 0) {
        goToNextSlide();
      } else {
        goToPrevSlide();
      }
    }
    
    setIsAutoPlaying(true);
  }, [goToNextSlide, goToPrevSlide]);

  const fetchFeaturedProducts = useCallback(async () => {
    try {
      const response = await api.get('/products/featured?limit=5');
      setFeaturedProducts(response.data.data.products || []);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoadingFeatured(false);
    }
  }, []);

  const fetchLatestProducts = useCallback(async () => {
    try {
      const response = await api.get('/products/latest?limit=5');
      setLatestProducts(response.data.data.products || []);
    } catch (error) {
      console.error('Error fetching latest products:', error);
    } finally {
      setLoadingLatest(false);
    }
  }, []);

  useEffect(() => {
    fetchFeaturedProducts();
    fetchLatestProducts();
  }, [fetchFeaturedProducts, fetchLatestProducts]);

  const productSections = useMemo(() => [
    {
      id: 'featured',
      title: t('home.sections.featured.title', 'DESTACADOS'),
      colorClass: 'title-accent-gold',
      products: featuredProducts,
      loading: loadingFeatured,
      show: featuredProducts.length > 0 || loadingFeatured
    },
    {
      id: 'latest',
      title: t('home.sections.latest.title', 'NOVEDADES'),
      colorClass: 'title-accent-green',
      products: latestProducts,
      loading: loadingLatest,
      show: latestProducts.length > 0 || loadingLatest
    }
  ], [featuredProducts, latestProducts, loadingFeatured, loadingLatest, t]);

  return (
    <div className="home-page">
      <SEO 
        title={t('home.seoTitle', 'Productos locales frescos')}
        description={t('home.seoDescription', 'Compra productos frescos directamente de productores locales verificados. Frutas, verduras, lácteos y más.')}
      />
      <section 
        className="hero-carousel"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {CAROUSEL_SLIDES.map((slide, index) => (
          <div
            key={index}
            className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="carousel-overlay" />
            <div className="carousel-content">
              <h1>{t(slide.titleKey)}</h1>
              <p>{t(slide.subtitleKey)}</p>
              <div className="hero-actions">
                <Link to="/products" className="btn btn-primary">
                  {t('home.exploreProducts')}
                </Link>
                <Link to="/producers" className="btn btn-secondary">
                  {t('home.meetProducers')}
                </Link>
              </div>
            </div>
          </div>
        ))}

        <button className="carousel-arrow carousel-prev" onClick={goToPrevSlide} aria-label="Previous">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button className="carousel-arrow carousel-next" onClick={goToNextSlide} aria-label="Next">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </button>

        <div className="carousel-dots">
          {CAROUSEL_SLIDES.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>{t('home.whyChooseUs')}</h2>
          <div className="features-grid">
            <div className="feature">
              <div className="feature-icon">
                {ICONS.location}
              </div>
              <h3>{t('home.localProducts')}</h3>
              <p>{t('home.localProductsDesc')}</p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                {ICONS.check}
              </div>
              <h3>{t('home.qualityGuaranteed')}</h3>
              <p>{t('home.qualityGuaranteedDesc')}</p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                {ICONS.truck}
              </div>
              <h3>{t('home.fastShipping')}</h3>
              <p>{t('home.fastShippingDesc')}</p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                {ICONS.leaf}
              </div>
              <h3>{t('home.sustainable')}</h3>
              <p>{t('home.sustainableDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {productSections.map((section) => section.show && (
        <section key={section.id} className="products-section">
          <div className="container">
            <div className="section-header">
              <h2 className={`section-title-minimal ${section.colorClass}`}>{section.title}</h2>
              <Link to="/products" className="view-all-link">
                {t('home.viewAll')}
              </Link>
            </div>
            
            {section.loading ? (
              <ListSkeleton type="product" count={5} />
            ) : (
              <div className="products-grid home-products-grid">
                {section.products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      ))}

      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <div className="cta-text">
              <h2>
                <span>{t('home.ctaSubtitle')}</span>
                {t('home.ctaTitle')}
              </h2>
              <p>{t('home.ctaDescription')}</p>
            </div>
            <div className="cta-actions">
              <Link to="/unete" className="btn-large">
                {t('home.ctaButton')}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
