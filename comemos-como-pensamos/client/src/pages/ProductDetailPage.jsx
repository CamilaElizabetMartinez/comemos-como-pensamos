import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import ProductReviews from '../components/reviews/ProductReviews';
import { ProductDetailSkeleton } from '../components/common/Skeleton';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [reviewStats, setReviewStats] = useState({ average: 0, count: 0 });
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { t, i18n } = useTranslation();

  const getLocalizedText = useCallback((textObject) => {
    if (!textObject) return '';
    const currentLang = i18n.language;
    return textObject[currentLang] || textObject.es || textObject;
  }, [i18n.language]);

  const fetchProduct = useCallback(async () => {
    try {
      const data = await productService.getProductById(id);
      const fetchedProduct = data.data.product;
      setProduct(fetchedProduct);
      
      // Set default variant if product has variants
      if (fetchedProduct.hasVariants && fetchedProduct.variants?.length > 0) {
        const defaultVariant = fetchedProduct.variants.find(variant => variant.isDefault) 
          || fetchedProduct.variants.find(variant => variant.isAvailable)
          || fetchedProduct.variants[0];
        setSelectedVariantId(defaultVariant._id);
      }
    } catch (error) {
      toast.error(t('products.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  const checkFavorite = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await api.get(`/favorites/check/${id}`);
      setIsFavorite(response.data.data.isFavorite);
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  }, [id, isAuthenticated]);

  const fetchReviewStats = useCallback(async () => {
    try {
      const response = await api.get(`/reviews/product/${id}`);
      const reviews = response.data.data.reviews || [];
      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        setReviewStats({
          average: totalRating / reviews.length,
          count: reviews.length
        });
      }
    } catch (error) {
      console.error('Error fetching review stats:', error);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
    checkFavorite();
    fetchReviewStats();
  }, [fetchProduct, checkFavorite, fetchReviewStats]);

  // Reset quantity when variant changes
  useEffect(() => {
    setQuantity(1);
  }, [selectedVariantId]);

  // Get selected variant details
  const selectedVariant = useMemo(() => {
    if (!product?.hasVariants || !selectedVariantId) return null;
    return product.variants?.find(variant => variant._id === selectedVariantId);
  }, [product, selectedVariantId]);

  // Get current price and stock based on variant selection
  const currentPrice = useMemo(() => {
    if (selectedVariant) return selectedVariant.price;
    return product?.price || 0;
  }, [product, selectedVariant]);

  const currentStock = useMemo(() => {
    if (selectedVariant) return selectedVariant.stock;
    return product?.stock || 0;
  }, [product, selectedVariant]);

  const currentCompareAtPrice = useMemo(() => {
    if (selectedVariant) return selectedVariant.compareAtPrice;
    return null;
  }, [selectedVariant]);

  const isCurrentlyAvailable = useMemo(() => {
    if (selectedVariant) return selectedVariant.isAvailable && selectedVariant.stock > 0;
    return product?.isAvailable && product?.stock > 0;
  }, [product, selectedVariant]);

  const handleAddToCart = useCallback(() => {
    const cartProduct = {
      ...product,
      // Override with variant data if applicable
      price: currentPrice,
      stock: currentStock,
      variantId: selectedVariantId,
      variantName: selectedVariant ? getLocalizedText(selectedVariant.name) : null
    };
    
    const result = addToCart(cartProduct, quantity);
    if (result.success === false) {
      toast.error(result.message);
    } else {
      toast.success(t('products.addedToCart'));
    }
  }, [product, currentPrice, currentStock, selectedVariantId, selectedVariant, quantity, addToCart, t, getLocalizedText]);

  const handleToggleFavorite = useCallback(async () => {
    if (!isAuthenticated) {
      toast.info(t('favorites.loginRequired'));
      return;
    }

    try {
      if (isFavorite) {
        await api.delete(`/favorites/${id}`);
        setIsFavorite(false);
        toast.success(t('favorites.removed'));
      } else {
        await api.post(`/favorites/${id}`);
        setIsFavorite(true);
        toast.success(t('favorites.added'));
      }
    } catch (error) {
      toast.error(t('favorites.error'));
    }
  }, [isAuthenticated, isFavorite, id, t]);

  const handleWhatsAppInquiry = useCallback(() => {
    const producer = product?.producerId;
    if (!producer) return;
    
    const whatsappNumber = producer.whatsapp || producer.userId?.phone;
    if (!whatsappNumber) return;
    
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    const productName = getLocalizedText(product.name);
    const variantInfo = selectedVariant ? ` (${getLocalizedText(selectedVariant.name)})` : '';
    const message = encodeURIComponent(
      t('whatsapp.productMessage', { 
        productName: productName + variantInfo, 
        businessName: producer.businessName 
      })
    );
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  }, [product, selectedVariant, t, getLocalizedText]);

  const handleVariantChange = useCallback((variantId) => {
    setSelectedVariantId(variantId);
  }, []);

  const openLightbox = useCallback(() => {
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    document.body.style.overflow = 'unset';
  }, []);

  const handleLightboxPrev = useCallback(() => {
    setSelectedImage(prev => 
      prev === 0 ? (product?.images?.length || 1) - 1 : prev - 1
    );
  }, [product?.images?.length]);

  const handleLightboxNext = useCallback(() => {
    setSelectedImage(prev => 
      prev === (product?.images?.length || 1) - 1 ? 0 : prev + 1
    );
  }, [product?.images?.length]);

  const handleKeyDown = useCallback((event) => {
    if (!lightboxOpen) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') handleLightboxPrev();
    if (event.key === 'ArrowRight') handleLightboxNext();
  }, [lightboxOpen, closeLightbox, handleLightboxPrev, handleLightboxNext]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (loading) {
    return (
      <div className="product-detail-page">
        <ProductDetailSkeleton />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="not-found">
            <h2>{t('products.notFound')}</h2>
            <Link to="/products" className="btn btn-primary">
              {t('products.backToProducts')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let starIndex = 0; starIndex < 5; starIndex++) {
      if (starIndex < fullStars) {
        stars.push(
          <svg key={starIndex} className="star filled" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      } else if (starIndex === fullStars && hasHalfStar) {
        stars.push(
          <svg key={starIndex} className="star half" viewBox="0 0 24 24">
            <defs>
              <linearGradient id="halfGrad">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#ddd" />
              </linearGradient>
            </defs>
            <path fill="url(#halfGrad)" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      } else {
        stars.push(
          <svg key={starIndex} className="star empty" viewBox="0 0 24 24" fill="#ddd">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      }
    }
    return stars;
  };

  const categoryName = product?.category ? t(`categories.${product.category}`) : '';
  const variantWeight = selectedVariant?.weight 
    ? `${selectedVariant.weight}${selectedVariant.weightUnit}` 
    : '';

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumbs */}
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">{t('nav.home')}</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to="/products">{t('nav.products')}</Link>
          {product.category && (
            <>
              <span className="breadcrumb-separator">/</span>
              <Link to={`/products?category=${product.category}`}>{categoryName}</Link>
            </>
          )}
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{getLocalizedText(product.name)}</span>
        </nav>

        <div className="product-detail">
          <div className="product-gallery">
            <div className="main-image-container">
              {product.images?.length > 0 ? (
                <>
                  <img
                    src={product.images[selectedImage]}
                    alt={getLocalizedText(product.name)}
                    className="main-image"
                    onClick={openLightbox}
                  />
                  <button
                    className="zoom-btn"
                    onClick={openLightbox}
                    aria-label={t('products.viewFullscreen')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                      <path d="M11 8v6M8 11h6" />
                    </svg>
                  </button>
                </>
              ) : (
                <div className="no-image">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
              )}
              <button
                className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                onClick={handleToggleFavorite}
                title={isFavorite ? t('favorites.remove') : t('favorites.add')}
              >
                {isFavorite ? (
                  <svg viewBox="0 0 24 24" fill="#e53935" stroke="#e53935" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                )}
              </button>
            </div>
            {product.images?.length > 1 && (
              <div className="thumbnail-list">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={img} alt={`${getLocalizedText(product.name)} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-info">
            {/* Title with weight */}
            <div className="product-header">
              <h1 className="product-title">
                {getLocalizedText(product.name)}
                {variantWeight && <span className="product-weight">{variantWeight}</span>}
              </h1>
            </div>

            {/* Rating summary */}
            {reviewStats.count > 0 && (
              <div className="rating-summary">
                <div className="stars-container">
                  {renderStars(reviewStats.average)}
                </div>
                <span className="rating-text">
                  {reviewStats.average.toFixed(1)} ({reviewStats.count} {reviewStats.count === 1 ? t('reviews.review') : t('reviews.reviews')})
                </span>
              </div>
            )}

            {/* Producer link */}
            {product.producerId && (
              <Link
                to={`/producers/${product.producerId._id || product.producerId}`}
                className="producer-link"
              >
                {product.producerId.businessName || t('products.viewProducer')}
              </Link>
            )}

            {/* Price section */}
            <div className="product-price">
              <div className="price-main">
                {currentCompareAtPrice && currentCompareAtPrice > currentPrice && (
                  <span className="compare-at-price">€{currentCompareAtPrice.toFixed(2)}</span>
                )}
                <span className="price">€{currentPrice.toFixed(2)}</span>
                {!product.hasVariants && product.unit && (
                  <span className="unit">/ {t(`units.${product.unit}`) || product.unit}</span>
                )}
              </div>
              <small className="vat-info">{t('products.vatIncluded')}</small>
            </div>

            {/* Variant Selector */}
            {product.hasVariants && product.variants?.length > 0 && (
              <div className="variant-selector">
                <label>{t('products.selectVariant')}</label>
                <div className="variant-options">
                  {product.variants.map((variant) => {
                    const isSelected = selectedVariantId === variant._id;
                    const isAvailable = variant.isAvailable && variant.stock > 0;
                    
                    return (
                      <button
                        key={variant._id}
                        type="button"
                        className={`variant-option ${isSelected ? 'selected' : ''} ${!isAvailable ? 'unavailable' : ''}`}
                        onClick={() => handleVariantChange(variant._id)}
                        disabled={!isAvailable}
                      >
                        <span className="variant-name">{getLocalizedText(variant.name)}</span>
                        <span className="variant-price">€{variant.price.toFixed(2)}</span>
                        {!isAvailable && (
                          <span className="variant-stock-badge">{t('products.outOfStock')}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock info */}
            <div className="stock-info">
              <span className={`stock-badge ${currentStock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                {currentStock > 0 
                  ? `${t('products.inStock')} (${currentStock} ${t('products.units')})` 
                  : t('products.outOfStock')
                }
              </span>
            </div>

            {/* Add to cart section */}
            {isCurrentlyAvailable ? (
              <div className="add-to-cart-section">
                <div className="quantity-selector">
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    disabled={quantity <= 1}
                    aria-label={t('common.decrease')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(event) => {
                      const newValue = parseInt(event.target.value, 10);
                      if (!isNaN(newValue) && newValue >= 1 && newValue <= currentStock) {
                        setQuantity(newValue);
                      }
                    }}
                    min="1"
                    max={currentStock}
                    aria-label={t('products.quantity')}
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.min(currentStock, prev + 1))}
                    disabled={quantity >= currentStock}
                    aria-label={t('common.increase')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
                <button onClick={handleAddToCart} className="btn-add-cart">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  {t('products.addToCart')} - €{(currentPrice * quantity).toFixed(2)}
                </button>
              </div>
            ) : (
              <button className="btn-out-of-stock" disabled>
                {t('products.outOfStock')}
              </button>
            )}

            {/* WhatsApp inquiry */}
            {(product.producerId?.whatsapp || product.producerId?.userId?.phone) && (
              <button className="btn-whatsapp-inquiry" onClick={handleWhatsAppInquiry}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {t('whatsapp.askAboutProduct')}
              </button>
            )}

            {/* Category tag */}
            {product.category && (
              <div className="product-category-tag">
                <span className="category-label">{t('products.category')}:</span>
                <Link to={`/products?category=${product.category}`} className="category-link">
                  {categoryName}
                </Link>
              </div>
            )}
          </div>
        </div>

        <ProductReviews productId={id} description={getLocalizedText(product.description)} />
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && product?.images?.length > 0 && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(event) => event.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox} aria-label={t('common.close')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            
            <div className="lightbox-image-container">
              {product.images.length > 1 && (
                <button className="lightbox-nav lightbox-prev" onClick={handleLightboxPrev} aria-label={t('common.previous')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
              )}
              
              <img
                src={product.images[selectedImage]}
                alt={getLocalizedText(product.name)}
                className="lightbox-image"
              />
              
              {product.images.length > 1 && (
                <button className="lightbox-nav lightbox-next" onClick={handleLightboxNext} aria-label={t('common.next')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="lightbox-thumbnails">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    className={`lightbox-thumb ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={img} alt={`${getLocalizedText(product.name)} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}

            <div className="lightbox-counter">
              {selectedImage + 1} / {product.images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
