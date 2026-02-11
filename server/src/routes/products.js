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
import { cacheMiddleware } from '../config/cache.js';

const router = express.Router();

// Rutas públicas con caché - specific routes BEFORE parameterized routes
router.get('/', cacheMiddleware(300), getProducts);                          // 5 min
router.get('/featured', cacheMiddleware(600), getFeaturedProducts);          // 10 min
router.get('/latest', cacheMiddleware(300), getLatestProducts);              // 5 min
router.get('/bestsellers', cacheMiddleware(3600), getBestsellerProducts);    // 1 hour
router.post('/check-stock', checkStock);                                     // No cache (POST)
router.get('/producer/:producerId', cacheMiddleware(300), getProductsByProducer); // 5 min
router.get('/:id/related', cacheMiddleware(600), getRelatedProducts);        // 10 min
router.get('/:id', cacheMiddleware(300), getProductById);                    // 5 min

// Rutas protegidas (requieren autenticación)
router.post('/', protect, authorize('producer', 'admin'), createProduct);
router.put('/:id', protect, authorize('producer', 'admin'), updateProduct);
router.delete('/:id', protect, authorize('producer', 'admin'), deleteProduct);

export default router;
