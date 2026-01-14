import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../services/api';
import './OrderDetailPage.css';

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
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

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

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

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
      <div className="order-detail-page">
        <div className="order-detail-container">
          <div className="loading-spinner">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-page">
        <div className="order-detail-container">
          <div className="order-not-found">
            <h2>{t('orderDetail.notFound')}</h2>
            <Link to="/orders" className="btn btn-primary">
              {t('orderDetail.backToOrders')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-detail-page">
      <div className="order-detail-container">
        <div className="order-detail-header">
          <Link to="/orders" className="back-link">
            ← {t('orderDetail.backToOrders')}
          </Link>
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
            <span>❌</span> {t('orderDetail.orderCancelled')}
          </div>
        )}

        <div className="order-detail-grid">
          <div className="order-items-section">
            <h2>{t('orderDetail.items')}</h2>
            <div className="order-items-list">
              {order.items.map((item, index) => (
                <div key={index} className="order-item-card">
                  <div className="item-image">
                    {item.productId?.images?.[0] ? (
                      <img src={item.productId.images[0]} alt={item.productName} />
                    ) : (
                      <div className="image-placeholder">📦</div>
                    )}
                  </div>
                  <div className="item-details">
                    <h3>{item.productName}</h3>
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
                        €{item.priceAtPurchase.toFixed(2)} / {t('products.unit')}
                      </span>
                    </div>
                  </div>
                  <div className="item-total">
                    €{(item.priceAtPurchase * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
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
                <p>{order.shippingAddress?.country}</p>
                {order.shippingAddress?.phone && (
                  <p className="address-phone">📞 {order.shippingAddress.phone}</p>
                )}
              </div>
            </div>

            {order.trackingNumber && (
              <div className="tracking-card">
                <h2>{t('orderDetail.tracking')}</h2>
                <p className="tracking-number">{order.trackingNumber}</p>
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
    </div>
  );
};

export default OrderDetailPage;

