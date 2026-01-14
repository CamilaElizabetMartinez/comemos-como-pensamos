import express from 'express';
import {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  checkFavorite
} from '../controllers/favoritesController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

router.get('/', getFavorites);
router.get('/check/:productId', checkFavorite);
router.post('/:productId', addToFavorites);
router.delete('/:productId', removeFromFavorites);

export default router;
