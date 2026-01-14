import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import './ProducerDetailPage.css';

const ProducerDetailPage = () => {
  const { id } = useParams();
  const [producer, setProducer] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();

  const fetchProducer = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/producers/${id}`);
      setProducer(response.data.data.producer);
      setProducts(response.data.data.products || []);
    } catch (error) {
      toast.error(t('producerDetail.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    fetchProducer();
  }, [fetchProducer]);

  const getDescription = (item) => {
    const currentLang = i18n.language;
    return item?.description?.[currentLang] || item?.description?.es || item?.description || '';
  };

  const getProductName = (product) => {
    const currentLang = i18n.language;
    return product.name?.[currentLang] || product.name?.es || product.name;
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success(t('products.addedToCart'));
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="star filled">★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star">★</span>);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="producer-detail-page">
        <div className="producer-detail-container">
          <div className="loading-spinner">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  if (!producer) {
    return (
      <div className="producer-detail-page">
        <div className="producer-detail-container">
          <div className="producer-not-found">
            <h2>{t('producerDetail.notFound')}</h2>
            <Link to="/producers" className="btn btn-primary">
              {t('producerDetail.backToProducers')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="producer-detail-page">
      <div className="producer-detail-container">
        <Link to="/producers" className="back-link">
          ← {t('producerDetail.backToProducers')}
        </Link>

        <div className="producer-hero">
          <div className="producer-hero-logo">
            {producer.logo ? (
              <img src={producer.logo} alt={producer.businessName} />
            ) : (
              <div className="hero-logo-placeholder">
                {producer.businessName?.charAt(0)}
              </div>
            )}
          </div>
          <div className="producer-hero-info">
            <h1>{producer.businessName}</h1>
            
            {producer.location && (
              <p className="hero-location">
                📍 {producer.location.street && `${producer.location.street}, `}
                {producer.location.city}, {producer.location.region}
                {producer.location.country && `, ${producer.location.country}`}
              </p>
            )}

            <div className="hero-rating">
              {renderStars(producer.rating)}
              <span className="rating-value">
                {producer.rating?.toFixed(1) || '0.0'}
              </span>
              <span className="review-count">
                ({producer.totalReviews || 0} {t('products.reviews')})
              </span>
            </div>

            {producer.certifications && producer.certifications.length > 0 && (
              <div className="hero-certifications">
                {producer.certifications.map((cert, index) => (
                  <span key={index} className="certification-badge">
                    ✓ {cert}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {getDescription(producer) && (
          <div className="producer-about">
            <h2>{t('producerDetail.about')}</h2>
            <p>{getDescription(producer)}</p>
          </div>
        )}

        <div className="producer-products-section">
          <h2>{t('producerDetail.products')} ({products.length})</h2>
          
          {products.length === 0 ? (
            <div className="no-products">
              <p>{t('producerDetail.noProducts')}</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <div key={product._id} className="product-card">
                  <Link to={`/products/${product._id}`} className="product-image">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={getProductName(product)} />
                    ) : (
                      <div className="image-placeholder">📦</div>
                    )}
                  </Link>
                  <div className="product-info">
                    <Link to={`/products/${product._id}`} className="product-name">
                      {getProductName(product)}
                    </Link>
                    <div className="product-footer">
                      <span className="product-price">
                        €{product.price?.toFixed(2)}
                        <span className="price-unit">/{product.unit || 'ud'}</span>
                      </span>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                      >
                        {product.stock === 0 
                          ? t('products.outOfStock') 
                          : t('products.addToCart')
                        }
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {producer.userId && (
          <div className="producer-contact">
            <h2>{t('producerDetail.contact')}</h2>
            <div className="contact-info">
              {producer.userId.firstName && (
                <p>
                  <strong>{t('producerDetail.contactPerson')}:</strong>{' '}
                  {producer.userId.firstName} {producer.userId.lastName}
                </p>
              )}
              {producer.userId.email && (
                <p>
                  <strong>{t('auth.email')}:</strong>{' '}
                  <a href={`mailto:${producer.userId.email}`}>{producer.userId.email}</a>
                </p>
              )}
              {producer.userId.phone && (
                <p>
                  <strong>{t('profile.phone')}:</strong>{' '}
                  <a href={`tel:${producer.userId.phone}`}>{producer.userId.phone}</a>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProducerDetailPage;

