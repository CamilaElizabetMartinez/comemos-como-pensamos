import express from 'express';
import {
  subscribeNewsletter,
  unsubscribeNewsletter,
  getSubscriptions
} from '../controllers/newsletterController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/subscribe', subscribeNewsletter);
router.post('/unsubscribe', unsubscribeNewsletter);

// Admin routes
router.get('/', protect, authorize('admin'), getSubscriptions);

export default router;
