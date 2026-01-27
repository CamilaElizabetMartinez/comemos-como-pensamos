import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { PageSpinner } from '../components/common/Spinner';
import './ProducerDetailPage.css';

const ProducerDetailPage = () => {
  const { id } = useParams();
  const [producer, setProducer] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();

  const fetchProducer = useCallback(async () => {
    setLoading(true);
    try {
      const [producerRes, reviewsRes] = await Promise.all([
        api.get(`/producers/${id}`),
        api.get(`/reviews/producer/${id}`)
      ]);
      setProducer(producerRes.data.data.producer);
      setProducts(producerRes.data.data.products || []);
      setReviews(reviewsRes.data.data?.reviews || []);
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

  const handleWhatsAppContact = useCallback(() => {
    const whatsappNumber = producer?.whatsapp || producer?.userId?.phone;
    if (!whatsappNumber) return;
    
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    const message = encodeURIComponent(
      t('whatsapp.producerMessage', { businessName: producer.businessName })
    );
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  }, [producer, t]);

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
          <PageSpinner text={t('common.loading')} />
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
          {t('producerDetail.backToProducers')}
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

        {reviews.length > 0 && (
          <div className="producer-reviews-section">
            <h2>⭐ {t('producerDetail.reviews')} ({reviews.length})</h2>
            <div className="reviews-summary">
              <div className="average-rating">
                <span className="rating-number">
                  {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                </span>
                <span className="rating-stars">
                  {'★'.repeat(Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length))}
                  {'☆'.repeat(5 - Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length))}
                </span>
              </div>
            </div>
            <div className="reviews-list">
              {reviews.slice(0, 5).map((review) => (
                <div key={review._id} className="review-card">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <span className="reviewer-name">
                        {review.userId?.firstName || t('reviews.anonymous')}
                      </span>
                      <span className="review-date">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="review-rating">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                  </div>
                  {review.productId && (
                    <Link to={`/products/${review.productId._id}`} className="review-product">
                      📦 {review.productId.name?.es || review.productId.name}
                    </Link>
                  )}
                  {review.comment && (
                    <p className="review-comment">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
            {reviews.length > 5 && (
              <p className="more-reviews">{t('producerDetail.andMoreReviews', { count: reviews.length - 5 })}</p>
            )}
          </div>
        )}

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
              {(producer.whatsapp || producer.userId?.phone) && (
                <button className="btn-whatsapp-contact" onClick={handleWhatsAppContact}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  {t('whatsapp.contactProducer')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProducerDetailPage;

