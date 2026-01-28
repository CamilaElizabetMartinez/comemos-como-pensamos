import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import './CheckoutPage.css';

const PAYMENT_METHODS = [
  { id: 'card', icon: '💳', available: true },
  { id: 'bank_transfer', icon: '🏦', available: true },
  { id: 'cash_on_delivery', icon: '💵', available: true }
];

const COUNTRIES = [
  { code: 'ES', name: 'España' },
  { code: 'PT', name: 'Portugal' },
  { code: 'FR', name: 'Francia' },
  { code: 'IT', name: 'Italia' },
  { code: 'DE', name: 'Alemania' },
  { code: 'BE', name: 'Bélgica' },
  { code: 'NL', name: 'Países Bajos' },
  { code: 'AT', name: 'Austria' },
  { code: 'CH', name: 'Suiza' }
];

const PROVINCES_BY_COUNTRY = {
  ES: [
    'A Coruña', 'Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias', 'Ávila',
    'Badajoz', 'Barcelona', 'Burgos', 'Cáceres', 'Cádiz', 'Cantabria', 'Castellón',
    'Ciudad Real', 'Córdoba', 'Cuenca', 'Girona', 'Granada', 'Guadalajara', 'Guipúzcoa',
    'Huelva', 'Huesca', 'Illes Balears', 'Jaén', 'La Rioja', 'Las Palmas', 'León',
    'Lleida', 'Lugo', 'Madrid', 'Málaga', 'Murcia', 'Navarra', 'Ourense', 'Palencia',
    'Pontevedra', 'Salamanca', 'Santa Cruz de Tenerife', 'Segovia', 'Sevilla', 'Soria',
    'Tarragona', 'Teruel', 'Toledo', 'Valencia', 'Valladolid', 'Vizcaya', 'Zamora', 'Zaragoza'
  ],
  PT: [
    'Aveiro', 'Beja', 'Braga', 'Bragança', 'Castelo Branco', 'Coimbra', 'Évora',
    'Faro', 'Guarda', 'Leiria', 'Lisboa', 'Portalegre', 'Porto', 'Santarém',
    'Setúbal', 'Viana do Castelo', 'Vila Real', 'Viseu', 'Açores', 'Madeira'
  ],
  FR: [
    'Île-de-France', 'Provence-Alpes-Côte d\'Azur', 'Occitanie', 'Nouvelle-Aquitaine',
    'Auvergne-Rhône-Alpes', 'Hauts-de-France', 'Grand Est', 'Bretagne', 'Normandie',
    'Pays de la Loire', 'Centre-Val de Loire', 'Bourgogne-Franche-Comté', 'Corse'
  ],
  IT: [
    'Lombardia', 'Lazio', 'Campania', 'Sicilia', 'Veneto', 'Emilia-Romagna',
    'Piemonte', 'Puglia', 'Toscana', 'Calabria', 'Sardegna', 'Liguria',
    'Marche', 'Abruzzo', 'Friuli-Venezia Giulia', 'Trentino-Alto Adige',
    'Umbria', 'Basilicata', 'Molise', 'Valle d\'Aosta'
  ],
  DE: [
    'Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg',
    'Hessen', 'Mecklenburg-Vorpommern', 'Niedersachsen', 'Nordrhein-Westfalen',
    'Rheinland-Pfalz', 'Saarland', 'Sachsen', 'Sachsen-Anhalt', 'Schleswig-Holstein', 'Thüringen'
  ],
  BE: ['Bruxelles', 'Flandre', 'Wallonie'],
  NL: ['Noord-Holland', 'Zuid-Holland', 'Noord-Brabant', 'Gelderland', 'Utrecht', 'Limburg', 'Overijssel', 'Flevoland', 'Groningen', 'Friesland', 'Drenthe', 'Zeeland'],
  AT: ['Wien', 'Niederösterreich', 'Oberösterreich', 'Steiermark', 'Tirol', 'Kärnten', 'Salzburg', 'Vorarlberg', 'Burgenland'],
  CH: ['Zürich', 'Bern', 'Luzern', 'Uri', 'Schwyz', 'Genève', 'Vaud', 'Valais', 'Neuchâtel', 'Fribourg', 'Basel', 'Ticino']
};

