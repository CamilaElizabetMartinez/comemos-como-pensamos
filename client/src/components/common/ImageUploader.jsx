import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './ImageUploader.css';

const ImageUploader = ({ images = [], onImagesChange, maxImages = 5, folder = 'products' }) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const { t } = useTranslation();

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const uploadFiles = async (files) => {
    if (images.length + files.length > maxImages) {
      toast.warning(t('imageUploader.maxImagesReached', { max: maxImages }));
      return;
    }

    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(t('imageUploader.invalidType'));
        return false;
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB
        toast.error(t('imageUploader.fileTooLarge'));
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    const newImages = [...images];

    try {
      for (const file of validFiles) {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('folder', `comemos-como-pensamos/${folder}`);

        const response = await api.post('/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (response.data.success) {
          newImages.push({
            url: response.data.data.url,
            publicId: response.data.data.publicId
          });
        }
      }

      onImagesChange(newImages);
      toast.success(t('imageUploader.uploadSuccess'));
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(t('imageUploader.uploadError'));
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  }, [images, maxImages]);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
    }
  };

  const handleRemoveImage = async (index) => {
    const imageToRemove = images[index];
    
    try {
      // Si tiene publicId, eliminar de Cloudinary
      if (imageToRemove.publicId) {
        await api.delete('/upload/image', {
          data: { publicId: imageToRemove.publicId }
        });
      }

      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
      toast.success(t('imageUploader.removeSuccess'));
    } catch (error) {
      console.error('Error removing image:', error);
      // Aún así removemos del estado local
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
    }
  };

  const handleReorder = (fromIndex, toIndex) => {
    const newImages = [...images];
    const [moved] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, moved);
    onImagesChange(newImages);
  };

  return (
    <div className="image-uploader">
      {images.length > 0 && (
        <div className="uploaded-images">
          {images.map((image, index) => (
            <div 
              key={image.publicId || image.url || index} 
              className="uploaded-image"
              draggable
              onDragStart={(e) => e.dataTransfer.setData('text/plain', index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                handleReorder(fromIndex, index);
              }}
            >
              <img 
                src={typeof image === 'string' ? image : image.url} 
                alt={`Product ${index + 1}`} 
              />
              {index === 0 && (
                <span className="main-badge">{t('imageUploader.mainImage')}</span>
              )}
              <button
                type="button"
                className="remove-btn"
                onClick={() => handleRemoveImage(index)}
                title={t('imageUploader.remove')}
              >
                ✕
              </button>
              <span className="drag-hint">⋮⋮</span>
            </div>
          ))}
        </div>
      )}

      {images.length < maxImages && (
        <div
          className={`drop-zone ${dragActive ? 'active' : ''} ${uploading ? 'uploading' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
          
          {uploading ? (
            <div className="uploading-indicator">
              <div className="spinner"></div>
              <span>{t('imageUploader.uploading')}</span>
            </div>
          ) : (
            <>
              <div className="drop-icon">📷</div>
              <p className="drop-text">{t('imageUploader.dropHere')}</p>
              <p className="drop-hint">
                {t('imageUploader.orClick')} • {t('imageUploader.maxSize')}
              </p>
              <p className="images-count">
                {images.length} / {maxImages} {t('imageUploader.images')}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;

