import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByProducer,
  checkStock,
  getFeaturedProducts,
  getLatestProducts,
  getBestsellerProducts,
  getRelatedProducts
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas - specific routes BEFORE parameterized routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/latest', getLatestProducts);
router.get('/bestsellers', getBestsellerProducts);
router.post('/check-stock', checkStock);
router.get('/producer/:producerId', getProductsByProducer);
router.get('/:id/related', getRelatedProducts);
router.get('/:id', getProductById);

// Rutas protegidas (requieren autenticación)
router.post('/', protect, authorize('producer', 'admin'), createProduct);
router.put('/:id', protect, authorize('producer', 'admin'), updateProduct);
router.delete('/:id', protect, authorize('producer', 'admin'), deleteProduct);

export default router;
