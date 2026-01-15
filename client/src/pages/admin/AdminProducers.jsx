import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './AdminProducers.css';

const AdminProducers = () => {
  const [producers, setProducers] = useState([]);
  const [pendingProducers, setPendingProducers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchProducers();
  }, [user, navigate]);

  const fetchProducers = async () => {
    setLoading(true);
    try {
      const [pendingRes, allRes] = await Promise.all([
        api.get('/admin/producers/pending'),
        api.get('/producers')
      ]);

      if (pendingRes.data.success) {
        setPendingProducers(pendingRes.data.data.producers || []);
      }
      if (allRes.data.success) {
        setProducers(allRes.data.data.producers || []);
      }
    } catch (error) {
      console.error('Error fetching producers:', error);
      toast.error(t('admin.producers.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (producerId) => {
    try {
      await api.put(`/admin/producers/${producerId}/approve`);
      setPendingProducers(pendingProducers.filter(p => p._id !== producerId));
      toast.success(t('admin.producers.approved'));
      fetchProducers();
    } catch (error) {
      toast.error(t('admin.producers.approveError'));
    }
  };

  const handleReject = async (producerId, businessName) => {
    const reason = window.prompt(t('admin.producers.rejectReason'));
    if (reason === null) return;

    try {
      await api.put(`/admin/producers/${producerId}/reject`, { reason });
      setPendingProducers(pendingProducers.filter(p => p._id !== producerId));
      toast.success(t('admin.producers.rejected'));
    } catch (error) {
      toast.error(t('admin.producers.rejectError'));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="admin-producers">
        <div className="container">
          <div className="loading">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-producers">
      <div className="container">
        <header className="page-header">
          <div className="header-left">
            <Link to="/admin" className="back-link">
              ← {t('admin.producers.backToDashboard')}
            </Link>
            <h1>{t('admin.producers.title')}</h1>
          </div>
        </header>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            {t('admin.producers.pendingTab')}
            {pendingProducers.length > 0 && (
              <span className="tab-badge">{pendingProducers.length}</span>
            )}
          </button>
          <button
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            {t('admin.producers.allTab')} ({producers.length})
          </button>
        </div>

        {activeTab === 'pending' && (
          <div className="producers-section">
            {pendingProducers.length === 0 ? (
              <div className="no-producers">
                <span className="check-icon">✅</span>
                <p>{t('admin.producers.noPending')}</p>
              </div>
            ) : (
              <div className="pending-list">
                {pendingProducers.map((producer) => (
                  <div key={producer._id} className="producer-card pending">
                    <div className="producer-header">
                      <div className="producer-logo">
                        {producer.logo ? (
                          <img src={producer.logo} alt={producer.businessName} />
                        ) : (
                          <span>🏪</span>
                        )}
                      </div>
                      <div className="producer-info">
                        <h3>{producer.businessName}</h3>
                        <p className="producer-location">
                          📍 {producer.location?.city}, {producer.location?.country}
                        </p>
                        <p className="producer-date">
                          {t('admin.producers.requestedOn')} {formatDate(producer.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    {producer.description && (
                      <p className="producer-description">{producer.description}</p>
                    )}

                    <div className="producer-details">
                      <div className="detail-item">
                        <span className="detail-label">{t('admin.producers.contact')}:</span>
                        <span>{producer.userId?.firstName} {producer.userId?.lastName}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">{t('admin.producers.email')}:</span>
                        <span>{producer.userId?.email}</span>
                      </div>
                      {producer.phone && (
                        <div className="detail-item">
                          <span className="detail-label">{t('admin.producers.phone')}:</span>
                          <span>{producer.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="producer-actions">
                      <button
                        onClick={() => handleApprove(producer._id)}
                        className="btn btn-approve"
                      >
                        ✓ {t('admin.producers.approve')}
                      </button>
                      <button
                        onClick={() => handleReject(producer._id, producer.businessName)}
                        className="btn btn-reject"
                      >
                        ✕ {t('admin.producers.reject')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'all' && (
          <div className="producers-section">
            {producers.length === 0 ? (
              <div className="no-producers">
                <p>{t('admin.producers.noProducers')}</p>
              </div>
            ) : (
              <div className="producers-grid">
                {producers.map((producer) => (
                  <div key={producer._id} className="producer-card">
                    <div className="producer-header">
                      <div className="producer-logo">
                        {producer.logo ? (
                          <img src={producer.logo} alt={producer.businessName} />
                        ) : (
                          <span>🏪</span>
                        )}
                      </div>
                      <div className="producer-info">
                        <h3>{producer.businessName}</h3>
                        <p className="producer-location">
                          📍 {producer.location?.city}
                        </p>
                      </div>
                      <span className={`status-badge ${producer.isApproved ? 'approved' : 'pending'}`}>
                        {producer.isApproved 
                          ? t('admin.producers.statusApproved') 
                          : t('admin.producers.statusPending')}
                      </span>
                    </div>
                    
                    <div className="producer-stats">
                      <div className="stat">
                        <span className="stat-value">{producer.totalProducts || 0}</span>
                        <span className="stat-label">{t('admin.producers.products')}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">⭐ {producer.rating?.toFixed(1) || '-'}</span>
                        <span className="stat-label">{t('admin.producers.rating')}</span>
                      </div>
                    </div>

                    <Link 
                      to={`/producers/${producer._id}`} 
                      className="view-profile-link"
                    >
                      {t('admin.producers.viewProfile')} →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducers;

