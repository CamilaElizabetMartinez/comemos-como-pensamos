import express from 'express';
import {
  getVapidPublicKey,
  subscribe,
  unsubscribe,
  getSubscriptionStatus,
  sendTestNotification
} from '../controllers/pushController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public route
router.get('/vapid-public-key', getVapidPublicKey);

// Protected routes
router.post('/subscribe', protect, subscribe);
router.delete('/unsubscribe', protect, unsubscribe);
router.get('/status', protect, getSubscriptionStatus);
router.post('/test', protect, sendTestNotification);

export default router;

