import express from 'express';
import {
  sendVerification,
  verifyEmail,
  forgotPassword,
  resetPassword
} from '../controllers/emailController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas
router.get('/verify/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Rutas protegidas
router.post('/send-verification', protect, sendVerification);

export default router;
