import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './HomePage.css';

const CAROUSEL_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1920&q=80',
    titleKey: 'home.carousel.slide1Title',
    subtitleKey: 'home.carousel.slide1Subtitle'
  },
  {
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1920&q=80',
    titleKey: 'home.carousel.slide2Title',
    subtitleKey: 'home.carousel.slide2Subtitle'
  },
  {
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1920&q=80',
    titleKey: 'home.carousel.slide3Title',
    subtitleKey: 'home.carousel.slide3Subtitle'
  },
  {
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1920&q=80',
    titleKey: 'home.carousel.slide4Title',
    subtitleKey: 'home.carousel.slide4Subtitle'
  }
];

const AUTOPLAY_INTERVAL = 6000;
const SWIPE_THRESHOLD = 50;

const HomePage = () => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

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

  return (
    <div className="home-page">
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
          ‹
        </button>
        <button className="carousel-arrow carousel-next" onClick={goToNextSlide} aria-label="Next">
          ›
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
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h3>{t('home.localProducts')}</h3>
              <p>{t('home.localProductsDesc')}</p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3>{t('home.qualityGuaranteed')}</h3>
              <p>{t('home.qualityGuaranteedDesc')}</p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" rx="2" />
                  <polyline points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <h3>{t('home.fastShipping')}</h3>
              <p>{t('home.fastShippingDesc')}</p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                </svg>
              </div>
              <h3>{t('home.sustainable')}</h3>
              <p>{t('home.sustainableDesc')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
