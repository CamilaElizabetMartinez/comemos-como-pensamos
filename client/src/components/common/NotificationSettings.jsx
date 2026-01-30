import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { pushService } from '../../services/pushService';
import { IconPackage, IconCart, IconAward } from './Icons';
import './NotificationSettings.css';

const NotificationSettings = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({
    supported: false,
    subscribed: false,
    permission: 'default'
  });

  const checkStatus = useCallback(async () => {
    const currentStatus = await pushService.getSubscriptionStatus();
    setStatus(currentStatus);
    setLoading(false);
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const handleToggleNotifications = async () => {
    setLoading(true);
    
    try {
      if (status.subscribed) {
        // Unsubscribe
        await pushService.unsubscribeFromPush();
        toast.success(t('notifications.unsubscribed'));
      } else {
        // Request permission and subscribe
        const permission = await pushService.requestNotificationPermission();
        
        if (permission === 'granted') {
          await pushService.subscribeToPush();
          toast.success(t('notifications.subscribed'));
        } else if (permission === 'denied') {
          toast.error(t('notifications.permissionDenied'));
        }
      }
      
      await checkStatus();
    } catch (error) {
      console.error('Error toggling notifications:', error);
      toast.error(t('notifications.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await pushService.sendTestNotification();
      toast.info(t('notifications.testSent'));
    } catch (error) {
      toast.error(t('notifications.testError'));
    }
  };

  if (!status.supported) {
    return (
      <div className="notification-settings">
        <div className="notification-header">
          <span className="notification-icon">🔔</span>
          <h3>{t('notifications.title')}</h3>
        </div>
        <p className="notification-unsupported">
          {t('notifications.notSupported')}
        </p>
        <p className="notification-debug" style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.5rem' }}>
          Debug: {status.permission || 'unknown'} | 
          Secure: {window.isSecureContext ? 'yes' : 'no'} | 
          Protocol: {window.location.protocol}
        </p>
      </div>
    );
  }

  return (
    <div className="notification-settings">
      <div className="notification-header">
        <span className="notification-icon">🔔</span>
        <div>
          <h3>{t('notifications.title')}</h3>
          <p>{t('notifications.description')}</p>
        </div>
      </div>

      <div className="notification-status">
        <div className="status-info">
          <span className={`status-badge ${status.subscribed ? 'active' : 'inactive'}`}>
            {status.subscribed ? t('notifications.active') : t('notifications.inactive')}
          </span>
          {status.permission === 'denied' && (
            <span className="permission-warning">
              ⚠️ {t('notifications.blockedInBrowser')}
            </span>
          )}
        </div>

        <div className="notification-actions">
          <button
            className={`btn-notification ${status.subscribed ? 'btn-disable' : 'btn-enable'}`}
            onClick={handleToggleNotifications}
            disabled={loading || status.permission === 'denied'}
          >
            {loading ? (
              <span className="spinner-small"></span>
            ) : status.subscribed ? (
              t('notifications.disable')
            ) : (
              t('notifications.enable')
            )}
          </button>

          {status.subscribed && (
            <button
              className="btn-test"
              onClick={handleTestNotification}
              disabled={loading}
            >
              {t('notifications.sendTest')}
            </button>
          )}
        </div>
      </div>

      <div className="notification-info">
        <p>{t('notifications.infoText')}</p>
        <ul>
          <li><IconPackage size={16} /> {t('notifications.orderUpdates')}</li>
          <li><IconCart size={16} /> {t('notifications.newProducts')}</li>
          <li><IconAward size={16} /> {t('notifications.promotions')}</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationSettings;


