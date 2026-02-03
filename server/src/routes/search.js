import express from 'express';
import {
  searchProducts,
  getSearchSuggestions,
  searchProducers
} from '../controllers/searchController.js';

const router = express.Router();

// Todas las rutas son públicas
router.get('/products', searchProducts);
router.get('/suggestions', getSearchSuggestions);
router.get('/producers', searchProducers);

export default router;
