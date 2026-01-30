import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  logout,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.post('/logout', protect, logout);
router.post('/resend-verification', protect, resendVerification);

export default router;
