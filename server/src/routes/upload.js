import express from 'express';
import {
  uploadSingleImage,
  uploadMultipleImagesController,
  deleteImageController
} from '../controllers/uploadController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadSingle, uploadMultiple, handleMulterError } from '../middleware/upload.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

// Subir una imagen
router.post('/image', uploadSingle, handleMulterError, uploadSingleImage);

// Subir múltiples imágenes
router.post('/multiple', uploadMultiple, handleMulterError, uploadMultipleImagesController);

// Eliminar imagen
router.delete('/image', deleteImageController);

export default router;
