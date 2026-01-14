import express from 'express';
import {
  createShippingZone,
  getProducerShippingZones,
  calculateShipping,
  updateShippingZone,
  deleteShippingZone
} from '../controllers/shippingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas
router.get('/zones/producer/:producerId', getProducerShippingZones);
router.post('/calculate', calculateShipping);

// Rutas protegidas
router.post('/zones', protect, authorize('producer', 'admin'), createShippingZone);
router.put('/zones/:id', protect, authorize('producer', 'admin'), updateShippingZone);
router.delete('/zones/:id', protect, authorize('producer', 'admin'), deleteShippingZone);

export default router;
