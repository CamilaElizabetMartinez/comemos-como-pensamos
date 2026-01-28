import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import './CheckoutPage.css';

const PAYMENT_METHODS = [
  { id: 'card', available: true },
  { id: 'bank_transfer', available: true },
  { id: 'cash_on_delivery', available: true }
];

const ICONS = {
  location: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  payment: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  card: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  bank: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18"/>
      <path d="M3 10h18"/>
      <path d="M5 6l7-3 7 3"/>
      <path d="M4 10v11"/>
      <path d="M20 10v11"/>
      <path d="M8 14v3"/>
      <path d="M12 14v3"/>
      <path d="M16 14v3"/>
    </svg>
  ),
  cash: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <circle cx="12" cy="12" r="3"/>
      <path d="M2 9h2"/>
      <path d="M20 9h2"/>
      <path d="M2 15h2"/>
      <path d="M20 15h2"/>
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  package: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4l-9-5.19"/>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  ticket: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
      <path d="M13 5v2"/>
      <path d="M13 17v2"/>
      <path d="M13 11v2"/>
    </svg>
  ),
  cart: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  close: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  loader: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spinner-icon">
      <line x1="12" y1="2" x2="12" y2="6"/>
      <line x1="12" y1="18" x2="12" y2="22"/>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
      <line x1="2" y1="12" x2="6" y2="12"/>
      <line x1="18" y1="12" x2="22" y2="12"/>
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
    </svg>
  )
};

