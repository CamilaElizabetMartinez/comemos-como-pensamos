import api from './api';

const isPushSupported = () => {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
};

const registerServiceWorker = async () => {
  if (!isPushSupported()) {
    throw new Error('Push notifications not supported');
  }

  const registration = await navigator.serviceWorker.register('/sw.js');
  return registration;
};

const getVapidPublicKey = async () => {
  try {
    const response = await api.get('/push/vapid-public-key');
    return response.data.data.publicKey;
  } catch (error) {
    console.error('Error getting VAPID key:', error);
    return null;
  }
};

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const subscribeToPush = async () => {
  try {
    const registration = await registerServiceWorker();
    const vapidPublicKey = await getVapidPublicKey();

    if (!vapidPublicKey) {
      throw new Error('VAPID public key not available');
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });

    // Send subscription to backend
    await api.post('/push/subscribe', { subscription: subscription.toJSON() });

    return subscription;
  } catch (error) {
    console.error('Error subscribing to push:', error);
    throw error;
  }
};

const unsubscribeFromPush = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await api.delete('/push/unsubscribe', {
        data: { endpoint: subscription.endpoint }
      });
      await subscription.unsubscribe();
    }

    return true;
  } catch (error) {
    console.error('Error unsubscribing from push:', error);
    throw error;
  }
};

const getSubscriptionStatus = async () => {
  try {
    if (!isPushSupported()) {
      return { supported: false, subscribed: false, permission: 'unsupported' };
    }

    if (!('Notification' in window)) {
      return { supported: false, subscribed: false, permission: 'unsupported' };
    }

    const permission = Notification.permission;
    
    let registration = await navigator.serviceWorker.getRegistration('/sw.js');
    
    if (!registration) {
      try {
        registration = await navigator.serviceWorker.register('/sw.js');
      } catch {
        return { supported: true, subscribed: false, permission };
      }
    }

    await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    return {
      supported: true,
      subscribed: !!subscription,
      permission
    };
  } catch {
    return { supported: false, subscribed: false, permission: 'error' };
  }
};

const requestNotificationPermission = async () => {
  if (!isPushSupported()) {
    return 'unsupported';
  }
  return await Notification.requestPermission();
};

const sendTestNotification = async () => {
  try {
    await api.post('/push/test');
    return true;
  } catch (error) {
    console.error('Error sending test notification:', error);
    throw error;
  }
};

export const pushService = {
  isPushSupported,
  registerServiceWorker,
  subscribeToPush,
  unsubscribeFromPush,
  getSubscriptionStatus,
  requestNotificationPermission,
  sendTestNotification
};