const CheckoutPage = () => {
  const { cartItems, getCartTotal, clearCart, validateCartStock, stockIssues } = useCart();
  const { user, updateUser, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [validatingStock, setValidatingStock] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');

  const [shippingAddress, setShippingAddress] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    street: user?.address?.street || '',
    addressLine2: user?.address?.addressLine2 || '',
    city: user?.address?.city || '',
    province: user?.address?.province || '',
    postalCode: user?.address?.postalCode || '',
    country: user?.address?.country || 'ES',
    phone: user?.phone || ''
  });

  const shippingCost = 5.00;

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    const checkStock = async () => {
      setValidatingStock(true);
      await validateCartStock();
      setValidatingStock(false);
    };
    
    if (cartItems.length > 0) {
      checkStock();
    } else {
      setValidatingStock(false);
    }
  }, [cartItems.length, validateCartStock]);

  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim()) return;
    
    setValidatingCoupon(true);
    setCouponError('');
    
    try {
      const response = await api.post('/coupons/validate', {
        code: couponCode.trim(),
        subtotal: getCartTotal()
      });
      
      if (response.data.success) {
        setAppliedCoupon(response.data.data.coupon);
        setCouponDiscount(response.data.data.discount);
        toast.success(t('checkout.couponApplied'));
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || t('checkout.couponInvalid');
      setCouponError(errorMessage);
      setAppliedCoupon(null);
      setCouponDiscount(0);
    } finally {
      setValidatingCoupon(false);
    }
  }, [couponCode, getCartTotal, t]);

  const handleRemoveCoupon = useCallback(() => {
    setCouponCode('');
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponError('');
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (cartItems.length === 0) {
      toast.error(t('checkout.emptyCart'));
      return;
    }

    if (stockIssues.length > 0) {
      toast.error(t('checkout.stockIssues'));
      return;
    }

    setLoading(true);

    try {
      const stockValidation = await validateCartStock();
      if (!stockValidation.valid) {
        toast.error(t('checkout.stockChanged'));
        setLoading(false);
        return;
      }

      const items = cartItems.map(item => ({
        productId: item._id,
        variantId: item.variantId || null,
        quantity: item.quantity
      }));

      const response = await api.post('/orders', {
        items,
        shippingAddress,
        shippingCost,
        paymentMethod,
        couponCode: appliedCoupon?.code || null
      });

      if (response.data.success) {
        const order = response.data.data.order;

        if (paymentMethod === 'card') {
          const stripeResponse = await api.post('/stripe/create-checkout-session', {
            orderId: order._id
          });

          if (stripeResponse.data.success && stripeResponse.data.data.url) {
            window.location.href = stripeResponse.data.data.url;
            return;
          } else {
            toast.error(t('checkout.stripeError'));
          }
        } else {
          clearCart();
          navigate('/order-confirmation', {
            state: {
              order: order,
              bankDetails: response.data.data.bankDetails,
              paymentMethod
            }
          });
        }
      }
    } catch (error) {
      console.error('Error creating order:', error);
      
      if (error.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        toast.error(t('checkout.emailNotVerified'), {
          autoClose: 8000
        });
      } else {
        const errorMessage = error.response?.data?.message || t('checkout.error');
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="empty-cart-message">
            <span className="empty-icon">🛒</span>
            <h2>{t('cart.empty')}</h2>
            <button onClick={() => navigate('/products')} className="btn btn-primary">
              {t('cart.continueShopping')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleResendVerification = async () => {
    try {
      await api.post('/email/send-verification');
      toast.success(t('checkout.verificationEmailSent'));
    } catch (error) {
      if (error.response?.data?.message === 'El email ya está verificado') {
        toast.success(t('checkout.emailAlreadyVerified'));
        updateUser({ ...user, isEmailVerified: true });
      } else {
        toast.error(t('checkout.verificationEmailError'));
      }
    }
  };

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>{t('checkout.title')}</h1>
        
        {user && !user.isEmailVerified && (
          <div className="email-verification-banner">
            <div className="banner-content">
              <span className="banner-icon">⚠️</span>
              <div className="banner-text">
                <strong>{t('checkout.emailNotVerifiedTitle')}</strong>
                <p>{t('checkout.emailNotVerifiedDesc')}</p>
              </div>
            </div>
            <button 
              type="button" 
              className="btn btn-resend" 
              onClick={handleResendVerification}
            >
              {t('checkout.resendVerification')}
            </button>
          </div>
        )}
        
        <div className="checkout-content">
          <form onSubmit={handleSubmit} className="checkout-form">
            {/* Shipping Address */}
            <section className="form-section">
              <h2>📍 {t('checkout.shippingAddress')}</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">{t('auth.firstName')}</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={shippingAddress.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">{t('auth.lastName')}</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={shippingAddress.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="street">{t('checkout.addressLine1')}</label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  value={shippingAddress.street}
                  onChange={handleInputChange}
                  placeholder={t('checkout.addressLine1Placeholder')}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="addressLine2">{t('checkout.addressLine2')}</label>
                <input
                  type="text"
                  id="addressLine2"
                  name="addressLine2"
                  value={shippingAddress.addressLine2}
                  onChange={handleInputChange}
                  placeholder={t('checkout.addressLine2Placeholder')}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="postalCode">{t('profile.postalCode')}</label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={shippingAddress.postalCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="city">{t('profile.city')}</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="province">{t('checkout.province')}</label>
                  <select
                    id="province"
                    name="province"
                    value={shippingAddress.province}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">{t('checkout.selectProvince')}</option>
                    {(PROVINCES_BY_COUNTRY[shippingAddress.country] || []).map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="country">{t('profile.country')}</label>
                  <select
                    id="country"
                    name="country"
                    value={shippingAddress.country}
                    onChange={(e) => {
                      handleInputChange(e);
                      setShippingAddress(prev => ({ ...prev, province: '' }));
                    }}
                    required
                  >
                    {COUNTRIES.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone">{t('profile.phone')}</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={shippingAddress.phone}
                  onChange={handleInputChange}
                  placeholder={t('checkout.phonePlaceholder')}
                  required
                />
              </div>
            </section>

            {/* Payment Method */}
            <section className="form-section">
              <h2>💰 {t('checkout.paymentMethod')}</h2>
              
              <div className="payment-methods">
                {PAYMENT_METHODS.map((method) => (
                  <div
                    key={method.id}
                    className={`payment-option ${paymentMethod === method.id ? 'selected' : ''} ${!method.available ? 'disabled' : ''}`}
                    onClick={() => method.available && setPaymentMethod(method.id)}
                  >
                    <div className="payment-option-header">
                      <span className="payment-icon">{method.icon}</span>
                      <span className="payment-name">{t(`checkout.payment_${method.id}`)}</span>
                      {!method.available && (
                        <span className="coming-soon">{t('checkout.comingSoon')}</span>
                      )}
                    </div>
                    <p className="payment-description">
                      {t(`checkout.payment_${method.id}_desc`)}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <button 
              type="submit" 
              className="btn btn-primary btn-checkout" 
              disabled={loading || validatingStock || stockIssues.length > 0}
            >
              {loading ? t('common.loading') : 
               validatingStock ? t('checkout.validatingStock') :
               stockIssues.length > 0 ? t('checkout.fixStockIssues') :
               t('checkout.placeOrder')}
            </button>
          </form>

          {/* Order Summary */}
          <div className="order-summary">
            <h2>{t('checkout.orderSummary')}</h2>
            
            {stockIssues.length > 0 && (
              <div className="stock-warning-banner">
                <span className="warning-icon">⚠️</span>
                <div className="warning-content">
                  <strong>{t('checkout.stockProblems')}</strong>
                  <ul>
                    {stockIssues.map((issue, index) => (
                      <li key={index}>
                        {issue.productName}: {issue.message}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {validatingStock && (
              <div className="validating-stock">
                <span className="spinner">⏳</span> {t('checkout.validatingStock')}
              </div>
            )}
            
            <div className="summary-items">
              {cartItems.map((item) => {
                const itemKey = item.variantId ? `${item._id}_${item.variantId}` : item._id;
                const hasStockIssue = stockIssues.some(issue => 
                  issue.productId === item._id && 
                  (!item.variantId || issue.variantId === item.variantId)
                );
                return (
                  <div key={itemKey} className={`summary-item ${hasStockIssue ? 'stock-issue' : ''}`}>
                    <div className="item-image">
                      {item.images?.[0] ? (
                        <img src={item.images[0]} alt={item.name?.es} />
                      ) : (
                        <span>📦</span>
                      )}
                    </div>
                    <div className="item-details">
                      <span className="item-name">{item.name?.es}</span>
                      {item.variantName && (
                        <span className="item-variant">{item.variantName}</span>
                      )}
                      <span className="item-qty">x{item.quantity}</span>
                      {hasStockIssue && <span className="stock-issue-badge">⚠️</span>}
                    </div>
                    <span className="item-price">€{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>

            <div className="coupon-section">
              <h3>{t('checkout.couponCode')}</h3>
              {appliedCoupon ? (
                <div className="applied-coupon">
                  <div className="coupon-info">
                    <span className="coupon-badge">🎟️ {appliedCoupon.code}</span>
                    <span className="coupon-discount">
                      -{appliedCoupon.discountType === 'percentage' 
                        ? `${appliedCoupon.discountValue}%` 
                        : `€${appliedCoupon.discountValue}`}
                    </span>
                  </div>
                  <button 
                    type="button" 
                    className="btn-remove-coupon"
                    onClick={handleRemoveCoupon}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="coupon-input-wrapper">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponError('');
                    }}
                    placeholder={t('checkout.couponPlaceholder')}
                    className={couponError ? 'error' : ''}
                  />
                  <button
                    type="button"
                    className="btn-apply-coupon"
                    onClick={handleApplyCoupon}
                    disabled={validatingCoupon || !couponCode.trim()}
                  >
                    {validatingCoupon ? '...' : t('checkout.applyCoupon')}
                  </button>
                </div>
              )}
              {couponError && <p className="coupon-error">{couponError}</p>}
            </div>

            <div className="summary-totals">
              <div className="summary-row">
                <span>{t('cart.subtotal')}</span>
                <span>€{getCartTotal().toFixed(2)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="summary-row discount">
                  <span>{t('checkout.discount')}</span>
                  <span>-€{couponDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-row">
                <span>{t('cart.shipping')}</span>
                <span>€{shippingCost.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>{t('cart.total')}</span>
                <span>€{(getCartTotal() + shippingCost - couponDiscount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
