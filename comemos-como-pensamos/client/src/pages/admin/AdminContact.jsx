import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { ListSkeleton } from '../../components/common/Skeleton';
import './AdminContact.css';

const STATUS_CONFIG = {
  pending: { label: 'Pendiente', color: '#ff9800', icon: '📬' },
  read: { label: 'Leído', color: '#2196f3', icon: '📖' },
  replied: { label: 'Respondido', color: '#4caf50', icon: '✅' },
  archived: { label: 'Archivado', color: '#9e9e9e', icon: '📁' }
};

const AdminContact = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [adminNotes, setAdminNotes] = useState('');

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: currentPage, limit: 15 });
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`/contact?${params}`);
      setMessages(response.data.data.messages);
      setTotalPages(response.data.data.pagination.pages);
    } catch (error) {
      toast.error(t('admin.contact.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, t]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSelectMessage = async (message) => {
    setSelectedMessage(message);
    setAdminNotes(message.adminNotes || '');
    
    if (message.status === 'pending') {
      try {
        await api.get(`/contact/${message._id}`);
        fetchMessages();
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
  };

  const handleUpdateStatus = async (messageId, newStatus) => {
    try {
      await api.put(`/contact/${messageId}`, { 
        status: newStatus,
        adminNotes 
      });
      toast.success(t('admin.contact.statusUpdated'));
      fetchMessages();
      if (selectedMessage?._id === messageId) {
        setSelectedMessage(prev => ({ ...prev, status: newStatus, adminNotes }));
      }
    } catch (error) {
      toast.error(t('admin.contact.errorUpdating'));
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedMessage) return;
    try {
      await api.put(`/contact/${selectedMessage._id}`, { adminNotes });
      toast.success(t('admin.contact.notesSaved'));
      setSelectedMessage(prev => ({ ...prev, adminNotes }));
    } catch (error) {
      toast.error(t('admin.contact.errorSavingNotes'));
    }
  };

  const handleDelete = async (messageId) => {
    if (!window.confirm(t('admin.contact.confirmDelete'))) return;
    
    try {
      await api.delete(`/contact/${messageId}`);
      toast.success(t('admin.contact.deleted'));
      if (selectedMessage?._id === messageId) {
        setSelectedMessage(null);
      }
      fetchMessages();
    } catch (error) {
      toast.error(t('admin.contact.errorDeleting'));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUnreadCount = () => messages.filter(m => m.status === 'pending').length;

  return (
    <div className="admin-contact-page">
      <div className="contact-header">
        <div className="header-title">
          <h1>📬 {t('admin.contact.title')}</h1>
          {getUnreadCount() > 0 && (
            <span className="unread-badge">{getUnreadCount()} nuevos</span>
          )}
        </div>
        
        <div className="contact-filters">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="status-filter"
          >
            <option value="">{t('admin.contact.allMessages')}</option>
            <option value="pending">{t('admin.contact.pending')}</option>
            <option value="read">{t('admin.contact.read')}</option>
            <option value="replied">{t('admin.contact.replied')}</option>
            <option value="archived">{t('admin.contact.archived')}</option>
          </select>
        </div>
      </div>

      <div className="contact-layout">
        <div className="messages-list-panel">
          {loading ? (
            <ListSkeleton type="order" count={5} />
          ) : messages.length === 0 ? (
            <div className="no-messages">
              <span className="no-messages-icon">📭</span>
              <p>{t('admin.contact.noMessages')}</p>
            </div>
          ) : (
            <>
              <div className="messages-list">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`message-item ${selectedMessage?._id === message._id ? 'selected' : ''} ${message.status === 'pending' ? 'unread' : ''}`}
                    onClick={() => handleSelectMessage(message)}
                  >
                    <div className="message-item-header">
                      <span className="message-sender">{message.name}</span>
                      <span 
                        className="message-status-dot"
                        style={{ backgroundColor: STATUS_CONFIG[message.status]?.color }}
                        title={STATUS_CONFIG[message.status]?.label}
                      />
                    </div>
                    <div className="message-subject">{message.subject}</div>
                    <div className="message-preview">
                      {message.message.substring(0, 80)}...
                    </div>
                    <div className="message-date">{formatDate(message.createdAt)}</div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="btn btn-pagination"
                  >
                    ←
                  </button>
                  <span>{currentPage} / {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="btn btn-pagination"
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="message-detail-panel">
          {selectedMessage ? (
            <div className="message-detail">
              <div className="detail-header">
                <div className="detail-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: STATUS_CONFIG[selectedMessage.status]?.color }}
                  >
                    {STATUS_CONFIG[selectedMessage.status]?.icon} {STATUS_CONFIG[selectedMessage.status]?.label}
                  </span>
                </div>
                <button 
                  className="btn btn-delete"
                  onClick={() => handleDelete(selectedMessage._id)}
                >
                  🗑️
                </button>
              </div>

              <div className="detail-meta">
                <div className="meta-row">
                  <span className="meta-label">{t('admin.contact.from')}:</span>
                  <span className="meta-value">{selectedMessage.name}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">{t('admin.contact.email')}:</span>
                  <a href={`mailto:${selectedMessage.email}`} className="meta-value email-link">
                    {selectedMessage.email}
                  </a>
                </div>
                <div className="meta-row">
                  <span className="meta-label">{t('admin.contact.date')}:</span>
                  <span className="meta-value">{formatDate(selectedMessage.createdAt)}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">{t('admin.contact.subject')}:</span>
                  <span className="meta-value subject">{selectedMessage.subject}</span>
                </div>
              </div>

              <div className="detail-message">
                <h3>{t('admin.contact.message')}</h3>
                <div className="message-content">
                  {selectedMessage.message}
                </div>
              </div>

              <div className="detail-notes">
                <h3>{t('admin.contact.adminNotes')}</h3>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={t('admin.contact.notesPlaceholder')}
                  rows={3}
                />
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={handleSaveNotes}
                >
                  {t('admin.contact.saveNotes')}
                </button>
              </div>

              <div className="detail-actions">
                <h3>{t('admin.contact.changeStatus')}</h3>
                <div className="status-buttons">
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                    <button
                      key={status}
                      className={`btn btn-status ${selectedMessage.status === status ? 'active' : ''}`}
                      style={{ 
                        borderColor: config.color,
                        backgroundColor: selectedMessage.status === status ? config.color : 'transparent',
                        color: selectedMessage.status === status ? 'white' : config.color
                      }}
                      onClick={() => handleUpdateStatus(selectedMessage._id, status)}
                    >
                      {config.icon} {config.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="detail-reply">
                <a 
                  href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                  className="btn btn-primary btn-reply"
                >
                  ✉️ {t('admin.contact.replyByEmail')}
                </a>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <span className="no-selection-icon">👈</span>
              <p>{t('admin.contact.selectMessage')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminContact;