const getPaymentIcon = (methodId) => {
  switch (methodId) {
    case 'card': return ICONS.card;
    case 'bank_transfer': return ICONS.bank;
    case 'cash_on_delivery': return ICONS.cash;
    default: return ICONS.payment;
  }
};

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

  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [saveAddress, setSaveAddress] = useState(false);

  const shippingCost = 5.00;

  const POSTAL_CODE_PATTERNS = {
    ES: /^\d{5}$/,
    PT: /^\d{4}-\d{3}$/,
    FR: /^\d{5}$/,
    IT: /^\d{5}$/,
    DE: /^\d{5}$/,
    BE: /^\d{4}$/,
    NL: /^\d{4}\s?[A-Z]{2}$/i,
    AT: /^\d{4}$/,
    CH: /^\d{4}$/
  };

  const validateField = useCallback((fieldName, value) => {
    switch (fieldName) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) return t('validation.required');
        if (value.length < 2) return t('validation.minLength', { min: 2 });
        return '';
      case 'street':
        if (!value.trim()) return t('validation.required');
        if (value.length < 5) return t('validation.addressTooShort');
        return '';
      case 'city':
        if (!value.trim()) return t('validation.required');
        return '';
      case 'province':
        if (!value) return t('validation.selectProvince');
        return '';
      case 'postalCode':
        if (!value.trim()) return t('validation.required');
        const pattern = POSTAL_CODE_PATTERNS[shippingAddress.country];
        if (pattern && !pattern.test(value)) {
          return t('validation.invalidPostalCode');
        }
        return '';
      case 'phone':
        if (!value.trim()) return t('validation.required');
        const phoneClean = value.replace(/[\s\-\(\)]/g, '');
        if (!/^\+?\d{9,15}$/.test(phoneClean)) {
          return t('validation.invalidPhone');
        }
        return '';
      default:
        return '';
    }
  }, [t, shippingAddress.country]);

  const formatPhone = useCallback((value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
  }, []);

  const formatPostalCode = useCallback((value, country) => {
    const clean = value.replace(/[^\dA-Za-z\s-]/g, '');
    if (country === 'PT') {
      const digits = clean.replace(/\D/g, '');
      if (digits.length <= 4) return digits;
      return `${digits.slice(0, 4)}-${digits.slice(4, 7)}`;
    }
    if (country === 'NL') {
      const upper = clean.toUpperCase();
      const digits = upper.replace(/[^0-9]/g, '').slice(0, 4);
      const letters = upper.replace(/[^A-Z]/g, '').slice(0, 2);
      if (digits.length < 4) return digits;
      return `${digits} ${letters}`;
    }
    return clean.slice(0, 5);
  }, []);

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
    let formattedValue = value;

    if (name === 'phone') {
      formattedValue = formatPhone(value);
    } else if (name === 'postalCode') {
      formattedValue = formatPostalCode(value, shippingAddress.country);
    }

    setShippingAddress(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    if (touchedFields[name]) {
      const error = validateField(name, formattedValue);
      setFieldErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [formatPhone, formatPostalCode, shippingAddress.country, touchedFields, validateField]);

  const handleBlur = useCallback((event) => {
    const { name, value } = event.target;
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField]);

  const handleSaveAddress = useCallback(async () => {
    if (!saveAddress) return;
    
    try {
      await api.put('/auth/profile', {
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        phone: shippingAddress.phone,
        address: {
          street: shippingAddress.street,
          addressLine2: shippingAddress.addressLine2,
          city: shippingAddress.city,
          province: shippingAddress.province,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country
        }
      });
    } catch (error) {
      console.error('Error saving address:', error);
    }
  }, [saveAddress, shippingAddress]);

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

    const requiredFields = ['firstName', 'lastName', 'street', 'city', 'province', 'postalCode', 'phone'];
    const newErrors = {};
    let hasErrors = false;

    requiredFields.forEach(field => {
      const error = validateField(field, shippingAddress[field]);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setFieldErrors(newErrors);
      setTouchedFields(requiredFields.reduce((acc, field) => ({ ...acc, [field]: true }), {}));
      toast.error(t('checkout.fixFormErrors'));
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

      await handleSaveAddress();

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
          <div className="empty-cart-message" role="status" aria-live="polite">
            <span className="empty-icon" aria-hidden="true">{ICONS.cart}</span>
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
          <div className="email-verification-banner" role="alert" aria-live="polite">
            <div className="banner-content">
              <span className="banner-icon" aria-hidden="true">{ICONS.warning}</span>
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
          <form onSubmit={handleSubmit} className="checkout-form" aria-label={t('checkout.title')}>
            <section className="form-section" aria-labelledby="shipping-title">
              <h2 id="shipping-title" className="section-title">
                <span className="section-icon" aria-hidden="true">{ICONS.location}</span>
                {t('checkout.shippingAddress')}
              </h2>
              
              <div className="form-row">
                <div className={`form-group ${fieldErrors.firstName && touchedFields.firstName ? 'has-error' : ''}`}>
                  <label htmlFor="firstName">
                    {t('auth.firstName')} <span className="required" aria-hidden="true">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={shippingAddress.firstName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    autoComplete="given-name"
                    required
                    aria-invalid={!!fieldErrors.firstName}
                    aria-describedby={fieldErrors.firstName ? 'firstName-error' : undefined}
                  />
                  {fieldErrors.firstName && touchedFields.firstName && (
                    <span id="firstName-error" className="field-error" role="alert">
                      {fieldErrors.firstName}
                    </span>
                  )}
                </div>
                <div className={`form-group ${fieldErrors.lastName && touchedFields.lastName ? 'has-error' : ''}`}>
                  <label htmlFor="lastName">
                    {t('auth.lastName')} <span className="required" aria-hidden="true">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={shippingAddress.lastName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    autoComplete="family-name"
                    required
                    aria-invalid={!!fieldErrors.lastName}
                    aria-describedby={fieldErrors.lastName ? 'lastName-error' : undefined}
                  />
                  {fieldErrors.lastName && touchedFields.lastName && (
                    <span id="lastName-error" className="field-error" role="alert">
                      {fieldErrors.lastName}
                    </span>
                  )}
                </div>
              </div>

              <div className={`form-group ${fieldErrors.street && touchedFields.street ? 'has-error' : ''}`}>
                <label htmlFor="street">
                  {t('checkout.addressLine1')} <span className="required" aria-hidden="true">*</span>
                </label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  value={shippingAddress.street}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder={t('checkout.addressLine1Placeholder')}
                  autoComplete="address-line1"
                  required
                  aria-invalid={!!fieldErrors.street}
                  aria-describedby={fieldErrors.street ? 'street-error' : undefined}
                />
                {fieldErrors.street && touchedFields.street && (
                  <span id="street-error" className="field-error" role="alert">
                    {fieldErrors.street}
                  </span>
                )}
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
                  autoComplete="address-line2"
                />
              </div>

              <div className="form-row">
                <div className={`form-group ${fieldErrors.postalCode && touchedFields.postalCode ? 'has-error' : ''}`}>
                  <label htmlFor="postalCode">
                    {t('profile.postalCode')} <span className="required" aria-hidden="true">*</span>
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={shippingAddress.postalCode}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    autoComplete="postal-code"
                    required
                    aria-invalid={!!fieldErrors.postalCode}
                    aria-describedby={fieldErrors.postalCode ? 'postalCode-error' : undefined}
                  />
                  {fieldErrors.postalCode && touchedFields.postalCode && (
                    <span id="postalCode-error" className="field-error" role="alert">
                      {fieldErrors.postalCode}
                    </span>
                  )}
                </div>
                <div className={`form-group ${fieldErrors.city && touchedFields.city ? 'has-error' : ''}`}>
                  <label htmlFor="city">
                    {t('profile.city')} <span className="required" aria-hidden="true">*</span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    autoComplete="address-level2"
                    required
                    aria-invalid={!!fieldErrors.city}
                    aria-describedby={fieldErrors.city ? 'city-error' : undefined}
                  />
                  {fieldErrors.city && touchedFields.city && (
                    <span id="city-error" className="field-error" role="alert">
                      {fieldErrors.city}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className={`form-group ${fieldErrors.province && touchedFields.province ? 'has-error' : ''}`}>
                  <label htmlFor="province">
                    {t('checkout.province')} <span className="required" aria-hidden="true">*</span>
                  </label>
                  <select
                    id="province"
                    name="province"
                    value={shippingAddress.province}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    aria-invalid={!!fieldErrors.province}
                    aria-describedby={fieldErrors.province ? 'province-error' : undefined}
                  >
                    <option value="">{t('checkout.selectProvince')}</option>
                    {(PROVINCES_BY_COUNTRY[shippingAddress.country] || []).map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.province && touchedFields.province && (
                    <span id="province-error" className="field-error" role="alert">
                      {fieldErrors.province}
                    </span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="country">
                    {t('profile.country')} <span className="required" aria-hidden="true">*</span>
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={shippingAddress.country}
                    onChange={(event) => {
                      handleInputChange(event);
                      setShippingAddress(prev => ({ ...prev, province: '', postalCode: '' }));
                      setFieldErrors(prev => ({ ...prev, province: '', postalCode: '' }));
                    }}
                    autoComplete="country"
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

              <div className={`form-group ${fieldErrors.phone && touchedFields.phone ? 'has-error' : ''}`}>
                <label htmlFor="phone">
                  {t('profile.phone')} <span className="required" aria-hidden="true">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={shippingAddress.phone}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder={t('checkout.phonePlaceholder')}
                  autoComplete="tel"
                  required
                  aria-invalid={!!fieldErrors.phone}
                  aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
                />
                {fieldErrors.phone && touchedFields.phone && (
                  <span id="phone-error" className="field-error" role="alert">
                    {fieldErrors.phone}
                  </span>
                )}
              </div>

              <div className="form-group-checkbox">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(event) => setSaveAddress(event.target.checked)}
                  />
                  <span className="checkbox-custom" aria-hidden="true"></span>
                  {t('checkout.saveAddress')}
                </label>
              </div>
            </section>

            <fieldset className="form-section" aria-labelledby="payment-title">
              <legend id="payment-title" className="section-title">
                <span className="section-icon" aria-hidden="true">{ICONS.payment}</span>
                {t('checkout.paymentMethod')}
              </legend>
              
              <div className="payment-methods" role="radiogroup" aria-label={t('checkout.paymentMethod')}>
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.id}
                    className={`payment-option ${paymentMethod === method.id ? 'selected' : ''} ${!method.available ? 'disabled' : ''}`}
                    htmlFor={`payment-${method.id}`}
                  >
                    <input
                      type="radio"
                      id={`payment-${method.id}`}
                      name="paymentMethod"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={() => method.available && setPaymentMethod(method.id)}
                      disabled={!method.available}
                      className="payment-radio"
                    />
                    <div className="payment-option-content">
                      <div className="payment-option-header">
                        <span className="payment-icon" aria-hidden="true">{getPaymentIcon(method.id)}</span>
                        <span className="payment-name">{t(`checkout.payment_${method.id}`)}</span>
                        {!method.available && (
                          <span className="coming-soon">{t('checkout.comingSoon')}</span>
                        )}
                      </div>
                      <p className="payment-description">
                        {t(`checkout.payment_${method.id}_desc`)}
                      </p>
                    </div>
                    {paymentMethod === method.id && (
                      <span className="payment-check" aria-hidden="true">{ICONS.check}</span>
                    )}
                  </label>
                ))}
              </div>
            </fieldset>

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

          <aside className="order-summary" aria-labelledby="summary-title">
            <h2 id="summary-title">{t('checkout.orderSummary')}</h2>
            
            {stockIssues.length > 0 && (
              <div className="stock-warning-banner" role="alert">
                <span className="warning-icon" aria-hidden="true">{ICONS.warning}</span>
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
              <div className="validating-stock" role="status" aria-live="polite">
                <span className="spinner" aria-hidden="true">{ICONS.loader}</span> 
                {t('checkout.validatingStock')}
              </div>
            )}
            
            <ul className="summary-items" aria-label={t('checkout.orderSummary')}>
              {cartItems.map((item) => {
                const itemKey = item.variantId ? `${item._id}_${item.variantId}` : item._id;
                const hasStockIssue = stockIssues.some(issue => 
                  issue.productId === item._id && 
                  (!item.variantId || issue.variantId === item.variantId)
                );
                return (
                  <li key={itemKey} className={`summary-item ${hasStockIssue ? 'stock-issue' : ''}`}>
                    <div className="item-image" aria-hidden="true">
                      {item.images?.[0] ? (
                        <img src={item.images[0]} alt="" />
                      ) : (
                        <span className="item-placeholder">{ICONS.package}</span>
                      )}
                    </div>
                    <div className="item-details">
                      <span className="item-name">{item.name?.es}</span>
                      {item.variantName && (
                        <span className="item-variant">{item.variantName}</span>
                      )}
                      <span className="item-qty">x{item.quantity}</span>
                      {hasStockIssue && (
                        <span className="stock-issue-badge" aria-label={t('checkout.stockIssue')}>
                          {ICONS.warning}
                        </span>
                      )}
                    </div>
                    <span className="item-price" aria-label={`${t('cart.total')}: €${(item.price * item.quantity).toFixed(2)}`}>
                      €{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="coupon-section" aria-labelledby="coupon-title">
              <h3 id="coupon-title">{t('checkout.couponCode')}</h3>
              {appliedCoupon ? (
                <div className="applied-coupon" role="status" aria-live="polite">
                  <div className="coupon-info">
                    <span className="coupon-badge">
                      <span className="coupon-icon" aria-hidden="true">{ICONS.ticket}</span>
                      {appliedCoupon.code}
                    </span>
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
                    aria-label={t('checkout.removeCoupon')}
                  >
                    {ICONS.close}
                  </button>
                </div>
              ) : (
                <div className="coupon-input-wrapper">
                  <label htmlFor="coupon-input" className="visually-hidden">
                    {t('checkout.couponCode')}
                  </label>
                  <input
                    type="text"
                    id="coupon-input"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponError('');
                    }}
                    placeholder={t('checkout.couponPlaceholder')}
                    className={couponError ? 'error' : ''}
                    aria-invalid={!!couponError}
                    aria-describedby={couponError ? 'coupon-error' : undefined}
                  />
                  <button
                    type="button"
                    className="btn-apply-coupon"
                    onClick={handleApplyCoupon}
                    disabled={validatingCoupon || !couponCode.trim()}
                  >
                    {validatingCoupon ? ICONS.loader : t('checkout.applyCoupon')}
                  </button>
                </div>
              )}
              {couponError && (
                <p id="coupon-error" className="coupon-error" role="alert">
                  {couponError}
                </p>
              )}
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
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
