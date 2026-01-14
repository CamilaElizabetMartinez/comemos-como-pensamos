import express from 'express';
import {
  createReview,
  getProductReviews,
  getProducerReviews,
  deleteReview,
  updateReview
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas
router.get('/product/:productId', getProductReviews);
router.get('/producer/:producerId', getProducerReviews);

// Rutas protegidas
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

export default router;
