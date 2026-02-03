import express from 'express';
import {
  createPaymentIntent,
  stripeWebhook,
  getPaymentStatus
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Webhook de Stripe (debe estar antes del middleware express.json())
// Esta ruta necesita el raw body para verificar la signature
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Rutas protegidas
router.post('/create-payment-intent', protect, createPaymentIntent);
router.get('/order/:orderId/status', protect, getPaymentStatus);

export default router;
