import express from 'express';
import {
  getProducers,
  getProducerById,
  createProducer,
  updateProducer,
  getProducerStats,
  getMyProducerProfile
} from '../controllers/producerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas
router.get('/', getProducers);
router.get('/:id', getProducerById);

// Rutas protegidas
router.post('/', protect, authorize('producer', 'admin'), createProducer);
router.get('/my/profile', protect, authorize('producer', 'admin'), getMyProducerProfile);
router.put('/:id', protect, updateProducer);
router.get('/:id/stats', protect, getProducerStats);

export default router;
