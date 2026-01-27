import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { ListSkeleton } from '../../components/common/Skeleton';
import './ProducerShipping.css';

const ProducerShipping = () => {
  const { t } = useTranslation();
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    postalCodes: '',
    cities: '',
    cost: '',
    minimumOrder: '',
    estimatedDays: ''
  });

  const fetchZones = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/shipping/zones/my');
      setZones(response.data.data.shippingZones);
    } catch (error) {
      toast.error(t('producer.shipping.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  const resetForm = () => {
    setFormData({
      name: '',
      postalCodes: '',
      cities: '',
      cost: '',
      minimumOrder: '',
      estimatedDays: ''
    });
    setEditingZone(null);
    setShowForm(false);
  };

  const handleEdit = (zone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      postalCodes: zone.postalCodes?.join(', ') || '',
      cities: zone.cities?.join(', ') || '',
      cost: zone.cost.toString(),
      minimumOrder: zone.minimumOrder?.toString() || '0',
      estimatedDays: zone.estimatedDays || ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      name: formData.name,
      postalCodes: formData.postalCodes ? formData.postalCodes.split(',').map(code => code.trim()) : [],
      cities: formData.cities ? formData.cities.split(',').map(city => city.trim()) : [],
      cost: parseFloat(formData.cost),
      minimumOrder: parseFloat(formData.minimumOrder) || 0,
      estimatedDays: formData.estimatedDays
    };

    try {
      if (editingZone) {
        await api.put(`/shipping/zones/${editingZone._id}`, payload);
        toast.success(t('producer.shipping.zoneUpdated'));
      } else {
        await api.post('/shipping/zones', payload);
        toast.success(t('producer.shipping.zoneCreated'));
      }
      resetForm();
      fetchZones();
    } catch (error) {
      toast.error(error.response?.data?.message || t('producer.shipping.errorSaving'));
    }
  };

  const handleDelete = async (zoneId) => {
    if (!window.confirm(t('producer.shipping.confirmDelete'))) return;

    try {
      await api.delete(`/shipping/zones/${zoneId}`);
      toast.success(t('producer.shipping.zoneDeleted'));
      fetchZones();
    } catch (error) {
      toast.error(t('producer.shipping.errorDeleting'));
    }
  };

  const handleToggleActive = async (zone) => {
    try {
      await api.put(`/shipping/zones/${zone._id}`, { isActive: !zone.isActive });
      toast.success(zone.isActive ? t('producer.shipping.zoneDisabled') : t('producer.shipping.zoneEnabled'));
      fetchZones();
    } catch (error) {
      toast.error(t('producer.shipping.errorUpdating'));
    }
  };

  return (
    <div className="producer-shipping-page">
      <div className="container">
        <div className="shipping-header">
          <div>
            <Link to="/producer" className="back-link">
              {t('producer.shipping.backToDashboard')}
            </Link>
            <h1>{t('producer.shipping.title')}</h1>
            <p className="subtitle">{t('producer.shipping.subtitle')}</p>
          </div>
          <button 
            className="btn-add-zone"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? (
              t('common.cancel')
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                {t('producer.shipping.addZone')}
              </>
            )}
          </button>
        </div>

        {showForm && (
          <div className="shipping-form-card">
            <h2>{editingZone ? t('producer.shipping.editZone') : t('producer.shipping.newZone')}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{t('producer.shipping.zoneName')} *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('producer.shipping.zoneNamePlaceholder')}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t('producer.shipping.postalCodes')}</label>
                  <input
                    type="text"
                    value={formData.postalCodes}
                    onChange={(e) => setFormData({ ...formData, postalCodes: e.target.value })}
                    placeholder={t('producer.shipping.postalCodesPlaceholder')}
                  />
                  <small>{t('producer.shipping.postalCodesHelp')}</small>
                </div>

                <div className="form-group">
                  <label>{t('producer.shipping.cities')}</label>
                  <input
                    type="text"
                    value={formData.cities}
                    onChange={(e) => setFormData({ ...formData, cities: e.target.value })}
                    placeholder={t('producer.shipping.citiesPlaceholder')}
                  />
                  <small>{t('producer.shipping.citiesHelp')}</small>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t('producer.shipping.cost')} (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    placeholder="5.00"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t('producer.shipping.minimumOrder')} (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minimumOrder}
                    onChange={(e) => setFormData({ ...formData, minimumOrder: e.target.value })}
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label>{t('producer.shipping.estimatedDays')}</label>
                  <input
                    type="text"
                    value={formData.estimatedDays}
                    onChange={(e) => setFormData({ ...formData, estimatedDays: e.target.value })}
                    placeholder={t('producer.shipping.estimatedDaysPlaceholder')}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingZone ? t('common.save') : t('producer.shipping.createZone')}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="zones-section">
          <h2>{t('producer.shipping.myZones')}</h2>
          
          {loading ? (
            <ListSkeleton type="order" count={3} />
          ) : zones.length === 0 ? (
            <div className="no-zones">
              <div className="no-zones-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <p>{t('producer.shipping.noZones')}</p>
              <p className="no-zones-hint">{t('producer.shipping.noZonesHint')}</p>
            </div>
          ) : (
            <div className="zones-list">
              {zones.map((zone) => (
                <div key={zone._id} className={`zone-card ${!zone.isActive ? 'inactive' : ''}`}>
                  <div className="zone-header">
                    <h3>{zone.name}</h3>
                    <span className={`zone-status ${zone.isActive ? 'active' : 'inactive'}`}>
                      {zone.isActive ? t('producer.shipping.active') : t('producer.shipping.inactive')}
                    </span>
                  </div>

                  <div className="zone-details">
                    {zone.postalCodes?.length > 0 && (
                      <div className="zone-detail">
                        <span className="detail-label">{t('producer.shipping.postalCodes')}</span>
                        <span className="detail-value">{zone.postalCodes.join(', ')}</span>
                      </div>
                    )}
                    {zone.cities?.length > 0 && (
                      <div className="zone-detail">
                        <span className="detail-label">{t('producer.shipping.cities')}</span>
                        <span className="detail-value">{zone.cities.join(', ')}</span>
                      </div>
                    )}
                    <div className="zone-detail">
                      <span className="detail-label">{t('producer.shipping.cost')}</span>
                      <span className="detail-value price">€{zone.cost.toFixed(2)}</span>
                    </div>
                    {zone.minimumOrder > 0 && (
                      <div className="zone-detail">
                        <span className="detail-label">{t('producer.shipping.minimumOrder')}</span>
                        <span className="detail-value">€{zone.minimumOrder.toFixed(2)}</span>
                      </div>
                    )}
                    {zone.estimatedDays && (
                      <div className="zone-detail">
                        <span className="detail-label">{t('producer.shipping.estimatedDays')}</span>
                        <span className="detail-value">{zone.estimatedDays}</span>
                      </div>
                    )}
                  </div>

                  <div className="zone-actions">
                    <button 
                      className="btn-sm btn-secondary"
                      onClick={() => handleToggleActive(zone)}
                    >
                      {zone.isActive ? t('producer.shipping.disable') : t('producer.shipping.enable')}
                    </button>
                    <button 
                      className="btn-sm btn-secondary"
                      onClick={() => handleEdit(zone)}
                    >
                      {t('common.edit')}
                    </button>
                    <button 
                      className="btn-sm btn-danger"
                      onClick={() => handleDelete(zone._id)}
                    >
                      {t('common.delete')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProducerShipping;




