import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByProducer
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas
router.get('/', getProducts);
router.get('/producer/:producerId', getProductsByProducer);
router.get('/:id', getProductById);

// Rutas protegidas (requieren autenticación)
router.post('/', protect, authorize('producer', 'admin'), createProduct);
router.put('/:id', protect, authorize('producer', 'admin'), updateProduct);
router.delete('/:id', protect, authorize('producer', 'admin'), deleteProduct);

export default router;
