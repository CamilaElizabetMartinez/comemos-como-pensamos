import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { TableSkeleton } from '../../components/common/Skeleton';
import { IconEye, IconCart } from '../../components/common/Icons';
import './AdminOrders.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchOrders();
  }, [user, navigate, currentPage, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = `/admin/orders?page=${currentPage}&limit=15`;
      if (statusFilter) url += `&status=${statusFilter}`;

      const response = await api.get(url);
      if (response.data.success) {
        setOrders(response.data.data.orders);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(t('admin.orders.errorLoading'));
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
      toast.success(t('admin.orders.statusUpdated'));
    } catch (error) {
      toast.error(t('admin.orders.statusError'));
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
      <div className="admin-orders">
        <div className="container">
          <TableSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-orders">
      <div className="container">
        <header className="page-header">
          <div className="header-left">
            <Link to="/admin" className="back-link">
              {t('admin.orders.backToDashboard')}
            </Link>
            <h1>{t('admin.orders.title')}</h1>
          </div>
        </header>

        <div className="toolbar">
          <div className="status-filters">
            <button
              className={`filter-btn ${statusFilter === '' ? 'active' : ''}`}
              onClick={() => { setStatusFilter(''); setCurrentPage(1); }}
            >
              {t('admin.orders.allOrders')}
            </button>
            {['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'].map(status => (
              <button
                key={status}
                className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
                onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
              >
                {t(`orders.status${status.charAt(0).toUpperCase() + status.slice(1)}`)}
              </button>
            ))}
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <IconCart size={48} />
            <h3>{t('admin.orders.noOrdersTitle', 'No hay pedidos')}</h3>
            <p>{t('admin.orders.noOrders', 'No se encontraron pedidos con los filtros actuales')}</p>
          </div>
        ) : (
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>{t('admin.orders.orderId')}</th>
                  <th>{t('admin.orders.customer')}</th>
                  <th>{t('admin.orders.items')}</th>
                  <th>{t('admin.orders.total')}</th>
                  <th>{t('admin.orders.status')}</th>
                  <th>{t('admin.orders.date')}</th>
                  <th>{t('admin.orders.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="order-id">#{order._id.slice(-6)}</td>
                    <td>
                      <div className="customer-cell">
                        <span className="customer-name">
                          {order.customerId?.firstName} {order.customerId?.lastName}
                        </span>
                        <span className="customer-email">{order.customerId?.email}</span>
                      </div>
                    </td>
                    <td>{order.items?.length || 0} {t('admin.orders.products')}</td>
                    <td className="total-cell">€{order.total?.toFixed(2)}</td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`status-select ${getStatusClass(order.status)}`}
                      >
                        <option value="pending">{t('orders.statusPending')}</option>
                        <option value="confirmed">{t('orders.statusConfirmed')}</option>
                        <option value="preparing">{t('orders.statusPreparing')}</option>
                        <option value="shipped">{t('orders.statusShipped')}</option>
                        <option value="delivered">{t('orders.statusDelivered')}</option>
                        <option value="cancelled">{t('orders.statusCancelled')}</option>
                      </select>
                    </td>
                    <td className="date-cell">{formatDate(order.createdAt)}</td>
                    <td>
                      <Link to={`/orders/${order._id}`} state={{ from: 'admin' }} className="btn-view" aria-label="Ver pedido">
                        <IconEye size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn btn-pagination"
            >
              {t('common.previous')}
            </button>
            <span className="page-info">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-pagination"
            >
              {t('common.next')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;

