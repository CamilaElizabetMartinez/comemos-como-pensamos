import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './ProducerOrders.css';

const ProducerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'producer') {
      navigate('/');
      return;
    }
    fetchOrders();
  }, [user, navigate, currentPage, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = `/orders/producer/orders?page=${currentPage}&limit=10`;
      if (statusFilter) url += `&status=${statusFilter}`;

      const res = await api.get(url);
      setOrders(res.data.data.orders);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(t('producer.orders.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map(o => 
        o._id === orderId ? { ...o, status: newStatus } : o
      ));
      toast.success(t('producer.orders.statusUpdated'));
    } catch (error) {
      toast.error(t('producer.orders.statusError'));
    }
  };

  const getStatusClass = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      preparing: 'status-preparing',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled'
    };
    return statusClasses[status] || '';
  };

  const getNextStatus = (currentStatus) => {
    const flow = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'shipped',
      shipped: 'delivered'
    };
    return flow[currentStatus];
  };

  const getLocalizedText = (textObject) => {
    if (!textObject) return '';
    return textObject[i18n.language] || textObject.es || '';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && orders.length === 0) {
    return (
      <div className="producer-orders">
        <div className="container">
          <div className="loading">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="producer-orders">
      <div className="container">
        <header className="page-header">
          <div className="header-left">
            <Link to="/producer" className="back-link">
              {t('producer.orders.backToDashboard')}
            </Link>
            <h1>{t('producer.orders.title')}</h1>
          </div>
        </header>

        <div className="orders-toolbar">
          <div className="status-filters">
            <button
              className={`filter-btn ${statusFilter === '' ? 'active' : ''}`}
              onClick={() => { setStatusFilter(''); setCurrentPage(1); }}
            >
              {t('producer.orders.allOrders')}
            </button>
            <button
              className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
              onClick={() => { setStatusFilter('pending'); setCurrentPage(1); }}
            >
              {t('orders.statusPending')}
            </button>
            <button
              className={`filter-btn ${statusFilter === 'confirmed' ? 'active' : ''}`}
              onClick={() => { setStatusFilter('confirmed'); setCurrentPage(1); }}
            >
              {t('orders.statusConfirmed')}
            </button>
            <button
              className={`filter-btn ${statusFilter === 'preparing' ? 'active' : ''}`}
              onClick={() => { setStatusFilter('preparing'); setCurrentPage(1); }}
            >
              {t('orders.statusPreparing')}
            </button>
            <button
              className={`filter-btn ${statusFilter === 'shipped' ? 'active' : ''}`}
              onClick={() => { setStatusFilter('shipped'); setCurrentPage(1); }}
            >
              {t('orders.statusShipped')}
            </button>
            <button
              className={`filter-btn ${statusFilter === 'delivered' ? 'active' : ''}`}
              onClick={() => { setStatusFilter('delivered'); setCurrentPage(1); }}
            >
              {t('orders.statusDelivered')}
            </button>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="no-orders">
            <p>{t('producer.orders.noOrders')}</p>
          </div>
        ) : (
          <>
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <div className="order-id-info">
                      <span className="order-id">#{order._id.slice(-6)}</span>
                      <span className="order-date">{formatDate(order.createdAt)}</span>
                    </div>
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {t(`orders.status${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`)}
                    </span>
                  </div>

                  <div className="order-customer">
                    <div className="customer-avatar">
                      {order.customerId?.firstName?.charAt(0) || 'C'}
                    </div>
                    <div className="customer-info">
                      <span className="customer-name">
                        {order.customerId?.firstName} {order.customerId?.lastName}
                      </span>
                      <span className="customer-email">{order.customerId?.email}</span>
                    </div>
                  </div>

                  <div className="order-items">
                    {order.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <div className="item-image">
                          {item.productId?.images?.[0] ? (
                            <img src={item.productId.images[0]} alt={item.productName} />
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <path d="M21 15l-5-5L5 21" />
                            </svg>
                          )}
                        </div>
                        <div className="item-details">
                          <span className="item-name">
                            {getLocalizedText(item.productId?.name) || item.productName}
                          </span>
                          <span className="item-qty">
                            {item.quantity} × €{item.priceAtPurchase?.toFixed(2)}
                          </span>
                        </div>
                        <span className="item-total">
                          €{(item.quantity * item.priceAtPurchase).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="order-footer">
                    <div className="order-total">
                      <span>{t('producer.orders.total')}:</span>
                      <span className="total-amount">€{order.total?.toFixed(2)}</span>
                    </div>
                    
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <div className="order-actions">
                        {getNextStatus(order.status) && (
                          <button
                            onClick={() => handleStatusChange(order._id, getNextStatus(order.status))}
                            className="btn btn-primary btn-advance"
                          >
                            {t(`producer.orders.advanceTo${getNextStatus(order.status).charAt(0).toUpperCase() + getNextStatus(order.status).slice(1)}`)}
                          </button>
                        )}
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(order._id, 'cancelled')}
                            className="btn btn-danger btn-cancel"
                          >
                            {t('producer.orders.cancel')}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-arrow"
                  aria-label={t('common.previous')}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <div className="pagination-numbers">
                  {(() => {
                    const pages = [];
                    const showEllipsisStart = currentPage > 3;
                    const showEllipsisEnd = currentPage < totalPages - 2;
                    
                    pages.push(
                      <button
                        key={1}
                        onClick={() => setCurrentPage(1)}
                        className={`pagination-number ${currentPage === 1 ? 'active' : ''}`}
                      >
                        1
                      </button>
                    );
                    
                    if (showEllipsisStart) {
                      pages.push(<span key="ellipsis-start" className="pagination-number ellipsis">...</span>);
                    }
                    
                    for (let pageNumber = Math.max(2, currentPage - 1); pageNumber <= Math.min(totalPages - 1, currentPage + 1); pageNumber++) {
                      if (pageNumber === 1 || pageNumber === totalPages) continue;
                      pages.push(
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`pagination-number ${currentPage === pageNumber ? 'active' : ''}`}
                        >
                          {pageNumber}
                        </button>
                      );
                    }
                    
                    if (showEllipsisEnd) {
                      pages.push(<span key="ellipsis-end" className="pagination-number ellipsis">...</span>);
                    }
                    
                    if (totalPages > 1) {
                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => setCurrentPage(totalPages)}
                          className={`pagination-number ${currentPage === totalPages ? 'active' : ''}`}
                        >
                          {totalPages}
                        </button>
                      );
                    }
                    
                    return pages;
                  })()}
                </div>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-arrow"
                  aria-label={t('common.next')}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProducerOrders;

