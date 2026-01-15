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

// Rutas de productores (DEBEN ir ANTES de /:id)
router.get('/producer/orders', authorize('producer', 'admin'), getProducerOrders);

// Rutas con parámetros (DEBEN ir AL FINAL)
router.get('/:id', getOrderById);
router.put('/:id/status', authorize('producer', 'admin'), updateOrderStatus);

export default router;
