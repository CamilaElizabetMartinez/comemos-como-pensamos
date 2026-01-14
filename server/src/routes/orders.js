import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getProducerOrders
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

// Rutas de clientes
router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);

// Rutas de productores
router.get('/producer/orders', authorize('producer', 'admin'), getProducerOrders);
router.put('/:id/status', authorize('producer', 'admin'), updateOrderStatus);

export default router;
