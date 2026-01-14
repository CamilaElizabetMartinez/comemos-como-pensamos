import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import ProductReviews from '../components/reviews/ProductReviews';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { t, i18n } = useTranslation();

  const fetchProduct = useCallback(async () => {
    try {
      const data = await productService.getProductById(id);
      setProduct(data.data.product);
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

  useEffect(() => {
    fetchProduct();
    checkFavorite();
  }, [fetchProduct, checkFavorite]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(t('products.addedToCart'));
  };

  const handleToggleFavorite = async () => {
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
  };

  const getLocalizedText = (textObject) => {
    if (!textObject) return '';
    const currentLang = i18n.language;
    return textObject[currentLang] || textObject.es || textObject;
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="loading">{t('common.loading')}</div>
        </div>
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

  return (
    <div className="product-detail-page">
      <div className="container">
        <Link to="/products" className="back-link">
          ← {t('products.backToProducts')}
        </Link>

        <div className="product-detail">
          <div className="product-gallery">
            <div className="main-image">
              {product.images?.length > 0 ? (
                <img
                  src={product.images[selectedImage]}
                  alt={getLocalizedText(product.name)}
                />
              ) : (
                <div className="no-image">📦</div>
              )}
              <button
                className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                onClick={handleToggleFavorite}
                title={isFavorite ? t('favorites.remove') : t('favorites.add')}
              >
                {isFavorite ? '❤️' : '🤍'}
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
            <div className="product-header">
              <h1>{getLocalizedText(product.name)}</h1>
              {product.producerId && (
                <Link
                  to={`/producers/${product.producerId._id || product.producerId}`}
                  className="producer-link"
                >
                  {product.producerId.businessName || t('products.viewProducer')}
                </Link>
              )}
            </div>

            <div className="product-price">
              <span className="price">€{product.price?.toFixed(2)}</span>
              <span className="unit">/ {product.unit || 'ud'}</span>
            </div>

            <p className="product-description">{getLocalizedText(product.description)}</p>

            <div className="product-meta">
              <div className="meta-item">
                <span className="meta-label">{t('products.stock')}:</span>
                <span className={`meta-value ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                  {product.stock > 0 ? `${product.stock} ${t('products.units')}` : t('products.outOfStock')}
                </span>
              </div>
              {product.category && (
                <div className="meta-item">
                  <span className="meta-label">{t('products.category')}:</span>
                  <span className="meta-value">{t(`categories.${product.category}`)}</span>
                </div>
              )}
            </div>

            {product.isAvailable && product.stock > 0 ? (
              <div className="add-to-cart-section">
                <div className="quantity-selector">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="quantity-value">{quantity}</span>
                  <button
                    onClick={() => setQuantity((prev) => Math.min(product.stock, prev + 1))}
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
                <button onClick={handleAddToCart} className="btn btn-primary btn-add-cart">
                  {t('products.addToCart')} - €{(product.price * quantity).toFixed(2)}
                </button>
              </div>
            ) : (
              <button className="btn btn-disabled" disabled>
                {t('products.outOfStock')}
              </button>
            )}
          </div>
        </div>

        <ProductReviews productId={id} />
      </div>
    </div>
  );
};

export default ProductDetailPage;
