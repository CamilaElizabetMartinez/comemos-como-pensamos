import express from 'express';
import {
  createContactMessage,
  getContactMessages,
  getContactMessage,
  updateContactStatus,
  deleteContactMessage
} from '../controllers/contactController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public route - anyone can send a contact message
router.post('/', createContactMessage);

// Admin routes
router.get('/', protect, authorize('admin'), getContactMessages);
router.get('/:id', protect, authorize('admin'), getContactMessage);
router.put('/:id', protect, authorize('admin'), updateContactStatus);
router.delete('/:id', protect, authorize('admin'), deleteContactMessage);

export default router;

