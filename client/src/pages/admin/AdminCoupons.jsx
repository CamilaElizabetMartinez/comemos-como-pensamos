import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import ConfirmModal from '../../components/common/ConfirmModal';
import './AdminCoupons.css';

const INITIAL_FORM_STATE = {
  code: '',
  description: '',
  discountType: 'percentage',
  discountValue: 10,
  minOrderAmount: 0,
  maxDiscountAmount: '',
  isFirstOrderOnly: false,
  validFrom: '',
  validUntil: '',
  maxUses: '',
  maxUsesPerUser: 1
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, couponId: null });
  
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchCoupons();
  }, [user, navigate]);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeFilter !== 'all') {
        params.isActive = activeFilter === 'active';
      }
      
      const response = await api.get('/coupons', { params });
      
      if (response.data.success) {
        setCoupons(response.data.data.coupons || []);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error(t('admin.coupons.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [activeFilter, t]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchCoupons();
    }
  }, [activeFilter, fetchCoupons, user]);

  const handleOpenModal = useCallback((coupon = null) => {
    if (coupon) {
      setFormData({
        code: coupon.code,
        description: coupon.description || '',
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderAmount: coupon.minOrderAmount || 0,
        maxDiscountAmount: coupon.maxDiscountAmount || '',
        isFirstOrderOnly: coupon.isFirstOrderOnly || false,
        validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().split('T')[0] : '',
        validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : '',
        maxUses: coupon.maxUses || '',
        maxUsesPerUser: coupon.maxUsesPerUser || 1
      });
      setSelectedCoupon(coupon);
    } else {
      setFormData(INITIAL_FORM_STATE);
      setSelectedCoupon(null);
    }
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedCoupon(null);
    setFormData(INITIAL_FORM_STATE);
  }, []);

  const handleChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  const generateCode = useCallback(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code }));
  }, []);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    
    if (!formData.code.trim()) {
      toast.error(t('admin.coupons.codeRequired'));
      return;
    }
    
    if (formData.discountValue <= 0) {
      toast.error(t('admin.coupons.valueRequired'));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        discountValue: parseFloat(formData.discountValue),
        minOrderAmount: parseFloat(formData.minOrderAmount) || 0,
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        maxUsesPerUser: parseInt(formData.maxUsesPerUser) || 1
      };

      if (selectedCoupon) {
        await api.put(`/coupons/${selectedCoupon._id}`, payload);
        toast.success(t('admin.coupons.updated'));
      } else {
        await api.post('/coupons', payload);
        toast.success(t('admin.coupons.created'));
      }
      
      handleCloseModal();
      fetchCoupons();
    } catch (error) {
      console.error('Error saving coupon:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(t('admin.coupons.saveError'));
      }
    } finally {
      setSaving(false);
    }
  }, [formData, selectedCoupon, handleCloseModal, fetchCoupons, t]);

  const handleToggleActive = useCallback(async (coupon) => {
    try {
      await api.put(`/coupons/${coupon._id}`, { isActive: !coupon.isActive });
      setCoupons(prev => prev.map(couponItem => 
        couponItem._id === coupon._id 
          ? { ...couponItem, isActive: !couponItem.isActive }
          : couponItem
      ));
      toast.success(coupon.isActive ? t('admin.coupons.deactivated') : t('admin.coupons.activated'));
    } catch (error) {
      toast.error(t('admin.coupons.toggleError'));
    }
  }, [t]);

  const openDeleteModal = useCallback((couponId) => {
    setDeleteModal({ isOpen: true, couponId });
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteModal({ isOpen: false, couponId: null });
  }, []);

  const handleDelete = useCallback(async () => {
    const { couponId } = deleteModal;
    closeDeleteModal();

    try {
      await api.delete(`/coupons/${couponId}`);
      setCoupons(prev => prev.filter(coupon => coupon._id !== couponId));
      toast.success(t('admin.coupons.deleted'));
    } catch (error) {
      toast.error(t('admin.coupons.deleteError'));
    }
  }, [deleteModal, closeDeleteModal, t]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }, []);

  const isExpired = useCallback((coupon) => {
    if (!coupon.validUntil) return false;
    return new Date(coupon.validUntil) < new Date();
  }, []);

  const filteredCoupons = useMemo(() => {
    if (activeFilter === 'all') return coupons;
    if (activeFilter === 'active') return coupons.filter(coupon => coupon.isActive && !isExpired(coupon));
    if (activeFilter === 'inactive') return coupons.filter(coupon => !coupon.isActive || isExpired(coupon));
    return coupons;
  }, [coupons, activeFilter, isExpired]);

  if (loading) {
    return (
      <div className="admin-coupons">
        <div className="container">
          <div className="loading">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-coupons">
      <div className="container">
        <header className="page-header">
          <div className="header-left">
            <Link to="/admin" className="back-link">
              {t('admin.coupons.backToDashboard')}
            </Link>
            <h1>{t('admin.coupons.title')}</h1>
          </div>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            + {t('admin.coupons.addCoupon')}
          </button>
        </header>

        <div className="filters-bar">
          <button
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            {t('admin.coupons.filterAll')} ({coupons.length})
          </button>
          <button
            className={`filter-btn ${activeFilter === 'active' ? 'active' : ''}`}
            onClick={() => setActiveFilter('active')}
          >
            {t('admin.coupons.filterActive')}
          </button>
          <button
            className={`filter-btn ${activeFilter === 'inactive' ? 'active' : ''}`}
            onClick={() => setActiveFilter('inactive')}
          >
            {t('admin.coupons.filterInactive')}
          </button>
        </div>

        <div className="coupons-section">
          {filteredCoupons.length === 0 ? (
            <div className="no-coupons">
              <span className="no-coupons-icon">🎟️</span>
              <p>{t('admin.coupons.noCoupons')}</p>
              <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                {t('admin.coupons.createFirst')}
              </button>
            </div>
          ) : (
            <div className="coupons-list">
              {filteredCoupons.map(coupon => (
                <div 
                  key={coupon._id} 
                  className={`coupon-card ${!coupon.isActive || isExpired(coupon) ? 'inactive' : ''}`}
                >
                  <div className="coupon-header">
                    <div className="coupon-code">{coupon.code}</div>
                    <span className={`status-badge ${coupon.isActive && !isExpired(coupon) ? 'active' : 'inactive'}`}>
                      {coupon.isActive && !isExpired(coupon) 
                        ? t('admin.coupons.statusActive') 
                        : isExpired(coupon) 
                          ? t('admin.coupons.statusExpired')
                          : t('admin.coupons.statusInactive')}
                    </span>
                  </div>

                  {coupon.description && (
                    <p className="coupon-description">{coupon.description}</p>
                  )}

                  <div className="coupon-value">
                    {coupon.discountType === 'percentage' 
                      ? `${coupon.discountValue}% ${t('admin.coupons.off')}`
                      : `${coupon.discountValue}€ ${t('admin.coupons.off')}`
                    }
                  </div>

                  <div className="coupon-details">
                    {coupon.minOrderAmount > 0 && (
                      <span className="detail-tag">
                        {t('admin.coupons.minOrder')}: {coupon.minOrderAmount}€
                      </span>
                    )}
                    {coupon.isFirstOrderOnly && (
                      <span className="detail-tag first-order">
                        {t('admin.coupons.firstOrderOnly')}
                      </span>
                    )}
                    {coupon.maxUses && (
                      <span className="detail-tag">
                        {t('admin.coupons.uses')}: {coupon.usedCount}/{coupon.maxUses}
                      </span>
                    )}
                    {!coupon.maxUses && (
                      <span className="detail-tag">
                        {t('admin.coupons.uses')}: {coupon.usedCount}
                      </span>
                    )}
                  </div>

                  {coupon.validUntil && (
                    <div className="coupon-validity">
                      {t('admin.coupons.validUntil')}: {formatDate(coupon.validUntil)}
                    </div>
                  )}

                  <div className="coupon-actions">
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleOpenModal(coupon)}
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      className={`btn btn-sm ${coupon.isActive ? 'btn-warning' : 'btn-success'}`}
                      onClick={() => handleToggleActive(coupon)}
                    >
                      {coupon.isActive ? t('admin.coupons.deactivate') : t('admin.coupons.activate')}
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => openDeleteModal(coupon._id)}
                    >
                      {t('common.delete')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isModalOpen && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="coupon-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedCoupon ? t('admin.coupons.editCoupon') : t('admin.coupons.addCoupon')}</h2>
                <button className="modal-close" onClick={handleCloseModal}>×</button>
              </div>

              <form onSubmit={handleSubmit} className="modal-body">
                <div className="form-row">
                  <div className="form-group code-group">
                    <label>{t('admin.coupons.code')} *</label>
                    <div className="code-input-wrapper">
                      <input
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        placeholder="BIENVENIDO10"
                        disabled={!!selectedCoupon}
                        className="code-input"
                      />
                      {!selectedCoupon && (
                        <button type="button" className="btn btn-generate" onClick={generateCode}>
                          {t('admin.coupons.generate')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>{t('admin.coupons.description')}</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder={t('admin.coupons.descriptionPlaceholder')}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t('admin.coupons.discountType')} *</label>
                    <select name="discountType" value={formData.discountType} onChange={handleChange}>
                      <option value="percentage">{t('admin.coupons.percentage')}</option>
                      <option value="fixed">{t('admin.coupons.fixedAmount')}</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t('admin.coupons.discountValue')} *</label>
                    <div className="input-with-suffix">
                      <input
                        type="number"
                        name="discountValue"
                        value={formData.discountValue}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                      />
                      <span className="input-suffix">
                        {formData.discountType === 'percentage' ? '%' : '€'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t('admin.coupons.minOrderAmount')}</label>
                    <div className="input-with-suffix">
                      <input
                        type="number"
                        name="minOrderAmount"
                        value={formData.minOrderAmount}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                      />
                      <span className="input-suffix">€</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>{t('admin.coupons.maxDiscount')}</label>
                    <div className="input-with-suffix">
                      <input
                        type="number"
                        name="maxDiscountAmount"
                        value={formData.maxDiscountAmount}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        placeholder={t('admin.coupons.noLimit')}
                      />
                      <span className="input-suffix">€</span>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t('admin.coupons.validFrom')}</label>
                    <input
                      type="date"
                      name="validFrom"
                      value={formData.validFrom}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('admin.coupons.validUntilLabel')}</label>
                    <input
                      type="date"
                      name="validUntil"
                      value={formData.validUntil}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t('admin.coupons.maxUses')}</label>
                    <input
                      type="number"
                      name="maxUses"
                      value={formData.maxUses}
                      onChange={handleChange}
                      min="0"
                      placeholder={t('admin.coupons.unlimited')}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('admin.coupons.maxUsesPerUser')}</label>
                    <input
                      type="number"
                      name="maxUsesPerUser"
                      value={formData.maxUsesPerUser}
                      onChange={handleChange}
                      min="1"
                    />
                  </div>
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isFirstOrderOnly"
                      checked={formData.isFirstOrderOnly}
                      onChange={handleChange}
                    />
                    <span>{t('admin.coupons.isFirstOrderOnly')}</span>
                  </label>
                  <p className="form-hint">{t('admin.coupons.firstOrderHint')}</p>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                    {t('common.cancel')}
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? t('common.loading') : t('common.save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDelete}
          title={t('admin.coupons.confirmDeleteTitle', '¿Eliminar cupón?')}
          message={t('admin.coupons.confirmDelete', 'Esta acción no se puede deshacer.')}
          confirmText={t('common.delete', 'Eliminar')}
          cancelText={t('common.cancel', 'Cancelar')}
          variant="danger"
        />
      </div>
    </div>
  );
};

export default AdminCoupons;
