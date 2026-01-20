import express from 'express';
import {
  createCheckoutSession,
  handleWebhook,
  verifyPayment
} from '../controllers/stripeController.js';
import { protect, requireVerifiedEmail } from '../middleware/auth.js';

const router = express.Router();

// Webhook (el raw body parser está configurado a nivel de app)
router.post('/webhook', handleWebhook);

// Rutas protegidas
router.post('/create-checkout-session', protect, requireVerifiedEmail, createCheckoutSession);
router.get('/verify-payment/:sessionId', protect, verifyPayment);

export default router;

