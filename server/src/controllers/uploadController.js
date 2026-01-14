import { uploadImage, deleteImage, uploadMultipleImages } from '../config/cloudinary.js';
import streamifier from 'streamifier';

// Función helper para convertir buffer a stream
const bufferToStream = (buffer) => {
  return streamifier.createReadStream(buffer);
};

// @desc    Subir una imagen
// @route   POST /api/upload/image
// @access  Private
export const uploadSingleImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ninguna imagen'
      });
    }

    // Convertir buffer a base64 data URI
    const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const folder = req.body.folder || 'comemos-como-pensamos';
    const result = await uploadImage(fileStr, folder);

    res.status(200).json({
      success: true,
      message: 'Imagen subida exitosamente',
      data: {
        url: result.url,
        publicId: result.publicId
      }
    });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir imagen',
      error: error.message
    });
  }
};

// @desc    Subir múltiples imágenes
// @route   POST /api/upload/multiple
// @access  Private
export const uploadMultipleImagesController = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron imágenes'
      });
    }

    const folder = req.body.folder || 'comemos-como-pensamos/products';

    // Convertir cada archivo a base64 data URI
    const uploadPromises = req.files.map(async (file) => {
      const fileStr = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      return uploadImage(fileStr, folder);
    });

    const results = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      message: 'Imágenes subidas exitosamente',
      data: {
        images: results
      }
    });
  } catch (error) {
    console.error('Error al subir imágenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir imágenes',
      error: error.message
    });
  }
};

// @desc    Eliminar una imagen
// @route   DELETE /api/upload/image
// @access  Private
export const deleteImageController = async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere el publicId de la imagen'
      });
    }

    await deleteImage(publicId);

    res.status(200).json({
      success: true,
      message: 'Imagen eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar imagen',
      error: error.message
    });
  }
};
