import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Función para subir imagen
export const uploadImage = async (file, folder = 'comemos-como-pensamos') => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
        { width: 1000, height: 1000, crop: 'limit' }
      ]
    });

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Error al subir imagen a Cloudinary:', error);
    throw new Error('Error al subir imagen');
  }
};

// Función para eliminar imagen
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error al eliminar imagen de Cloudinary:', error);
    throw new Error('Error al eliminar imagen');
  }
};

// Función para subir múltiples imágenes
export const uploadMultipleImages = async (files, folder = 'comemos-como-pensamos/products') => {
  try {
    const uploadPromises = files.map(file => uploadImage(file, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Error al subir múltiples imágenes:', error);
    throw new Error('Error al subir imágenes');
  }
};

export default cloudinary;
