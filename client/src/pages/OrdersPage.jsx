import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../services/api';
import { ListSkeleton } from '../components/common/Skeleton';
import './OrdersPage.css';

const STATUS_COLORS = {
  pending: '#ff9800',
  confirmed: '#2196f3',
  preparing: '#9c27b0',
  shipped: '#00bcd4',
  delivered: '#4caf50',
  cancelled: '#f44336'
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const { t } = useTranslation();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: currentPage, limit: 10 });
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`/orders?${params}`);
      setOrders(response.data.data.orders);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error(t('orders.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, t]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

  if (loading && orders.length === 0) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <h1>{t('orders.title')}</h1>
          <ListSkeleton type="order" count={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-container">
        <h1>{t('orders.title')}</h1>

        <div className="orders-filters">
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setCurrentPage(1);
            }}
            className="status-filter"
          >
            <option value="">{t('orders.allOrders')}</option>
            <option value="pending">{t('orders.statusPending')}</option>
            <option value="confirmed">{t('orders.statusConfirmed')}</option>
            <option value="preparing">{t('orders.statusPreparing')}</option>
            <option value="shipped">{t('orders.statusShipped')}</option>
            <option value="delivered">{t('orders.statusDelivered')}</option>
            <option value="cancelled">{t('orders.statusCancelled')}</option>
          </select>
        </div>

        {orders.length === 0 ? (
          <div className="no-orders">
            <p>{t('orders.noOrders')}</p>
            <Link to="/products" className="btn btn-primary">
              {t('orders.startShopping')}
            </Link>
          </div>
        ) : (
          <>
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <span className="order-number">#{order.orderNumber}</span>
                      <span className="order-date">{formatDate(order.createdAt)}</span>
                    </div>
                    <span
                      className="order-status"
                      style={{ backgroundColor: STATUS_COLORS[order.status] }}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>

                  <div className="order-items">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="order-item">
                        <span className="item-name">{item.productName}</span>
                        <span className="item-quantity">x{item.quantity}</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <span className="more-items">
                        +{order.items.length - 3} {t('orders.moreItems')}
                      </span>
                    )}
                  </div>

                  <div className="order-footer">
                    <span className="order-total">
                      {t('orders.total')}: €{order.total.toFixed(2)}
                    </span>
                    <Link to={`/orders/${order._id}`} className="btn btn-secondary">
                      {t('orders.viewDetails')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="btn btn-pagination"
                >
                  {t('common.previous')}
                </button>
                <span className="page-info">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="btn btn-pagination"
                >
                  {t('common.next')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;

