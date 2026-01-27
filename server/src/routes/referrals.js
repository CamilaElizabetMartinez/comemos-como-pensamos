import express from 'express';
import {
  validateReferralCode,
  getMyReferrals,
  getReferralStats
} from '../controllers/referralController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/validate/:code', validateReferralCode);

router.use(protect);

router.get('/my-referrals', authorize('producer'), getMyReferrals);

router.get('/stats', authorize('admin'), getReferralStats);

export default router;
