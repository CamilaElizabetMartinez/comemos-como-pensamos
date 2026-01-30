import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { OrderDetailSkeleton } from '../components/common/Skeleton';
import { IconStarFilled } from '../components/common/Icons';
import Breadcrumbs from '../components/common/Breadcrumbs';
import './OrderDetailPage.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

const ReviewModal = ({ isOpen, onClose, product, orderId, onReviewSubmitted, t }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (rating === 0) {
      toast.error(t('reviews.selectRating'));
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/reviews', {
        productId: product.productId._id || product.productId,
        orderId,
        rating,
        comment
      });
      toast.success(t('reviews.reviewAdded'));
      onReviewSubmitted(product.productId._id || product.productId);
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.message || t('reviews.reviewError');
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let starIndex = 1; starIndex <= 5; starIndex++) {
      stars.push(
        <span
          key={starIndex}
          className={`star interactive ${starIndex <= rating ? 'filled' : ''}`}
          onClick={() => setRating(starIndex)}
          role="button"
          aria-label={`${starIndex} estrellas`}
        >
          <IconStarFilled size={24} />
        </span>
      );
    }
    return stars;
  };

  if (!isOpen) return null;

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div className="review-modal" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>{t('reviews.writeReview')}</h2>
        <p className="modal-product-name">{product.productName}</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('reviews.yourRating')} *</label>
            <div className="rating-selector">{renderStars()}</div>
          </div>

          <div className="form-group">
            <label htmlFor="review-comment">{t('reviews.yourComment')}</label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder={t('reviews.commentPlaceholder')}
              rows={4}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting || rating === 0}>
              {submitting ? t('common.loading') : t('reviews.submitReview')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const STATUS_COLORS = {
  pending: '#ff9800',
  confirmed: '#2196f3',
  preparing: '#9c27b0',
  shipped: '#00bcd4',
  delivered: '#4caf50',
  cancelled: '#f44336'
};

const STATUS_STEPS = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered'];

const OrderDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewedProducts, setReviewedProducts] = useState([]);
  const [reviewModal, setReviewModal] = useState({ isOpen: false, product: null });
  const { t } = useTranslation();

  const isFromAdmin = useMemo(() => {
    return location.state?.from === 'admin' || user?.role === 'admin';
  }, [location.state, user]);

  const backUrl = useMemo(() => {
    return isFromAdmin ? '/admin/orders' : '/orders';
  }, [isFromAdmin]);

  const backText = useMemo(() => {
    return isFromAdmin ? t('admin.backToDashboard') : t('orderDetail.backToOrders');
  }, [isFromAdmin, t]);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data.data.order);
    } catch (error) {
      toast.error(t('orderDetail.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  const fetchUserReviews = useCallback(async () => {
    if (!order) return;
    try {
      const productIds = order.items.map(item => item.productId._id || item.productId);
      const reviewedIds = [];
      
      for (const productId of productIds) {
        try {
          const response = await api.get(`/reviews/product/${productId}`);
          const userReview = response.data.data.reviews.find(
            review => review.userId?._id === order.customerId._id || review.userId?._id === order.customerId
          );
          if (userReview) {
            reviewedIds.push(productId);
          }
        } catch (reviewError) {
          // Product might not have reviews, continue
        }
      }
      setReviewedProducts(reviewedIds);
    } catch (error) {
      console.error('Error fetching user reviews:', error);
    }
  }, [order]);

  const handleReviewSubmitted = (productId) => {
    setReviewedProducts(prev => [...prev, productId]);
  };

  const openReviewModal = (product) => {
    setReviewModal({ isOpen: true, product });
  };

  const closeReviewModal = () => {
    setReviewModal({ isOpen: false, product: null });
  };

  const handleDownloadInvoice = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/orders/${id}/invoice`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error downloading invoice');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `factura-${order?.orderNumber || id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(t('orderDetail.invoiceDownloaded'));
    } catch (error) {
      toast.error(t('orderDetail.invoiceError'));
    }
  }, [id, order?.orderNumber, t]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  useEffect(() => {
    if (order && order.status === 'delivered') {
      fetchUserReviews();
    }
  }, [order, fetchUserReviews]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: t('orders.statusPending'),
      confirmed: t('orders.statusConfirmed'),
      preparing: t('orders.statusPreparing'),
      shipped: t('orders.statusShipped'),
      delivered: t('orders.statusDelivered'),
      cancelled: t('orders.statusCancelled')
    };
    return labels[status] || status;
  };

  const getCurrentStep = () => {
    if (!order || order.status === 'cancelled') return -1;
    return STATUS_STEPS.indexOf(order.status);
  };

  if (loading) {
    return (
      <div className={`order-detail-page ${isFromAdmin ? 'admin-view' : ''}`}>
        <OrderDetailSkeleton />
      </div>
    );
  }

  if (!order) {
    return (
      <div className={`order-detail-page ${isFromAdmin ? 'admin-view' : ''}`}>
        <div className="order-detail-container">
          <div className="order-not-found">
            <h2>{t('orderDetail.notFound')}</h2>
            <Link to={backUrl} className="btn btn-primary">
              {backText}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`order-detail-page ${isFromAdmin ? 'admin-view' : ''}`}>
      <div className="order-detail-container">
        <Breadcrumbs 
          items={[{ label: isFromAdmin ? t('admin.orders', 'Pedidos') : t('orders.title', 'Mis pedidos'), path: backUrl }]}
          currentPage={`#${order.orderNumber}`}
        />
        <div className="order-detail-header">
          <h1>{t('orderDetail.title')} #{order.orderNumber}</h1>
          <p className="order-date">{formatDate(order.createdAt)}</p>
        </div>

        {order.status !== 'cancelled' && (
          <div className="order-progress">
            <div className="progress-track">
              {STATUS_STEPS.map((step, index) => (
                <div
                  key={step}
                  className={`progress-step ${index <= getCurrentStep() ? 'completed' : ''} ${index === getCurrentStep() ? 'current' : ''}`}
                >
                  <div className="step-indicator">
                    {index < getCurrentStep() ? '✓' : index + 1}
                  </div>
                  <span className="step-label">{getStatusLabel(step)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {order.status === 'cancelled' && (
          <div className="order-cancelled-banner">
            {t('orderDetail.orderCancelled')}
          </div>
        )}

        <div className="order-detail-grid">
          <div className="order-items-section">
            <h2>{t('orderDetail.items')}</h2>
            <div className="order-items-list">
              {order.items.map((item, index) => {
                const productId = item.productId?._id || item.productId;
                const hasReviewed = reviewedProducts.includes(productId);
                
                const itemKey = item.variantId ? `${index}_${item.variantId}` : index;
                
                return (
                  <div key={itemKey} className="order-item-card">
                    <div className="item-image">
                      {item.productId?.images?.[0] ? (
                        <img src={item.productId.images[0]} alt={item.productName} loading="lazy" />
                      ) : (
                        <div className="image-placeholder"></div>
                      )}
                    </div>
                    <div className="item-details">
                      <h3>{item.productName}</h3>
                      {item.variantName && (
                        <span className="item-variant-badge">{item.variantName}</span>
                      )}
                      {item.producerId && (
                        <p className="item-producer">
                          {t('products.producer')}: {item.producerId.businessName}
                        </p>
                      )}
                      <div className="item-meta">
                        <span className="item-quantity">
                          {t('orderDetail.quantity')}: {item.quantity}
                        </span>
                        <span className="item-price">
                          €{item.priceAtPurchase.toFixed(2)}
                        </span>
                      </div>
                      {order.status === 'delivered' && (
                        <div className="item-review-action">
                          {hasReviewed ? (
                            <span className="review-done">{t('reviews.alreadyReviewed')}</span>
                          ) : (
                            <button 
                              className="btn-review-item"
                              onClick={() => openReviewModal(item)}
                            >
                              {t('reviews.writeReview')}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="item-total">
                      €{(item.priceAtPurchase * item.quantity).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="order-sidebar">
            <div className="order-summary-card">
              <h2>{t('orderDetail.summary')}</h2>
              <div className="summary-row">
                <span>{t('cart.subtotal')}</span>
                <span>€{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>{t('cart.shipping')}</span>
                <span>€{order.shippingCost.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>{t('cart.total')}</span>
                <span>€{order.total.toFixed(2)}</span>
              </div>
              <div className="payment-status">
                <span className={`payment-badge ${order.paymentStatus}`}>
                  {order.paymentStatus === 'paid' 
                    ? t('orderDetail.paid') 
                    : t('orderDetail.paymentPending')
                  }
                </span>
              </div>
              <button 
                className="btn-download-invoice"
                onClick={handleDownloadInvoice}
              >
                {t('orderDetail.downloadInvoice')}
              </button>
            </div>

            <div className="shipping-card">
              <h2>{t('orderDetail.shippingAddress')}</h2>
              <div className="address-details">
                <p className="address-name">
                  {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                </p>
                <p>{order.shippingAddress?.street}</p>
                <p>
                  {order.shippingAddress?.postalCode} {order.shippingAddress?.city}
                </p>
                <p>{getCountryName(order.shippingAddress?.country)}</p>
                {order.shippingAddress?.phone && (
                  <p className="address-phone">{order.shippingAddress.phone}</p>
                )}
              </div>
            </div>

            {(order.trackingNumber || order.status === 'shipped' || order.status === 'delivered') && (
              <div className="tracking-card">
                <h2>{t('orderDetail.tracking')}</h2>
                
                {order.trackingNumber && (
                  <div className="tracking-info">
                    <span className="tracking-label">{t('orderDetail.trackingNumber')}</span>
                    <span className="tracking-value">{order.trackingNumber}</span>
                  </div>
                )}
                
                {order.trackingCarrier && (
                  <div className="tracking-info">
                    <span className="tracking-label">{t('orderDetail.carrier')}</span>
                    <span className="tracking-value carrier-badge">{order.trackingCarrier.toUpperCase()}</span>
                  </div>
                )}
                
                {order.estimatedDelivery && (
                  <div className="tracking-info">
                    <span className="tracking-label">{t('orderDetail.estimatedDelivery')}</span>
                    <span className="tracking-value">
                      {new Date(order.estimatedDelivery).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                
                {order.shippedAt && (
                  <div className="tracking-info">
                    <span className="tracking-label">{t('orderDetail.shippedAt')}</span>
                    <span className="tracking-value">{formatDate(order.shippedAt)}</span>
                  </div>
                )}
                
                {order.deliveredAt && (
                  <div className="tracking-info delivered">
                    <span className="tracking-label">{t('orderDetail.deliveredAt')}</span>
                    <span className="tracking-value">{formatDate(order.deliveredAt)}</span>
                  </div>
                )}
                
                {order.trackingUrl && (
                  <a 
                    href={order.trackingUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-track-package"
                  >
                    {t('orderDetail.trackPackage')}
                  </a>
                )}
              </div>
            )}

            {order.notes && (
              <div className="notes-card">
                <h2>{t('orderDetail.notes')}</h2>
                <p>{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={closeReviewModal}
        product={reviewModal.product}
        orderId={id}
        onReviewSubmitted={handleReviewSubmitted}
        t={t}
      />
    </div>
  );
};

export default OrderDetailPage;

