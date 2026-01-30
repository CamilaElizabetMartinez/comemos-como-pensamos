import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { TableSkeleton } from '../../components/common/Skeleton';
import { IconCheckCircle, IconStar, IconStore, IconLocation, IconCheck, IconX, IconTrash, IconPause, IconPlay } from '../../components/common/Icons';
import InputModal from '../../components/common/InputModal';
import ConfirmModal from '../../components/common/ConfirmModal';
import './AdminProducers.css';

const INITIAL_COMMISSION_STATE = {
  commissionRate: 15,
  specialCommissionRate: '',
  specialCommissionUntil: ''
};

const AdminProducers = () => {
  const [producers, setProducers] = useState([]);
  const [pendingProducers, setPendingProducers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [commissionModal, setCommissionModal] = useState({
    isOpen: false,
    producer: null
  });
  const [commissionForm, setCommissionForm] = useState(INITIAL_COMMISSION_STATE);
  const [savingCommission, setSavingCommission] = useState(false);
  const [rejectModal, setRejectModal] = useState({ isOpen: false, producerId: null });
  const [suspendModal, setSuspendModal] = useState({ isOpen: false, producer: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, producer: null });
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
      setPendingProducers(pendingProducers.filter(producerItem => producerItem._id !== producerId));
      toast.success(t('admin.producers.approved'));
      fetchProducers();
    } catch (error) {
      toast.error(t('admin.producers.approveError'));
    }
  };

  const openRejectModal = useCallback((producerId) => {
    setRejectModal({ isOpen: true, producerId });
  }, []);

  const closeRejectModal = useCallback(() => {
    setRejectModal({ isOpen: false, producerId: null });
  }, []);

  const handleReject = useCallback(async (reason) => {
    const { producerId } = rejectModal;
    closeRejectModal();

    try {
      await api.put(`/admin/producers/${producerId}/reject`, { reason });
      setPendingProducers(prev => prev.filter(producerItem => producerItem._id !== producerId));
      toast.success(t('admin.producers.rejected'));
    } catch (error) {
      toast.error(t('admin.producers.rejectError'));
    }
  }, [rejectModal, closeRejectModal, t]);

  const openSuspendModal = useCallback((producer) => {
    setSuspendModal({ isOpen: true, producer });
  }, []);

  const closeSuspendModal = useCallback(() => {
    setSuspendModal({ isOpen: false, producer: null });
  }, []);

  const handleSuspend = useCallback(async (reason) => {
    const { producer } = suspendModal;
    closeSuspendModal();

    try {
      const response = await api.put(`/admin/producers/${producer._id}/suspend`, { reason });
      setProducers(prev => prev.map(producerItem => 
        producerItem._id === producer._id 
          ? { ...producerItem, isSuspended: response.data.data.producer.isSuspended }
          : producerItem
      ));
      toast.success(response.data.message);
    } catch (error) {
      console.error('Error suspending producer:', error);
      toast.error(t('admin.producers.suspendError', 'Error al suspender productor'));
    }
  }, [suspendModal, closeSuspendModal, t]);

  const handleToggleSuspend = useCallback(async (producer) => {
    if (producer.isSuspended) {
      try {
        const response = await api.put(`/admin/producers/${producer._id}/suspend`);
        setProducers(prev => prev.map(producerItem => 
          producerItem._id === producer._id 
            ? { ...producerItem, isSuspended: false }
            : producerItem
        ));
        toast.success(response.data.message);
      } catch (error) {
        console.error('Error reactivating producer:', error);
        toast.error(t('admin.producers.reactivateError', 'Error al reactivar productor'));
      }
    } else {
      openSuspendModal(producer);
    }
  }, [openSuspendModal, t]);

  const openDeleteModal = useCallback((producer) => {
    setDeleteModal({ isOpen: true, producer });
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteModal({ isOpen: false, producer: null });
  }, []);

  const handleDelete = useCallback(async () => {
    const { producer } = deleteModal;
    closeDeleteModal();

    try {
      await api.delete(`/admin/producers/${producer._id}`);
      setProducers(prev => prev.filter(producerItem => producerItem._id !== producer._id));
      toast.success(t('admin.producers.deleted', 'Productor eliminado permanentemente'));
    } catch (error) {
      console.error('Error deleting producer:', error);
      toast.error(t('admin.producers.deleteError', 'Error al eliminar productor'));
    }
  }, [deleteModal, closeDeleteModal, t]);

  const openCommissionModal = useCallback((producer) => {
    setCommissionForm({
      commissionRate: producer.commissionRate ?? 15,
      specialCommissionRate: producer.specialCommissionRate ?? '',
      specialCommissionUntil: producer.specialCommissionUntil 
        ? new Date(producer.specialCommissionUntil).toISOString().split('T')[0] 
        : ''
    });
    setCommissionModal({ isOpen: true, producer });
  }, []);

  const closeCommissionModal = useCallback(() => {
    setCommissionModal({ isOpen: false, producer: null });
    setCommissionForm(INITIAL_COMMISSION_STATE);
  }, []);

  const handleCommissionChange = useCallback((event) => {
    const { name, value } = event.target;
    setCommissionForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSaveCommission = useCallback(async () => {
    if (!commissionModal.producer) return;
    
    setSavingCommission(true);
    try {
      const payload = {
        commissionRate: parseFloat(commissionForm.commissionRate) || 15
      };

      if (commissionForm.specialCommissionRate !== '' && commissionForm.specialCommissionUntil) {
        payload.specialCommissionRate = parseFloat(commissionForm.specialCommissionRate);
        payload.specialCommissionUntil = commissionForm.specialCommissionUntil;
      } else {
        payload.specialCommissionRate = null;
        payload.specialCommissionUntil = null;
      }

      await api.put(`/admin/producers/${commissionModal.producer._id}/commission`, payload);
      
      setProducers(prev => prev.map(producerItem => 
        producerItem._id === commissionModal.producer._id 
          ? { 
              ...producerItem, 
              commissionRate: payload.commissionRate,
              specialCommissionRate: payload.specialCommissionRate,
              specialCommissionUntil: payload.specialCommissionUntil
            }
          : producerItem
      ));

      toast.success(t('admin.producers.commissionUpdated'));
      closeCommissionModal();
    } catch (error) {
      console.error('Error updating commission:', error);
      toast.error(t('admin.producers.commissionError'));
    } finally {
      setSavingCommission(false);
    }
  }, [commissionModal.producer, commissionForm, closeCommissionModal, t]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCurrentCommission = useCallback((producer) => {
    if (producer.specialCommissionRate !== undefined && 
        producer.specialCommissionRate !== null &&
        producer.specialCommissionUntil && 
        new Date(producer.specialCommissionUntil) > new Date()) {
      return producer.specialCommissionRate;
    }
    return producer.commissionRate ?? 15;
  }, []);

  if (loading) {
    return (
      <div className="admin-producers">
        <div className="container">
          <TableSkeleton />
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
              {t('admin.producers.backToDashboard')}
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
                <span className="check-icon"><IconCheckCircle size={48} /></span>
                <p>{t('admin.producers.noPending')}</p>
              </div>
            ) : (
              <div className="pending-list">
                {pendingProducers.map((producer) => (
                  <div key={producer._id} className="producer-card pending">
                    <div className="producer-header">
                      <div className="producer-logo">
                        {producer.logo ? (
                          <img src={producer.logo} alt={producer.businessName} loading="lazy" />
                        ) : (
                          <IconStore size={40} />
                        )}
                      </div>
                      <div className="producer-info">
                        <h3>{producer.businessName}</h3>
                        <p className="producer-location">
                          <IconLocation size={14} /> {producer.location?.city}, {producer.location?.country}
                        </p>
                        <p className="producer-date">
                          {t('admin.producers.requestedOn')} {formatDate(producer.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    {producer.description?.es && (
                      <p className="producer-description">{producer.description.es}</p>
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
                        <IconCheck size={16} /> {t('admin.producers.approve')}
                      </button>
                      <button
                        onClick={() => openRejectModal(producer._id)}
                        className="btn btn-reject"
                      >
                        <IconX size={16} /> {t('admin.producers.reject')}
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
                          <img src={producer.logo} alt={producer.businessName} loading="lazy" />
                        ) : (
                          <IconStore size={40} />
                        )}
                      </div>
                      <div className="producer-info">
                        <h3>{producer.businessName}</h3>
                        <p className="producer-location">
                          <IconLocation size={14} /> {producer.location?.city}
                        </p>
                      </div>
                      <span className={`status-badge ${producer.isSuspended ? 'suspended' : producer.isApproved ? 'approved' : 'pending'}`}>
                        {producer.isSuspended 
                          ? t('admin.producers.statusSuspended', 'Suspendido')
                          : producer.isApproved 
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
                        <span className="stat-value"><IconStar size={14} /> {producer.rating?.toFixed(1) || '-'}</span>
                        <span className="stat-label">{t('admin.producers.rating')}</span>
                      </div>
                      <div className="stat commission-stat">
                        <span className="stat-value">{getCurrentCommission(producer)}%</span>
                        <span className="stat-label">{t('admin.producers.commission')}</span>
                      </div>
                    </div>

                    <div className="producer-card-actions">
                      <button
                        onClick={() => openCommissionModal(producer)}
                        className="btn btn-commission"
                        type="button"
                      >
                        {t('admin.producers.editCommission')}
                      </button>
                      <button
                        onClick={() => handleToggleSuspend(producer)}
                        className={`btn btn-suspend ${producer.isSuspended ? 'reactivate' : ''}`}
                        type="button"
                        title={producer.isSuspended 
                          ? t('admin.producers.reactivate', 'Reactivar') 
                          : t('admin.producers.suspend', 'Suspender')}
                      >
                        {producer.isSuspended ? <IconPlay size={16} /> : <IconPause size={16} />}
                      </button>
                      <button
                        onClick={() => openDeleteModal(producer)}
                        className="btn btn-delete"
                        type="button"
                        title={t('admin.producers.delete', 'Eliminar')}
                      >
                        <IconTrash size={16} />
                      </button>
                      <Link 
                        to={`/producers/${producer._id}`} 
                        className="view-profile-link"
                      >
                        {t('admin.producers.viewProfile')} →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {commissionModal.isOpen && commissionModal.producer && (
          <div className="modal-overlay" onClick={closeCommissionModal}>
            <div className="commission-modal" onClick={(event) => event.stopPropagation()}>
              <div className="modal-header">
                <h2>{t('admin.producers.editCommissionTitle')}</h2>
                <button className="modal-close" onClick={closeCommissionModal}>×</button>
              </div>
              
              <div className="modal-body">
                <p className="modal-producer-name">{commissionModal.producer.businessName}</p>
                
                <div className="form-group">
                  <label>{t('admin.producers.standardCommission')}</label>
                  <div className="input-with-suffix">
                    <input
                      type="number"
                      name="commissionRate"
                      value={commissionForm.commissionRate}
                      onChange={handleCommissionChange}
                      min="0"
                      max="100"
                      step="0.5"
                    />
                    <span className="input-suffix">%</span>
                  </div>
                  <p className="form-hint">{t('admin.producers.standardCommissionHint')}</p>
                </div>

                <div className="form-divider">
                  <span>{t('admin.producers.specialOffer')}</span>
                </div>

                <div className="form-group">
                  <label>{t('admin.producers.specialCommission')}</label>
                  <div className="input-with-suffix">
                    <input
                      type="number"
                      name="specialCommissionRate"
                      value={commissionForm.specialCommissionRate}
                      onChange={handleCommissionChange}
                      min="0"
                      max="100"
                      step="0.5"
                      placeholder="0"
                    />
                    <span className="input-suffix">%</span>
                  </div>
                </div>

                <div className="form-group">
                  <label>{t('admin.producers.specialCommissionUntil')}</label>
                  <input
                    type="date"
                    name="specialCommissionUntil"
                    value={commissionForm.specialCommissionUntil}
                    onChange={handleCommissionChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <p className="form-hint">{t('admin.producers.specialCommissionHint')}</p>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  className="btn btn-secondary" 
                  onClick={closeCommissionModal}
                  disabled={savingCommission}
                >
                  {t('common.cancel')}
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleSaveCommission}
                  disabled={savingCommission}
                >
                  {savingCommission ? t('common.loading') : t('common.save')}
                </button>
              </div>
            </div>
          </div>
        )}

        <InputModal
          isOpen={rejectModal.isOpen}
          onClose={closeRejectModal}
          onConfirm={handleReject}
          title={t('admin.producers.rejectTitle', 'Rechazar productor')}
          message={t('admin.producers.rejectMessage', 'Indica el motivo del rechazo')}
          placeholder={t('admin.producers.rejectReason', 'Motivo del rechazo...')}
          confirmText={t('common.reject', 'Rechazar')}
          cancelText={t('common.cancel', 'Cancelar')}
        />

        <InputModal
          isOpen={suspendModal.isOpen}
          onClose={closeSuspendModal}
          onConfirm={handleSuspend}
          title={t('admin.producers.suspendTitle', 'Suspender productor')}
          message={t('admin.producers.suspendMessage', 'Indica el motivo de la suspensión (opcional)')}
          placeholder={t('admin.producers.suspendReason', 'Motivo de la suspensión...')}
          confirmText={t('admin.producers.suspend', 'Suspender')}
          cancelText={t('common.cancel', 'Cancelar')}
          required={false}
        />

        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDelete}
          title={t('admin.producers.deleteTitle', 'Eliminar productor')}
          message={t('admin.producers.deleteMessage', `¿Estás seguro de eliminar a "${deleteModal.producer?.businessName}"? Esta acción eliminará también todos sus productos y es irreversible.`)}
          confirmText={t('common.delete', 'Eliminar')}
          cancelText={t('common.cancel', 'Cancelar')}
          variant="danger"
        />
      </div>
    </div>
  );
};

export default AdminProducers;

