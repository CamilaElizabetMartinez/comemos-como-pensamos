import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { ListSkeleton } from '../components/common/Skeleton';
import { IconX, IconHeart } from '../components/common/Icons';
import './FavoritesPage.css';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/favorites');
      setFavorites(response.data.data.favorites);
    } catch (error) {
      toast.error(t('favorites.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRemoveFavorite = async (productId) => {
    try {
      await api.delete(`/favorites/${productId}`);
      setFavorites((prevFavorites) => 
        prevFavorites.filter((product) => product._id !== productId)
      );
      toast.success(t('favorites.removed'));
    } catch (error) {
      toast.error(t('favorites.errorRemoving'));
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success(t('products.addedToCart'));
  };

  const getProductName = (product) => {
    const currentLang = i18n.language;
    return product.name?.[currentLang] || product.name?.es || product.name;
  };

  const getProductImage = (product) => {
    return product.images?.[0] || '/placeholder-product.jpg';
  };

  if (loading) {
    return (
      <div className="favorites-page">
        <div className="favorites-container">
          <h1>{t('favorites.title')}</h1>
          <ListSkeleton type="product" count={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <div className="favorites-container">
        <h1>{t('favorites.title')}</h1>

        {favorites.length === 0 ? (
          <div className="no-favorites">
            <div className="no-favorites-icon">
              <IconHeart size={50} />
            </div>
            <h2>{t('favorites.empty')}</h2>
            <p>{t('favorites.emptyDescription')}</p>
            <Link to="/products" className="btn btn-primary">
              {t('favorites.exploreProducts')}
            </Link>
          </div>
        ) : (
          <div className="favorites-grid">
            {favorites.map((product) => (
              <div key={product._id} className="favorite-card">
                <button
                  className="remove-favorite-btn"
                  onClick={() => handleRemoveFavorite(product._id)}
                  title={t('favorites.remove')}
                  aria-label={t('favorites.remove')}
                >
                  <IconX size={14} />
                </button>
                
                <Link to={`/products/${product._id}`} className="favorite-image">
                  <img
                    src={getProductImage(product)}
                    alt={getProductName(product)}
                    loading="lazy"
                  />
                </Link>

                <div className="favorite-info">
                  <Link to={`/products/${product._id}`} className="favorite-name">
                    {getProductName(product)}
                  </Link>
                  
                  {product.producerId && (
                    <p className="favorite-producer">
                      {product.producerId.businessName}
                    </p>
                  )}

                  <div className="favorite-footer">
                    <span className="favorite-price">
                      €{product.price?.toFixed(2)}
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
    </div>
  );
};

export default FavoritesPage;

