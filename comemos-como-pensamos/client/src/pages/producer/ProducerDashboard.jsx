import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { DashboardSkeleton } from '../../components/common/Skeleton';
import './ProducerDashboard.css';

const ProducerDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalOrders: 0,
    grossRevenue: 0,
    totalCommission: 0,
    netRevenue: 0,
    currentCommissionRate: 15,
    specialCommissionRate: null,
    specialCommissionUntil: null,
    rating: 0,
    totalReviews: 0,
    recentOrders: []
  });
  const [referralData, setReferralData] = useState({
    referralCode: '',
    referralCount: 0,
    referrals: [],
    referredBy: null
  });
  const [loading, setLoading] = useState(true);
  const [codeCopied, setCodeCopied] = useState(false);
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
      const producerRes = await api.get('/producers/me');
      
      if (!producerRes.data.success || !producerRes.data.data.producer) {
        navigate('/producer/setup');
        return;
      }

      const producer = producerRes.data.data.producer;
      
      const [ordersRes, statsRes, referralsRes] = await Promise.all([
        api.get('/orders/producer/orders?limit=5'),
        api.get(`/producers/${producer._id}/stats`),
        api.get('/referrals/my-referrals').catch(() => ({ data: { success: false } }))
      ]);

      const orders = ordersRes.data.data?.orders || [];
      const producerStats = statsRes.data.data?.stats || {};

      setStats({
        totalProducts: producerStats.totalProducts || 0,
        activeProducts: producerStats.activeProducts || 0,
        pendingOrders: producerStats.pendingOrders || 0,
        completedOrders: producerStats.completedOrders || 0,
        totalOrders: producerStats.totalOrders || 0,
        grossRevenue: parseFloat(producerStats.grossRevenue) || 0,
        totalCommission: parseFloat(producerStats.totalCommission) || 0,
        netRevenue: parseFloat(producerStats.netRevenue) || 0,
        currentCommissionRate: producerStats.currentCommissionRate ?? 15,
        specialCommissionRate: producerStats.specialCommissionRate,
        specialCommissionUntil: producerStats.specialCommissionUntil,
        rating: producerStats.rating || 0,
        totalReviews: producerStats.totalReviews || 0,
        recentOrders: orders
      });

      if (referralsRes.data.success) {
        setReferralData({
          referralCode: referralsRes.data.data.referralCode || '',
          referralCount: referralsRes.data.data.referralCount || 0,
          referrals: referralsRes.data.data.referrals || [],
          referredBy: referralsRes.data.data.referredBy
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 404) {
        navigate('/producer/setup');
        return;
      }
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const hasSpecialCommission = stats.specialCommissionRate !== null && 
    stats.specialCommissionRate !== undefined && 
    stats.specialCommissionUntil && 
    new Date(stats.specialCommissionUntil) > new Date();

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralData.referralCode);
    setCodeCopied(true);
    toast.success(t('producer.referrals.codeCopied'));
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const shareReferralLink = () => {
    const referralLink = `${window.location.origin}/register?ref=${referralData.referralCode}`;
    
    if (navigator.share) {
      navigator.share({
        title: t('producer.referrals.shareTitle'),
        text: t('producer.referrals.shareText'),
        url: referralLink
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(referralLink);
      toast.success(t('producer.referrals.linkCopied'));
    }
  };

  const shareViaWhatsApp = () => {
    const referralLink = `${window.location.origin}/register?ref=${referralData.referralCode}`;
    const message = encodeURIComponent(`${t('producer.referrals.whatsappMessage')} ${referralLink}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  if (loading) {
    return (
      <div className="producer-dashboard">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="producer-dashboard">
      <div className="container">
        <header className="dashboard-header">
          <Link to="/" className="back-link">
            {t('common.backToHome')}
          </Link>
          <h1>{t('producer.dashboard.title')}</h1>
          <p className="welcome-message">
            {t('producer.dashboard.welcome')}, {user?.firstName}!
          </p>
        </header>

        {hasSpecialCommission && (
          <div className="commission-banner">
            <span className="commission-banner-icon">🎉</span>
            <div className="commission-banner-content">
              <div className="commission-banner-title">
                {t('producer.dashboard.specialCommissionActive')}
              </div>
              <div className="commission-banner-text">
                {t('producer.dashboard.specialCommissionInfo', { 
                  rate: stats.specialCommissionRate,
                  date: formatDate(stats.specialCommissionUntil)
                })}
              </div>
            </div>
          </div>
        )}

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalProducts}</span>
              <span className="stat-label">{t('producer.dashboard.totalProducts')}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.activeProducts}</span>
              <span className="stat-label">{t('producer.dashboard.activeProducts')}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.pendingOrders}</span>
              <span className="stat-label">{t('producer.dashboard.pendingOrders')}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.completedOrders}</span>
              <span className="stat-label">{t('producer.dashboard.completedOrders')}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">€{stats.grossRevenue.toFixed(2)}</span>
              <span className="stat-label">{t('producer.dashboard.grossRevenue')}</span>
            </div>
          </div>
          <div className="stat-card commission-card">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">-€{stats.totalCommission.toFixed(2)}</span>
              <span className="stat-label">{t('producer.dashboard.platformCommission')} ({stats.currentCommissionRate}%)</span>
            </div>
          </div>
          <div className="stat-card highlight-card">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">€{stats.netRevenue.toFixed(2)}</span>
              <span className="stat-label">{t('producer.dashboard.netRevenue')}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.rating > 0 ? stats.rating.toFixed(1) : '-'}</span>
              <span className="stat-label">{t('producer.dashboard.rating')} ({stats.totalReviews})</span>
            </div>
          </div>
        </div>

        <div className="dashboard-actions">
          <Link to="/producer/products" className="action-card">
            <span className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </span>
            <div className="action-content">
              <span className="action-title">{t('producer.dashboard.manageProducts')}</span>
              <span className="action-desc">{t('producer.dashboard.manageProductsDesc')}</span>
            </div>
          </Link>
          <Link to="/producer/products/new" className="action-card">
            <span className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </span>
            <div className="action-content">
              <span className="action-title">{t('producer.dashboard.addProduct')}</span>
              <span className="action-desc">{t('producer.dashboard.addProductDesc')}</span>
            </div>
          </Link>
          <Link to="/producer/orders" className="action-card">
            <span className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </span>
            <div className="action-content">
              <span className="action-title">{t('producer.dashboard.viewOrders')}</span>
              <span className="action-desc">{t('producer.dashboard.viewOrdersDesc')}</span>
            </div>
          </Link>
          <Link to="/producer/reports" className="action-card">
            <span className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </span>
            <div className="action-content">
              <span className="action-title">{t('producer.dashboard.reports')}</span>
              <span className="action-desc">{t('producer.dashboard.reportsDesc')}</span>
            </div>
          </Link>
          <Link to="/producer/shipping" className="action-card">
            <span className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </span>
            <div className="action-content">
              <span className="action-title">{t('producer.dashboard.shippingZones')}</span>
              <span className="action-desc">{t('producer.dashboard.shippingZonesDesc')}</span>
            </div>
          </Link>
        </div>

        {referralData.referralCode && (
          <section className="referral-section">
            <div className="section-header">
              <h2>{t('producer.referrals.title')}</h2>
            </div>
            
            <div className="referral-content">
              <div className="referral-code-card">
                <div className="referral-code-header">
                  <span className="referral-icon">🎁</span>
                  <span>{t('producer.referrals.yourCode')}</span>
                </div>
                <div className="referral-code-display">
                  <span className="code">{referralData.referralCode}</span>
                  <button 
                    className={`btn-copy ${codeCopied ? 'copied' : ''}`}
                    onClick={copyReferralCode}
                  >
                    {codeCopied ? '✓' : t('producer.referrals.copy')}
                  </button>
                </div>
                <p className="referral-hint">{t('producer.referrals.shareHint')}</p>
                
                <div className="referral-share-buttons">
                  <button className="btn-share btn-whatsapp" onClick={shareViaWhatsApp}>
                    <span className="share-icon">📱</span>
                    {t('producer.referrals.shareWhatsApp')}
                  </button>
                  <button className="btn-share btn-link" onClick={shareReferralLink}>
                    <span className="share-icon">🔗</span>
                    {t('producer.referrals.shareLink')}
                  </button>
                </div>
              </div>

              <div className="referral-stats-card">
                <div className="referral-stat">
                  <span className="referral-stat-value">{referralData.referralCount}</span>
                  <span className="referral-stat-label">{t('producer.referrals.referredCount')}</span>
                </div>
                <div className="referral-bonus-info">
                  <span className="bonus-icon">💰</span>
                  <span>{t('producer.referrals.bonusInfo')}</span>
                </div>
              </div>
            </div>

            {referralData.referrals.length > 0 && (
              <div className="referrals-list">
                <h3>{t('producer.referrals.yourReferrals')}</h3>
                <ul>
                  {referralData.referrals.slice(0, 5).map((referral) => (
                    <li key={referral._id}>
                      <span className="referral-name">{referral.businessName}</span>
                      <span className={`referral-status ${referral.isApproved ? 'approved' : 'pending'}`}>
                        {referral.isApproved 
                          ? t('producer.referrals.statusApproved') 
                          : t('producer.referrals.statusPending')}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

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

