import express from 'express';
import {
  downloadSalesReportPDF,
  downloadSalesReportExcel,
  downloadProductsReportExcel,
  downloadUsersReportExcel
} from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Sales reports (Admin and Producer)
router.get('/sales/pdf', protect, authorize('admin', 'producer'), downloadSalesReportPDF);
router.get('/sales/excel', protect, authorize('admin', 'producer'), downloadSalesReportExcel);

// Products report (Admin and Producer)
router.get('/products/excel', protect, authorize('admin', 'producer'), downloadProductsReportExcel);

// Users report (Admin only)
router.get('/users/excel', protect, authorize('admin'), downloadUsersReportExcel);

export default router;

