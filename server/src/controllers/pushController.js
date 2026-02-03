import webpush, { vapidPublicKey } from '../config/webpush.js';
import PushSubscription from '../models/PushSubscription.js';

// @desc    Get VAPID public key
// @route   GET /api/push/vapid-public-key
// @access  Public
export const getVapidPublicKey = async (req, res) => {
  res.status(200).json({
    success: true,
    data: { publicKey: vapidPublicKey || null }
  });
};

// @desc    Subscribe to push notifications
// @route   POST /api/push/subscribe
// @access  Private
export const subscribe = async (req, res) => {
  try {
    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({
        success: false,
        message: 'Suscripción inválida'
      });
    }

    // Check if subscription already exists
    let existingSub = await PushSubscription.findOne({
      'subscription.endpoint': subscription.endpoint
    });

    if (existingSub) {
      // Update existing subscription
      existingSub.userId = req.user._id;
      existingSub.subscription = subscription;
      existingSub.userAgent = req.headers['user-agent'];
      existingSub.isActive = true;
      await existingSub.save();
    } else {
      // Create new subscription
      existingSub = await PushSubscription.create({
        userId: req.user._id,
        subscription,
        userAgent: req.headers['user-agent']
      });
    }

    res.status(201).json({
      success: true,
      message: 'Suscripción guardada correctamente',
      data: { subscriptionId: existingSub._id }
    });
  } catch (error) {
    console.error('Error subscribing to push:', error);
    res.status(500).json({
      success: false,
      message: 'Error al guardar suscripción',
      error: error.message
    });
  }
};

// @desc    Unsubscribe from push notifications
// @route   DELETE /api/push/unsubscribe
// @access  Private
export const unsubscribe = async (req, res) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({
        success: false,
        message: 'Endpoint requerido'
      });
    }

    await PushSubscription.findOneAndDelete({
      userId: req.user._id,
      'subscription.endpoint': endpoint
    });

    res.status(200).json({
      success: true,
      message: 'Suscripción eliminada correctamente'
    });
  } catch (error) {
    console.error('Error unsubscribing from push:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar suscripción',
      error: error.message
    });
  }
};

// @desc    Check subscription status
// @route   GET /api/push/status
// @access  Private
export const getSubscriptionStatus = async (req, res) => {
  try {
    const subscriptions = await PushSubscription.find({
      userId: req.user._id,
      isActive: true
    });

    res.status(200).json({
      success: true,
      data: {
        isSubscribed: subscriptions.length > 0,
        subscriptionCount: subscriptions.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al verificar estado',
      error: error.message
    });
  }
};

// Helper function to send push notification to a user
export const sendPushToUser = async (userId, notification) => {
  try {
    const subscriptions = await PushSubscription.find({
      userId,
      isActive: true
    });

    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      icon: notification.icon || '/icon-192.png',
      badge: notification.badge || '/badge-72.png',
      data: notification.data || {},
      tag: notification.tag || 'default'
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(sub.subscription, payload);
          return { success: true, endpoint: sub.subscription.endpoint };
        } catch (error) {
          // If subscription is invalid, mark as inactive
          if (error.statusCode === 410 || error.statusCode === 404) {
            sub.isActive = false;
            await sub.save();
          }
          return { success: false, endpoint: sub.subscription.endpoint, error: error.message };
        }
      })
    );

    return results;
  } catch (error) {
    console.error('Error sending push to user:', error);
    throw error;
  }
};

// Helper function to send push notification to multiple users
export const sendPushToUsers = async (userIds, notification) => {
  const results = await Promise.allSettled(
    userIds.map(userId => sendPushToUser(userId, notification))
  );
  return results;
};

// @desc    Send test notification (for testing)
// @route   POST /api/push/test
// @access  Private
export const sendTestNotification = async (req, res) => {
  try {
    const results = await sendPushToUser(req.user._id, {
      title: '🔔 Notificación de prueba',
      body: '¡Las notificaciones push funcionan correctamente!',
      data: { url: '/' }
    });

    res.status(200).json({
      success: true,
      message: 'Notificación de prueba enviada',
      data: { results }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al enviar notificación',
      error: error.message
    });
  }
};











