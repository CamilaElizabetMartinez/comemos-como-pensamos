import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './ProducerProductForm.css';

const CATEGORIES = ['fruits', 'vegetables', 'dairy', 'meat', 'bakery', 'other'];
const UNITS = ['kg', 'g', 'l', 'ml', 'ud', 'docena', 'manojo'];

const ProducerProductForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: { es: '', en: '', fr: '', de: '' },
    description: { es: '', en: '', fr: '', de: '' },
    category: 'vegetables',
    price: '',
    unit: 'kg',
    stock: '',
    images: [],
    isAvailable: true
  });
  const [newImageUrl, setNewImageUrl] = useState('');
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'producer') {
      navigate('/');
      return;
    }
    if (isEditing) {
      fetchProduct();
    }
  }, [user, id, navigate, isEditing]);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      const product = res.data.data.product;
      setFormData({
        name: product.name || { es: '', en: '', fr: '', de: '' },
        description: product.description || { es: '', en: '', fr: '', de: '' },
        category: product.category || 'vegetables',
        price: product.price?.toString() || '',
        unit: product.unit || 'kg',
        stock: product.stock?.toString() || '',
        images: product.images || [],
        isAvailable: product.isAvailable ?? true
      });
    } catch (error) {
      toast.error(t('producer.productForm.loadError'));
      navigate('/producer/products');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLocalizedChange = (field, lang, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value
      }
    }));
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()]
      }));
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.es) {
      toast.error(t('producer.productForm.nameRequired'));
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error(t('producer.productForm.priceRequired'));
      return;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      toast.error(t('producer.productForm.stockRequired'));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock)
      };

      if (isEditing) {
        await api.put(`/products/${id}`, payload);
        toast.success(t('producer.productForm.updated'));
      } else {
        await api.post('/products', payload);
        toast.success(t('producer.productForm.created'));
      }
      navigate('/producer/products');
    } catch (error) {
      toast.error(error.response?.data?.message || t('producer.productForm.saveError'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="producer-product-form">
        <div className="container">
          <div className="loading">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="producer-product-form">
      <div className="container">
        <header className="form-header">
          <Link to="/producer/products" className="back-link">
            ← {t('producer.productForm.backToProducts')}
          </Link>
          <h1>
            {isEditing 
              ? t('producer.productForm.editTitle') 
              : t('producer.productForm.createTitle')}
          </h1>
        </header>

        <form onSubmit={handleSubmit} className="product-form">
          <section className="form-section">
            <h2>{t('producer.productForm.basicInfo')}</h2>
            
            <div className="form-group">
              <label>{t('producer.productForm.nameSectionTitle')}</label>
              <div className="localized-inputs">
                {['es', 'en', 'fr', 'de'].map(lang => (
                  <div key={lang} className="localized-input">
                    <span className="lang-label">{lang.toUpperCase()}</span>
                    <input
                      type="text"
                      value={formData.name[lang]}
                      onChange={(e) => handleLocalizedChange('name', lang, e.target.value)}
                      placeholder={t('producer.productForm.namePlaceholder')}
                      required={lang === 'es'}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>{t('producer.productForm.descriptionSectionTitle')}</label>
              <div className="localized-inputs">
                {['es', 'en', 'fr', 'de'].map(lang => (
                  <div key={lang} className="localized-input">
                    <span className="lang-label">{lang.toUpperCase()}</span>
                    <textarea
                      value={formData.description[lang]}
                      onChange={(e) => handleLocalizedChange('description', lang, e.target.value)}
                      placeholder={t('producer.productForm.descriptionPlaceholder')}
                      rows="3"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('producer.productForm.category')}</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {t(`categories.${cat}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>{t('producer.productForm.unit')}</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                >
                  {UNITS.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>{t('producer.productForm.pricingStock')}</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>{t('producer.productForm.price')} (€)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>{t('producer.productForm.stock')}</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  required
                  placeholder="0"
                />
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleChange}
                />
                <span className="checkbox-text">
                  {t('producer.productForm.isAvailable')}
                </span>
              </label>
            </div>
          </section>

          <section className="form-section">
            <h2>{t('producer.productForm.images')}</h2>
            
            <div className="images-grid">
              {formData.images.map((img, index) => (
                <div key={index} className="image-preview">
                  <img src={img} alt={`Product ${index + 1}`} />
                  <button
                    type="button"
                    className="remove-image"
                    onClick={() => handleRemoveImage(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="add-image-row">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder={t('producer.productForm.imageUrlPlaceholder')}
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="btn btn-secondary"
              >
                {t('producer.productForm.addImage')}
              </button>
            </div>
            <p className="hint">{t('producer.productForm.imageHint')}</p>
          </section>

          <div className="form-actions">
            <Link to="/producer/products" className="btn btn-secondary">
              {t('common.cancel')}
            </Link>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving 
                ? t('common.loading') 
                : isEditing 
                  ? t('producer.productForm.saveChanges') 
                  : t('producer.productForm.createProduct')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProducerProductForm;

