import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { DashboardSkeleton } from '../../components/common/Skeleton';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingProducers: 0,
    recentOrders: [],
    ordersByStatus: {}
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching admin dashboard:', error);
      toast.error(t('admin.dashboard.errorLoading'));
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
      <div className="admin-dashboard">
        <div className="container">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <header className="dashboard-header">
          <h1>{t('admin.dashboard.title')}</h1>
          <p className="subtitle">{t('admin.dashboard.subtitle')}</p>
        </header>

        <div className="stats-grid">
          <div className="stat-card users">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalUsers}</span>
              <span className="stat-label">{t('admin.dashboard.totalUsers')}</span>
            </div>
          </div>
          <div className="stat-card producers">
            <div className="stat-icon">🏪</div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalProducers}</span>
              <span className="stat-label">{t('admin.dashboard.totalProducers')}</span>
            </div>
          </div>
          <div className="stat-card products">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalProducts}</span>
              <span className="stat-label">{t('admin.dashboard.totalProducts')}</span>
            </div>
          </div>
          <div className="stat-card orders">
            <div className="stat-icon">🛒</div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalOrders}</span>
              <span className="stat-label">{t('admin.dashboard.totalOrders')}</span>
            </div>
          </div>
          <div className="stat-card revenue highlight">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <span className="stat-value">€{(stats.totalRevenue || 0).toFixed(2)}</span>
              <span className="stat-label">{t('admin.dashboard.totalRevenue')}</span>
            </div>
          </div>
          {stats.pendingProducers > 0 && (
            <div className="stat-card pending alert">
              <div className="stat-icon">⚠️</div>
              <div className="stat-info">
                <span className="stat-value">{stats.pendingProducers}</span>
                <span className="stat-label">{t('admin.dashboard.pendingProducers')}</span>
              </div>
            </div>
          )}
        </div>

        <div className="dashboard-actions">
          <Link to="/admin/users" className="action-card">
            <span className="action-icon">👥</span>
            <span className="action-title">{t('admin.dashboard.manageUsers')}</span>
            <span className="action-desc">{t('admin.dashboard.manageUsersDesc')}</span>
          </Link>
          <Link to="/admin/producers" className="action-card">
            <span className="action-icon">🏪</span>
            <span className="action-title">{t('admin.dashboard.manageProducers')}</span>
            <span className="action-desc">{t('admin.dashboard.manageProducersDesc')}</span>
            {stats.pendingProducers > 0 && (
              <span className="action-badge">{stats.pendingProducers}</span>
            )}
          </Link>
          <Link to="/admin/orders" className="action-card">
            <span className="action-icon">📋</span>
            <span className="action-title">{t('admin.dashboard.manageOrders')}</span>
            <span className="action-desc">{t('admin.dashboard.manageOrdersDesc')}</span>
          </Link>
          <Link to="/admin/reports" className="action-card">
            <span className="action-icon">📊</span>
            <span className="action-title">{t('admin.dashboard.reports')}</span>
            <span className="action-desc">{t('admin.dashboard.reportsDesc')}</span>
          </Link>
          <Link to="/admin/contact" className="action-card">
            <span className="action-icon">📬</span>
            <span className="action-title">{t('admin.dashboard.contactMessages')}</span>
            <span className="action-desc">{t('admin.dashboard.contactMessagesDesc')}</span>
          </Link>
          <Link to="/admin/leads" className="action-card">
            <span className="action-icon">🎯</span>
            <span className="action-title">{t('admin.dashboard.producerLeads')}</span>
            <span className="action-desc">{t('admin.dashboard.producerLeadsDesc')}</span>
          </Link>
          <Link to="/admin/coupons" className="action-card">
            <span className="action-icon">🎟️</span>
            <span className="action-title">{t('admin.dashboard.coupons')}</span>
            <span className="action-desc">{t('admin.dashboard.couponsDesc')}</span>
          </Link>
          <Link to="/admin/products" className="action-card">
            <span className="action-icon">⭐</span>
            <span className="action-title">{t('admin.dashboard.products', 'Productos')}</span>
            <span className="action-desc">{t('admin.dashboard.productsDesc', 'Gestionar productos destacados')}</span>
          </Link>
          <Link to="/admin/blog" className="action-card">
            <span className="action-icon">📝</span>
            <span className="action-title">{t('admin.dashboard.blog')}</span>
            <span className="action-desc">{t('admin.dashboard.blogDesc')}</span>
          </Link>
        </div>

        {stats.ordersByStatus && Object.keys(stats.ordersByStatus).length > 0 && (
          <section className="orders-overview">
            <h2>{t('admin.dashboard.ordersOverview')}</h2>
            <div className="status-grid">
              {['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'].map(status => (
                <div key={status} className={`status-card ${getStatusClass(status)}`}>
                  <span className="status-count">{stats.ordersByStatus[status] || 0}</span>
                  <span className="status-name">
                    {t(`orders.status${status.charAt(0).toUpperCase() + status.slice(1)}`)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

