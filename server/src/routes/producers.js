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

// Rutas protegidas (DEBEN ir ANTES de /:id)
router.get('/me', protect, authorize('producer', 'admin'), getMyProducerProfile);
router.get('/my/profile', protect, authorize('producer', 'admin'), getMyProducerProfile);
router.post('/', protect, authorize('producer', 'admin'), createProducer);

// Rutas con parámetros (DEBEN ir AL FINAL)
router.get('/:id', getProducerById);
router.put('/:id', protect, updateProducer);
router.get('/:id/stats', protect, getProducerStats);

export default router;
