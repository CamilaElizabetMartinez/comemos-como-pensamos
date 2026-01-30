import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { PRODUCT_CATEGORIES } from '../../constants/products';
import './AdminLeads.css';

const STATUSES = ['new', 'contacted', 'interested', 'negotiating', 'registered', 'lost'];
const SOURCES = ['market', 'referral', 'event', 'social_media', 'website', 'association', 'other'];
const PRIORITIES = ['low', 'medium', 'high'];

const INITIAL_FORM_STATE = {
  name: '',
  businessName: '',
  phone: '',
  email: '',
  location: { city: '', market: '', address: '' },
  categories: [],
  source: 'market',
  priority: 'medium',
  estimatedVolume: '',
  nextFollowUp: '',
  notes: ''
};

const AdminLeads = () => {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({ byStatus: {}, overdueCount: 0 });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('active');
  const [selectedLead, setSelectedLead] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);
  
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchLeads();
  }, [user, navigate, activeFilter]);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      let statusFilter = '';
      if (activeFilter === 'active') {
        statusFilter = 'new,contacted,interested,negotiating';
      } else if (activeFilter !== 'all') {
        statusFilter = activeFilter;
      }

      const response = await api.get('/leads', {
        params: { status: statusFilter || undefined, limit: 100 }
      });

      if (response.data.success) {
        setLeads(response.data.data.leads || []);
        setStats({
          byStatus: response.data.statusCounts || {},
          overdueCount: response.data.overdueCount || 0
        });
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error(t('admin.leads.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [activeFilter, t]);

  const handleOpenModal = useCallback((lead = null) => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        businessName: lead.businessName || '',
        phone: lead.phone || '',
        email: lead.email || '',
        location: lead.location || { city: '', market: '', address: '' },
        categories: lead.categories || [],
        source: lead.source || 'market',
        priority: lead.priority || 'medium',
        estimatedVolume: lead.estimatedVolume || '',
        nextFollowUp: lead.nextFollowUp ? new Date(lead.nextFollowUp).toISOString().split('T')[0] : '',
        notes: ''
      });
      setSelectedLead(lead);
    } else {
      setFormData(INITIAL_FORM_STATE);
      setSelectedLead(null);
    }
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedLead(null);
    setFormData(INITIAL_FORM_STATE);
  }, []);

  const handleOpenDetail = useCallback((lead) => {
    setSelectedLead(lead);
    setIsDetailOpen(true);
    setNewNote('');
  }, []);

  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false);
    setSelectedLead(null);
    setNewNote('');
  }, []);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, [locationField]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleCategoryToggle = useCallback((category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(categoryItem => categoryItem !== category)
        : [...prev.categories, category]
    }));
  }, []);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    if (!formData.name.trim()) {
      toast.error(t('admin.leads.nameRequired'));
      return;
    }

    setSaving(true);
    try {
      if (selectedLead) {
        await api.put(`/leads/${selectedLead._id}`, formData);
        toast.success(t('admin.leads.updated'));
      } else {
        await api.post('/leads', formData);
        toast.success(t('admin.leads.created'));
      }
      handleCloseModal();
      fetchLeads();
    } catch (error) {
      console.error('Error saving lead:', error);
      toast.error(t('admin.leads.saveError'));
    } finally {
      setSaving(false);
    }
  }, [formData, selectedLead, handleCloseModal, fetchLeads, t]);

  const handleStatusChange = useCallback(async (leadId, newStatus, lostReason = null) => {
    try {
      await api.put(`/leads/${leadId}/status`, { 
        status: newStatus,
        lostReason 
      });
      
      setLeads(prev => prev.map(lead => 
        lead._id === leadId ? { ...lead, status: newStatus } : lead
      ));
      
      if (selectedLead?._id === leadId) {
        setSelectedLead(prev => ({ ...prev, status: newStatus }));
      }
      
      toast.success(t('admin.leads.statusUpdated'));
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(t('admin.leads.statusError'));
    }
  }, [selectedLead, t]);

  const handleAddNote = useCallback(async () => {
    if (!newNote.trim() || !selectedLead) return;

    try {
      const response = await api.post(`/leads/${selectedLead._id}/notes`, { 
        content: newNote 
      });
      
      if (response.data.success) {
        setSelectedLead(response.data.data.lead);
        setLeads(prev => prev.map(lead => 
          lead._id === selectedLead._id ? response.data.data.lead : lead
        ));
        setNewNote('');
        toast.success(t('admin.leads.noteAdded'));
      }
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error(t('admin.leads.noteError'));
    }
  }, [newNote, selectedLead, t]);

  const handleDelete = useCallback(async (leadId) => {
    if (!window.confirm(t('admin.leads.confirmDelete'))) return;

    try {
      await api.delete(`/leads/${leadId}`);
      setLeads(prev => prev.filter(lead => lead._id !== leadId));
      if (selectedLead?._id === leadId) {
        handleCloseDetail();
      }
      toast.success(t('admin.leads.deleted'));
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error(t('admin.leads.deleteError'));
    }
  }, [selectedLead, handleCloseDetail, t]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }, []);

  const isOverdue = useCallback((lead) => {
    if (!lead.nextFollowUp || ['registered', 'lost'].includes(lead.status)) return false;
    return new Date(lead.nextFollowUp) < new Date();
  }, []);

  const activeLeadsCount = useMemo(() => {
    const activeStatuses = ['new', 'contacted', 'interested', 'negotiating'];
    return activeStatuses.reduce((sum, status) => sum + (stats.byStatus[status] || 0), 0);
  }, [stats.byStatus]);

  const FILTER_OPTIONS = useMemo(() => [
    { value: 'active', label: t('admin.leads.filterActive'), count: activeLeadsCount },
    { value: 'new', label: t('admin.leads.statusNew'), count: stats.byStatus.new },
    { value: 'contacted', label: t('admin.leads.statusContacted'), count: stats.byStatus.contacted },
    { value: 'interested', label: t('admin.leads.statusInterested'), count: stats.byStatus.interested },
    { value: 'negotiating', label: t('admin.leads.statusNegotiating'), count: stats.byStatus.negotiating },
    { value: 'registered', label: t('admin.leads.statusRegistered'), count: stats.byStatus.registered },
    { value: 'lost', label: t('admin.leads.statusLost'), count: stats.byStatus.lost },
    { value: 'all', label: t('admin.leads.filterAll') }
  ], [t, stats.byStatus, activeLeadsCount]);

  if (loading && leads.length === 0) {
    return (
      <div className="admin-leads">
        <div className="container">
          <div className="loading">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-leads">
      <div className="container">
        <header className="page-header">
          <div className="header-left">
            <Link to="/admin" className="back-link">
              {t('admin.leads.backToDashboard')}
            </Link>
            <h1>{t('admin.leads.title')}</h1>
          </div>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            + {t('admin.leads.addLead')}
          </button>
        </header>

        {stats.overdueCount > 0 && (
          <div className="overdue-alert">
            <span className="alert-icon">⚠️</span>
            <span>{t('admin.leads.overdueAlert', { count: stats.overdueCount })}</span>
          </div>
        )}

        <div className="filters-bar">
          {FILTER_OPTIONS.map(filter => (
            <button
              key={filter.value}
              className={`filter-btn ${activeFilter === filter.value ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter.value)}
            >
              {filter.label}
              {filter.count !== undefined && (
                <span className="filter-count">{filter.count || 0}</span>
              )}
            </button>
          ))}
        </div>

        <div className="leads-section">
          {leads.length === 0 ? (
            <div className="no-leads">
              <span className="no-leads-icon">📋</span>
              <p>{t('admin.leads.noLeads')}</p>
              <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                {t('admin.leads.addFirst')}
              </button>
            </div>
          ) : (
            <div className="leads-list">
              {leads.map(lead => (
                <div 
                  key={lead._id} 
                  className={`lead-card ${isOverdue(lead) ? 'overdue' : ''}`}
                  onClick={() => handleOpenDetail(lead)}
                >
                  <div className="lead-header">
                    <div className="lead-info">
                      <h3>{lead.name}</h3>
                      {lead.businessName && (
                        <span className="business-name">{lead.businessName}</span>
                      )}
                    </div>
                    <span className={`status-badge status-${lead.status}`}>
                      {t(`admin.leads.status${lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}`)}
                    </span>
                  </div>
                  
                  <div className="lead-details">
                    {lead.location?.city && (
                      <span className="detail-item">📍 {lead.location.city}</span>
                    )}
                    {lead.location?.market && (
                      <span className="detail-item">🏪 {lead.location.market}</span>
                    )}
                    {lead.phone && (
                      <span className="detail-item">📱 {lead.phone}</span>
                    )}
                  </div>

                  <div className="lead-meta">
                    <span className={`source-tag source-${lead.source}`}>
                      {t(`admin.leads.source${lead.source.charAt(0).toUpperCase() + lead.source.slice(1).replace('_', '')}`)}
                    </span>
                    {lead.priority === 'high' && (
                      <span className="priority-tag high">🔥 {t('admin.leads.priorityHigh')}</span>
                    )}
                    {lead.nextFollowUp && (
                      <span className={`followup-tag ${isOverdue(lead) ? 'overdue' : ''}`}>
                        📅 {formatDate(lead.nextFollowUp)}
                      </span>
                    )}
                  </div>

                  {lead.categories?.length > 0 && (
                    <div className="lead-categories">
                      {lead.categories.slice(0, 3).map(cat => (
                        <span key={cat} className="category-tag">
                          {t(`categories.${cat}`)}
                        </span>
                      ))}
                      {lead.categories.length > 3 && (
                        <span className="category-more">+{lead.categories.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal for Create/Edit */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="lead-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedLead ? t('admin.leads.editLead') : t('admin.leads.addLead')}</h2>
                <button className="modal-close" onClick={handleCloseModal}>×</button>
              </div>
              
              <form onSubmit={handleSubmit} className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('admin.leads.name')} *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t('admin.leads.namePlaceholder')}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('admin.leads.businessName')}</label>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      placeholder={t('admin.leads.businessNamePlaceholder')}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t('admin.leads.phone')}</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+34 600 000 000"
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('admin.leads.email')}</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@ejemplo.com"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t('admin.leads.city')}</label>
                    <input
                      type="text"
                      name="location.city"
                      value={formData.location.city}
                      onChange={handleChange}
                      placeholder={t('admin.leads.cityPlaceholder')}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('admin.leads.market')}</label>
                    <input
                      type="text"
                      name="location.market"
                      value={formData.location.market}
                      onChange={handleChange}
                      placeholder={t('admin.leads.marketPlaceholder')}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t('admin.leads.source')}</label>
                    <select name="source" value={formData.source} onChange={handleChange}>
                      {SOURCES.map(source => (
                        <option key={source} value={source}>
                          {t(`admin.leads.source${source.charAt(0).toUpperCase() + source.slice(1).replace('_', '')}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t('admin.leads.priority')}</label>
                    <select name="priority" value={formData.priority} onChange={handleChange}>
                      {PRIORITIES.map(priority => (
                        <option key={priority} value={priority}>
                          {t(`admin.leads.priority${priority.charAt(0).toUpperCase() + priority.slice(1)}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>{t('admin.leads.categories')}</label>
                  <div className="categories-grid">
                    {PRODUCT_CATEGORIES.map(category => (
                      <label key={category} className="category-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.categories.includes(category)}
                          onChange={() => handleCategoryToggle(category)}
                        />
                        <span>{t(`categories.${category}`)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t('admin.leads.nextFollowUp')}</label>
                    <input
                      type="date"
                      name="nextFollowUp"
                      value={formData.nextFollowUp}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('admin.leads.estimatedVolume')}</label>
                    <input
                      type="text"
                      name="estimatedVolume"
                      value={formData.estimatedVolume}
                      onChange={handleChange}
                      placeholder={t('admin.leads.volumePlaceholder')}
                    />
                  </div>
                </div>

                {!selectedLead && (
                  <div className="form-group">
                    <label>{t('admin.leads.initialNote')}</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder={t('admin.leads.notePlaceholder')}
                      rows="3"
                    />
                  </div>
                )}

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

        {/* Detail Panel */}
        {isDetailOpen && selectedLead && (
          <div className="modal-overlay" onClick={handleCloseDetail}>
            <div className="detail-panel" onClick={e => e.stopPropagation()}>
              <div className="detail-header">
                <div>
                  <h2>{selectedLead.name}</h2>
                  {selectedLead.businessName && (
                    <p className="detail-business">{selectedLead.businessName}</p>
                  )}
                </div>
                <button className="modal-close" onClick={handleCloseDetail}>×</button>
              </div>

              <div className="detail-body">
                <div className="detail-section">
                  <h3>{t('admin.leads.status')}</h3>
                  <div className="status-buttons">
                    {STATUSES.map(status => (
                      <button
                        key={status}
                        className={`status-btn ${selectedLead.status === status ? 'active' : ''}`}
                        onClick={() => {
                          if (status === 'lost') {
                            const reason = window.prompt(t('admin.leads.lostReasonPrompt'));
                            if (reason !== null) handleStatusChange(selectedLead._id, status, reason);
                          } else {
                            handleStatusChange(selectedLead._id, status);
                          }
                        }}
                      >
                        {t(`admin.leads.status${status.charAt(0).toUpperCase() + status.slice(1)}`)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="detail-section">
                  <h3>{t('admin.leads.contactInfo')}</h3>
                  <div className="contact-info">
                    {selectedLead.phone && (
                      <a href={`tel:${selectedLead.phone}`} className="contact-link">
                        📱 {selectedLead.phone}
                      </a>
                    )}
                    {selectedLead.email && (
                      <a href={`mailto:${selectedLead.email}`} className="contact-link">
                        ✉️ {selectedLead.email}
                      </a>
                    )}
                    {selectedLead.phone && (
                      <a 
                        href={`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="contact-link whatsapp"
                      >
                        💬 WhatsApp
                      </a>
                    )}
                  </div>
                </div>

                {selectedLead.location && (
                  <div className="detail-section">
                    <h3>{t('admin.leads.location')}</h3>
                    <p>
                      {selectedLead.location.market && <span>🏪 {selectedLead.location.market}<br /></span>}
                      {selectedLead.location.city && <span>📍 {selectedLead.location.city}</span>}
                    </p>
                  </div>
                )}

                {selectedLead.categories?.length > 0 && (
                  <div className="detail-section">
                    <h3>{t('admin.leads.categories')}</h3>
                    <div className="detail-categories">
                      {selectedLead.categories.map(cat => (
                        <span key={cat} className="category-tag">{t(`categories.${cat}`)}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="detail-section">
                  <h3>{t('admin.leads.notes')} ({selectedLead.notes?.length || 0})</h3>
                  <div className="add-note">
                    <textarea
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      placeholder={t('admin.leads.addNotePlaceholder')}
                      rows="2"
                    />
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={handleAddNote}
                      disabled={!newNote.trim()}
                    >
                      {t('admin.leads.addNote')}
                    </button>
                  </div>
                  
                  {selectedLead.notes?.length > 0 && (
                    <div className="notes-list">
                      {[...selectedLead.notes].reverse().map((note, index) => (
                        <div key={index} className="note-item">
                          <p>{note.content}</p>
                          <span className="note-date">{formatDate(note.createdAt)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="detail-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      handleCloseDetail();
                      handleOpenModal(selectedLead);
                    }}
                  >
                    {t('common.edit')}
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDelete(selectedLead._id)}
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLeads;
