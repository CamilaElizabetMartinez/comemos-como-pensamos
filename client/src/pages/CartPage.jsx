import React, { useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { IconPackage, IconX } from '../components/common/Icons';
import './CartPage.css';

const CartPage = () => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    getCartTotal,
    getItemsGroupedByProducer 
  } = useCart();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleCheckout = useCallback(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  }, [isAuthenticated, navigate]);

  const handleDecreaseQuantity = useCallback((itemId, currentQuantity, variantId) => {
    updateQuantity(itemId, currentQuantity - 1, variantId);
  }, [updateQuantity]);

  const handleIncreaseQuantity = useCallback((itemId, currentQuantity, variantId) => {
    updateQuantity(itemId, currentQuantity + 1, variantId);
  }, [updateQuantity]);

  const handleRemoveItem = useCallback((itemId, variantId) => {
    removeFromCart(itemId, variantId);
  }, [removeFromCart]);

  const getItemKey = useCallback((item) => {
    return item.variantId ? `${item._id}_${item.variantId}` : item._id;
  }, []);

  const totalItemsCount = useMemo(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  const producerGroupsCount = useMemo(() => {
    return getItemsGroupedByProducer.length;
  }, [getItemsGroupedByProducer]);

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <h1>{t('cart.title')}</h1>
          <div className="empty-cart">
            <p>{t('cart.empty')}</p>
            <Link to="/products" className="btn btn-primary">
              {t('cart.continueShopping')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1>{t('cart.title')}</h1>
          <span className="cart-count">
            {t('cart.items', { count: totalItemsCount })}
            {producerGroupsCount > 1 && (
              <span className="producer-count">
                {' · '}{producerGroupsCount} {t('cart.producers')}
              </span>
            )}
          </span>
        </div>

        <div className="cart-content">
          <div className="cart-items-grouped">
            {getItemsGroupedByProducer.map((producerGroup) => (
              <div key={producerGroup.producerId} className="producer-group">
                <div className="producer-group-header">
                  <div className="producer-info-header">
                    {producerGroup.producerLogo ? (
                      <img 
                        src={producerGroup.producerLogo} 
                        alt={producerGroup.producerName}
                        className="producer-logo-small"
                      />
                    ) : (
                      <div className="producer-logo-placeholder">
                        {producerGroup.producerName?.charAt(0)}
                      </div>
                    )}
                    <div className="producer-details">
                      <h3 className="producer-name">{producerGroup.producerName}</h3>
                      {producerGroup.producerLocation && (
                        <span className="producer-location-small">
                          {producerGroup.producerLocation}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="producer-subtotal">
                    <span className="subtotal-label">{t('cart.subtotal')}</span>
                    <span className="subtotal-value">€{producerGroup.subtotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="producer-items">
                  {producerGroup.items.map((item) => (
                    <div key={getItemKey(item)} className="cart-item">
                      <img 
                        src={item.images?.[0]} 
                        alt={item.name?.es}
                        className="item-image"
                        loading="lazy"
                      />
                      <div className="item-info">
                        <h4>{item.name?.es}</h4>
                        {item.variantName && (
                          <span className="item-variant">{item.variantName}</span>
                        )}
                        <p className="item-unit-price">
                          €{item.price?.toFixed(2)}
                          {!item.variantId && <span> / {t(`units.${item.unit}`) || item.unit}</span>}
                        </p>
                      </div>
                      <div className="item-quantity">
                        <button 
                          onClick={() => handleDecreaseQuantity(item._id, item.quantity, item.variantId)}
                          aria-label={t('cart.decrease')}
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button 
                          onClick={() => handleIncreaseQuantity(item._id, item.quantity, item.variantId)}
                          aria-label={t('cart.increase')}
                        >
                          +
                        </button>
                      </div>
                      <div className="item-total">
                        €{(item.price * item.quantity).toFixed(2)}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item._id, item.variantId)}
                        className="btn-remove"
                        aria-label={t('cart.remove')}
                      >
                        <IconX size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="producer-shipping-hint">
                  <span className="shipping-icon"><IconPackage size={16} /></span>
                  <span>{t('cart.shippingCalculatedAtCheckout')}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>{t('cart.summary')}</h2>
            
            <div className="summary-by-producer">
              {getItemsGroupedByProducer.map((producerGroup) => (
                <div key={producerGroup.producerId} className="summary-producer-row">
                  <span className="summary-producer-name">{producerGroup.producerName}</span>
                  <span className="summary-producer-total">€{producerGroup.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="summary-divider" />

            <div className="summary-item">
              <span>{t('cart.productsTotal')}</span>
              <span>€{getCartTotal().toFixed(2)}</span>
            </div>
            <div className="summary-item summary-shipping">
              <span>{t('cart.shipping')}</span>
              <span className="shipping-note">{t('cart.calculatedAtCheckout')}</span>
            </div>

            <div className="summary-total">
              <span>{t('cart.total')}</span>
              <span>€{getCartTotal().toFixed(2)}</span>
            </div>

            {producerGroupsCount > 1 && (
              <p className="multi-producer-notice">
                {t('cart.multiProducerNotice', { count: producerGroupsCount })}
              </p>
            )}

            <button type="button" onClick={handleCheckout} className="btn btn-primary btn-block">
              {t('cart.checkout')}
            </button>

            <Link to="/products" className="continue-shopping">
              {t('cart.continueShopping')}
            </Link>

            <div className="trust-badges">
              <div className="trust-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>{t('cart.trustBadges.securePayment', 'Pago seguro')}</span>
              </div>
              <div className="trust-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="3" width="15" height="13" rx="2" />
                  <polyline points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                <span>{t('cart.trustBadges.fastShipping', 'Envío 24-48h')}</span>
              </div>
              <div className="trust-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
                <span>{t('cart.trustBadges.guarantee', 'Garantía de calidad')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
