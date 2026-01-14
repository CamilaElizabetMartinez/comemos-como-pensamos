import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  getPendingProducers,
  approveProducer,
  rejectProducer,
  moderateProduct,
  getAllOrders,
  deleteUser,
  getSalesReport
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación y rol de admin
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Usuarios
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

// Productores
router.get('/producers/pending', getPendingProducers);
router.put('/producers/:id/approve', approveProducer);
router.put('/producers/:id/reject', rejectProducer);

// Productos
router.put('/products/:id/moderate', moderateProduct);

// Órdenes
router.get('/orders', getAllOrders);

// Reportes
router.get('/reports/sales', getSalesReport);

export default router;
