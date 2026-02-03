import express from 'express';
import {
  getArticles,
  getArticleBySlug,
  getAdminArticles,
  getAdminArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  toggleArticleStatus,
  getCategories
} from '../controllers/articleController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getArticles);
router.get('/categories', getCategories);
router.get('/:slug', getArticleBySlug);

// Admin routes
router.get('/admin/list', protect, authorize('admin'), getAdminArticles);
router.get('/admin/:id', protect, authorize('admin'), getAdminArticleById);
router.post('/', protect, authorize('admin'), createArticle);
router.put('/:id', protect, authorize('admin'), updateArticle);
router.put('/:id/toggle-status', protect, authorize('admin'), toggleArticleStatus);
router.delete('/:id', protect, authorize('admin'), deleteArticle);

export default router;
