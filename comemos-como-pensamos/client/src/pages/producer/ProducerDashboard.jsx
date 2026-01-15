import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './ProducerDashboard.css';

const ProducerDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    pendingOrders: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'producer') {
      navigate('/');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      const [producerRes, ordersRes] = await Promise.all([
        api.get('/producers/me'),
        api.get('/orders/producer/orders?limit=5')
      ]);

      const producer = producerRes.data.data.producer;
      const orders = ordersRes.data.data.orders;

      // Obtener productos del productor
      const productsRes = await api.get(`/products?producerId=${producer._id}`);
      const products = productsRes.data.data.products;

      // Calcular estadísticas
      const totalRevenue = orders.reduce((sum, order) => {
        const producerItems = order.items.filter(
          item => item.producerId === producer._id || item.producerId?._id === producer._id
        );
        return sum + producerItems.reduce((itemSum, item) => 
          itemSum + (item.priceAtPurchase * item.quantity), 0);
      }, 0);

      const pendingOrders = orders.filter(
        o => ['pending', 'confirmed', 'preparing'].includes(o.status)
      ).length;

      setStats({
        totalProducts: products.length,
        activeProducts: products.filter(p => p.isAvailable && p.stock > 0).length,
        pendingOrders,
        totalOrders: ordersRes.data.total,
        totalRevenue,
        recentOrders: orders
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error(t('producer.dashboard.errorLoading'));
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="producer-dashboard">
        <div className="container">
          <div className="loading">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="producer-dashboard">
      <div className="container">
        <header className="dashboard-header">
          <h1>{t('producer.dashboard.title')}</h1>
          <p className="welcome-message">
            {t('producer.dashboard.welcome')}, {user?.firstName}!
          </p>
        </header>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalProducts}</span>
              <span className="stat-label">{t('producer.dashboard.totalProducts')}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <span className="stat-value">{stats.activeProducts}</span>
              <span className="stat-label">{t('producer.dashboard.activeProducts')}</span>
            </div>
          </div>
          <div className="stat-card highlight">
            <div className="stat-icon">🛒</div>
            <div className="stat-info">
              <span className="stat-value">{stats.pendingOrders}</span>
              <span className="stat-label">{t('producer.dashboard.pendingOrders')}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <span className="stat-value">€{stats.totalRevenue.toFixed(2)}</span>
              <span className="stat-label">{t('producer.dashboard.totalRevenue')}</span>
            </div>
          </div>
        </div>

        <div className="dashboard-actions">
          <Link to="/producer/products" className="action-card">
            <span className="action-icon">📋</span>
            <span className="action-title">{t('producer.dashboard.manageProducts')}</span>
            <span className="action-desc">{t('producer.dashboard.manageProductsDesc')}</span>
          </Link>
          <Link to="/producer/products/new" className="action-card">
            <span className="action-icon">➕</span>
            <span className="action-title">{t('producer.dashboard.addProduct')}</span>
            <span className="action-desc">{t('producer.dashboard.addProductDesc')}</span>
          </Link>
          <Link to="/producer/orders" className="action-card">
            <span className="action-icon">📦</span>
            <span className="action-title">{t('producer.dashboard.viewOrders')}</span>
            <span className="action-desc">{t('producer.dashboard.viewOrdersDesc')}</span>
          </Link>
        </div>

        <section className="recent-orders-section">
          <div className="section-header">
            <h2>{t('producer.dashboard.recentOrders')}</h2>
            <Link to="/producer/orders" className="view-all-link">
              {t('producer.dashboard.viewAll')} →
            </Link>
          </div>

          {stats.recentOrders.length === 0 ? (
            <div className="no-orders">
              <p>{t('producer.dashboard.noOrders')}</p>
            </div>
          ) : (
            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>{t('producer.orders.orderId')}</th>
                    <th>{t('producer.orders.customer')}</th>
                    <th>{t('producer.orders.items')}</th>
                    <th>{t('producer.orders.total')}</th>
                    <th>{t('producer.orders.status')}</th>
                    <th>{t('producer.orders.date')}</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order) => (
                    <tr key={order._id} onClick={() => navigate(`/producer/orders/${order._id}`)}>
                      <td className="order-id">#{order._id.slice(-6)}</td>
                      <td>
                        {order.customerId?.firstName} {order.customerId?.lastName?.charAt(0)}.
                      </td>
                      <td>{order.items.length} {t('producer.orders.products')}</td>
                      <td className="order-total">€{order.total?.toFixed(2)}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(order.status)}`}>
                          {t(`orders.status${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`)}
                        </span>
                      </td>
                      <td className="order-date">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProducerDashboard;

