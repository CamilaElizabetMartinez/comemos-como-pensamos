import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import './OrderConfirmationPage.css';

const COUNTRY_NAMES = {
  ES: 'España',
  PT: 'Portugal',
  FR: 'Francia',
  IT: 'Italia',
  DE: 'Alemania',
  BE: 'Bélgica',
  NL: 'Países Bajos',
  AT: 'Austria',
  CH: 'Suiza'
};

const getCountryName = (code) => COUNTRY_NAMES[code] || code;

const OrderConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { clearCart } = useCart();
  const [searchParams] = useSearchParams();
  
  const sessionId = searchParams.get('session_id');
  const orderIdFromUrl = searchParams.get('order_id');
  
  const [loading, setLoading] = useState(!!(sessionId && orderIdFromUrl));
  const [stripeOrder, setStripeOrder] = useState(null);
  const hasVerified = useRef(false);

  const { order: stateOrder, bankDetails, paymentMethod: statePaymentMethod } = location.state || {};

  useEffect(() => {
    if (!sessionId || !orderIdFromUrl) {
      setLoading(false);
      return;
    }
    
    if (hasVerified.current) {
      return;
    }
    
    hasVerified.current = true;
    
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${orderIdFromUrl}`);
        if (response.data.success && response.data.data.order) {
          setStripeOrder(response.data.data.order);
          clearCart();
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      }
      setLoading(false);
    };

    fetchOrder();
  }, [sessionId, orderIdFromUrl, clearCart]);

  const order = stripeOrder || stateOrder;
  const paymentMethod = stripeOrder ? 'card' : statePaymentMethod;

  if (loading) {
    return (
      <div className="order-confirmation">
        <div className="container">
          <div className="loading-payment">
            <span className="spinner">⏳</span>
            <h2>{t('checkout.verifyingPayment')}</h2>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-confirmation">
        <div className="container">
          <div className="no-order">
            <h2>{t('orderConfirmation.noOrder')}</h2>
            <button type="button" onClick={() => navigate('/products')} className="btn btn-primary">
              {t('cart.continueShopping')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-confirmation">
      <div className="container">
        <div className="confirmation-card">
          <div className="success-header">
            <div className="success-checkmark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1>{t('orderConfirmation.title')}</h1>
            <p className="order-number">
              {t('orderConfirmation.orderNumber')}: <strong>{order.orderNumber}</strong>
            </p>
          </div>

          <div className="order-summary-mini">
            <h3>{t('checkout.orderSummary')}</h3>
            <div className="summary-items">
              {order.items?.map((item, index) => (
                <div key={index} className="summary-item">
                  <span>{item.productName} x{item.quantity}</span>
                  <span>€{(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="summary-item shipping">
                <span>{t('cart.shipping')}</span>
                <span>€{order.shippingCost?.toFixed(2)}</span>
              </div>
              <div className="summary-item total">
                <span>{t('cart.total')}</span>
                <span>€{order.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {paymentMethod === 'bank_transfer' && bankDetails && (
            <div className="payment-instructions bank-transfer">
              <h2>{t('orderConfirmation.bankTransferTitle')}</h2>
              <p className="instructions-text">
                {t('orderConfirmation.bankTransferInstructions')}
              </p>
              
              <div className="bank-details">
                <div className="detail-row">
                  <span className="label">{t('orderConfirmation.bankName')}:</span>
                  <span className="value">{bankDetails.bankName}</span>
                </div>
                <div className="detail-row">
                  <span className="label">{t('orderConfirmation.accountHolder')}:</span>
                  <span className="value">{bankDetails.accountHolder}</span>
                </div>
                <div className="detail-row highlight">
                  <span className="label">IBAN:</span>
                  <span className="value iban">{bankDetails.iban}</span>
                </div>
                <div className="detail-row">
                  <span className="label">BIC/SWIFT:</span>
                  <span className="value">{bankDetails.bic}</span>
                </div>
                <div className="detail-row highlight">
                  <span className="label">{t('orderConfirmation.reference')}:</span>
                  <span className="value reference">{bankDetails.reference}</span>
                </div>
                <div className="detail-row">
                  <span className="label">{t('orderConfirmation.amount')}:</span>
                  <span className="value amount">€{order.total?.toFixed(2)}</span>
                </div>
              </div>

              <div className="important-notice">
                <p>{t('orderConfirmation.includeReference')}</p>
              </div>
            </div>
          )}

          {paymentMethod === 'cash_on_delivery' && (
            <div className="payment-instructions cash-delivery">
              <h2>{t('orderConfirmation.cashOnDeliveryTitle')}</h2>
              <p className="instructions-text">
                {t('orderConfirmation.cashOnDeliveryInstructions')}
              </p>
              
              <div className="amount-to-pay">
                <span className="label">{t('orderConfirmation.amountToPay')}</span>
                <span className="value">€{order.total?.toFixed(2)}</span>
              </div>

              <div className="delivery-note">
                <p>{t('orderConfirmation.prepareExactAmount')}</p>
              </div>
            </div>
          )}

          {paymentMethod === 'card' && (
            <div className="payment-instructions card-payment">
              <h2>{t('orderConfirmation.cardPaymentTitle')}</h2>
              <p className="instructions-text">
                {t('orderConfirmation.cardPaymentSuccess')}
              </p>
            </div>
          )}

          <div className="shipping-info">
            <h3>{t('checkout.shippingAddress')}</h3>
            <p>
              {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}<br />
              {order.shippingAddress?.street}<br />
              {order.shippingAddress?.postalCode} {order.shippingAddress?.city}<br />
              {getCountryName(order.shippingAddress?.country)}<br />
              {order.shippingAddress?.phone}
            </p>
          </div>

          <div className="confirmation-actions">
            <Link to={`/orders/${order._id}`} className="btn btn-secondary">
              {t('orderConfirmation.viewOrder')}
            </Link>
            <Link to="/products" className="btn btn-primary">
              {t('cart.continueShopping')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;

