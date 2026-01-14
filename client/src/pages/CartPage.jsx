import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import './CartPage.css';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

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
        <h1>{t('cart.title')}</h1>
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item._id} className="cart-item">
                <img src={item.images?.[0]} alt={item.name?.es} />
                <div className="item-info">
                  <h3>{item.name?.es}</h3>
                  <p className="item-price">€{item.price?.toFixed(2)}</p>
                </div>
                <div className="item-quantity">
                  <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="btn-remove"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <h2>Resumen</h2>
            <div className="summary-item">
              <span>{t('cart.subtotal')}</span>
              <span>€{getCartTotal().toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span>{t('cart.shipping')}</span>
              <span>Calculado en checkout</span>
            </div>
            <div className="summary-total">
              <span>{t('cart.total')}</span>
              <span>€{getCartTotal().toFixed(2)}</span>
            </div>
            <button onClick={handleCheckout} className="btn btn-primary btn-block">
              {t('cart.checkout')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
