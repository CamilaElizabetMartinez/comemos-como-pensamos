import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import ImageUploader from '../../components/common/ImageUploader';
import './ProducerProductForm.css';

const CATEGORIES = ['fruits', 'vegetables', 'dairy', 'meat', 'bakery', 'eggs', 'honey', 'oil', 'wine', 'other'];
const UNITS = ['kg', 'unit', 'liter', 'gram', 'dozen'];
const WEIGHT_UNITS = ['g', 'kg', 'ml', 'l'];

const EMPTY_VARIANT = {
  name: { es: '', en: '', fr: '', de: '' },
  sku: '',
  price: '',
  compareAtPrice: '',
  stock: '',
  weight: '',
  weightUnit: 'g',
  isDefault: false
};

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
    isAvailable: true,
    hasVariants: false,
    variants: []
  });
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

  const fetchProduct = useCallback(async () => {
    try {
      const res = await api.get(`/products/${id}`);
      const product = res.data.data.product;
      
      const normalizedImages = (product.images || []).map(img => 
        typeof img === 'string' ? { url: img, publicId: null } : img
      );

      const normalizedVariants = (product.variants || []).map(variant => ({
        ...variant,
        _id: variant._id,
        name: variant.name || { es: '', en: '', fr: '', de: '' },
        price: variant.price?.toString() || '',
        compareAtPrice: variant.compareAtPrice?.toString() || '',
        stock: variant.stock?.toString() || '',
        weight: variant.weight?.toString() || '',
        weightUnit: variant.weightUnit || 'g'
      }));
      
      setFormData({
        name: product.name || { es: '', en: '', fr: '', de: '' },
        description: product.description || { es: '', en: '', fr: '', de: '' },
        category: product.category || 'vegetables',
        price: product.price?.toString() || '',
        unit: product.unit || 'kg',
        stock: product.stock?.toString() || '',
        images: normalizedImages,
        isAvailable: product.isAvailable ?? true,
        hasVariants: product.hasVariants || false,
        variants: normalizedVariants
      });
    } catch (error) {
      toast.error(t('producer.productForm.loadError'));
      navigate('/producer/products');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, t]);

  const handleChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  const handleLocalizedChange = useCallback((field, lang, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value
      }
    }));
  }, []);

  const handleImagesChange = useCallback((newImages) => {
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  }, []);

  const handleToggleVariants = useCallback((event) => {
    const hasVariants = event.target.checked;
    setFormData(prev => ({
      ...prev,
      hasVariants,
      variants: hasVariants && prev.variants.length === 0 
        ? [{ ...EMPTY_VARIANT, isDefault: true }] 
        : prev.variants
    }));
  }, []);

  const handleAddVariant = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { ...EMPTY_VARIANT }]
    }));
  }, []);

  const handleRemoveVariant = useCallback((index) => {
    setFormData(prev => {
      const newVariants = prev.variants.filter((_, variantIndex) => variantIndex !== index);
      if (newVariants.length > 0 && !newVariants.some(variant => variant.isDefault)) {
        newVariants[0].isDefault = true;
      }
      return { ...prev, variants: newVariants };
    });
  }, []);

  const handleVariantChange = useCallback((index, field, value) => {
    setFormData(prev => {
      const newVariants = [...prev.variants];
      newVariants[index] = { ...newVariants[index], [field]: value };
      return { ...prev, variants: newVariants };
    });
  }, []);

  const handleVariantLocalizedChange = useCallback((index, field, lang, value) => {
    setFormData(prev => {
      const newVariants = [...prev.variants];
      newVariants[index] = {
        ...newVariants[index],
        [field]: {
          ...newVariants[index][field],
          [lang]: value
        }
      };
      return { ...prev, variants: newVariants };
    });
  }, []);

  const handleSetDefaultVariant = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, variantIndex) => ({
        ...variant,
        isDefault: variantIndex === index
      }))
    }));
  }, []);

  const validateForm = useCallback(() => {
    if (!formData.name.es) {
      toast.error(t('producer.productForm.nameRequired'));
      return false;
    }

    if (formData.hasVariants) {
      if (formData.variants.length === 0) {
        toast.error(t('producer.productForm.variantsRequired'));
        return false;
      }
      for (let index = 0; index < formData.variants.length; index++) {
        const variant = formData.variants[index];
        if (!variant.name.es) {
          toast.error(t('producer.productForm.variantNameRequired', { index: index + 1 }));
          return false;
        }
        if (!variant.price || parseFloat(variant.price) <= 0) {
          toast.error(t('producer.productForm.variantPriceRequired', { index: index + 1 }));
          return false;
        }
        if (variant.stock === '' || parseInt(variant.stock) < 0) {
          toast.error(t('producer.productForm.variantStockRequired', { index: index + 1 }));
          return false;
        }
      }
    } else {
      if (!formData.price || parseFloat(formData.price) <= 0) {
        toast.error(t('producer.productForm.priceRequired'));
        return false;
      }
      if (formData.stock === '' || parseInt(formData.stock) < 0) {
        toast.error(t('producer.productForm.stockRequired'));
        return false;
      }
    }

    return true;
  }, [formData, t]);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    setSaving(true);
    try {
      const imageUrls = formData.images.map(img => 
        typeof img === 'string' ? img : img.url
      );

      const payload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        unit: formData.unit,
        images: imageUrls,
        hasVariants: formData.hasVariants
      };

      if (formData.hasVariants) {
        payload.variants = formData.variants.map(variant => ({
          _id: variant._id,
          name: variant.name,
          sku: variant.sku,
          price: parseFloat(variant.price),
          compareAtPrice: variant.compareAtPrice ? parseFloat(variant.compareAtPrice) : undefined,
          stock: parseInt(variant.stock),
          weight: variant.weight ? parseFloat(variant.weight) : undefined,
          weightUnit: variant.weightUnit,
          isDefault: variant.isDefault
        }));
      } else {
        payload.price = parseFloat(formData.price);
        payload.stock = parseInt(formData.stock);
        payload.isAvailable = formData.isAvailable;
      }

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
  }, [formData, validateForm, isEditing, id, navigate, t]);

  const totalVariantsStock = useMemo(() => {
    if (!formData.hasVariants) return 0;
    return formData.variants.reduce((sum, variant) => sum + (parseInt(variant.stock) || 0), 0);
  }, [formData.hasVariants, formData.variants]);

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
              <label>{t('producer.productForm.nameSectionTitle')} *</label>
              <div className="localized-inputs">
                {['es', 'en', 'fr', 'de'].map(lang => (
                  <div key={lang} className="localized-input">
                    <span className="lang-label">{lang.toUpperCase()}</span>
                    <input
                      type="text"
                      value={formData.name[lang]}
                      onChange={(event) => handleLocalizedChange('name', lang, event.target.value)}
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
                      onChange={(event) => handleLocalizedChange('description', lang, event.target.value)}
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
                    <option key={unit} value={unit}>{t(`units.${unit}`)}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>{t('producer.productForm.pricingStock')}</h2>
            
            <div className="form-group checkbox-group variants-toggle">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.hasVariants}
                  onChange={handleToggleVariants}
                />
                <span className="checkbox-text">
                  {t('producer.productForm.useVariants')}
                </span>
              </label>
              <p className="hint-text">{t('producer.productForm.variantsHint')}</p>
            </div>

            {!formData.hasVariants ? (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('producer.productForm.price')} (€) *</label>
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
                    <label>{t('producer.productForm.stock')} *</label>
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
              </>
            ) : (
              <div className="variants-section">
                <div className="variants-header">
                  <h3>{t('producer.productForm.variantsTitle')}</h3>
                  <span className="variants-stock-total">
                    {t('producer.productForm.totalStock')}: {totalVariantsStock}
                  </span>
                </div>

                {formData.variants.map((variant, index) => (
                  <div key={index} className={`variant-card ${variant.isDefault ? 'is-default' : ''}`}>
                    <div className="variant-header">
                      <span className="variant-number">
                        {t('producer.productForm.variant')} {index + 1}
                        {variant.isDefault && (
                          <span className="default-badge">{t('producer.productForm.default')}</span>
                        )}
                      </span>
                      <div className="variant-actions">
                        {!variant.isDefault && (
                          <button
                            type="button"
                            className="btn-set-default"
                            onClick={() => handleSetDefaultVariant(index)}
                          >
                            {t('producer.productForm.setDefault')}
                          </button>
                        )}
                        {formData.variants.length > 1 && (
                          <button
                            type="button"
                            className="btn-remove-variant"
                            onClick={() => handleRemoveVariant(index)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="variant-body">
                      <div className="form-group">
                        <label>{t('producer.productForm.variantName')} *</label>
                        <div className="localized-inputs compact">
                          {['es', 'en', 'fr', 'de'].map(lang => (
                            <div key={lang} className="localized-input">
                              <span className="lang-label">{lang.toUpperCase()}</span>
                              <input
                                type="text"
                                value={variant.name[lang]}
                                onChange={(event) => handleVariantLocalizedChange(index, 'name', lang, event.target.value)}
                                placeholder={t('producer.productForm.variantNamePlaceholder')}
                                required={lang === 'es'}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="form-row four-cols">
                        <div className="form-group">
                          <label>{t('producer.productForm.price')} (€) *</label>
                          <input
                            type="number"
                            value={variant.price}
                            onChange={(event) => handleVariantChange(index, 'price', event.target.value)}
                            step="0.01"
                            min="0"
                            required
                            placeholder="0.00"
                          />
                        </div>

                        <div className="form-group">
                          <label>{t('producer.productForm.compareAtPrice')}</label>
                          <input
                            type="number"
                            value={variant.compareAtPrice}
                            onChange={(event) => handleVariantChange(index, 'compareAtPrice', event.target.value)}
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                          />
                        </div>

                        <div className="form-group">
                          <label>{t('producer.productForm.stock')} *</label>
                          <input
                            type="number"
                            value={variant.stock}
                            onChange={(event) => handleVariantChange(index, 'stock', event.target.value)}
                            min="0"
                            required
                            placeholder="0"
                          />
                        </div>

                        <div className="form-group">
                          <label>{t('producer.productForm.sku')}</label>
                          <input
                            type="text"
                            value={variant.sku}
                            onChange={(event) => handleVariantChange(index, 'sku', event.target.value)}
                            placeholder="SKU-001"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>{t('producer.productForm.weight')}</label>
                          <div className="weight-input-group">
                            <input
                              type="number"
                              value={variant.weight}
                              onChange={(event) => handleVariantChange(index, 'weight', event.target.value)}
                              min="0"
                              step="0.01"
                              placeholder="500"
                            />
                            <select
                              value={variant.weightUnit}
                              onChange={(event) => handleVariantChange(index, 'weightUnit', event.target.value)}
                            >
                              {WEIGHT_UNITS.map(unit => (
                                <option key={unit} value={unit}>{unit}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="btn-add-variant"
                  onClick={handleAddVariant}
                >
                  + {t('producer.productForm.addVariant')}
                </button>
              </div>
            )}
          </section>

          <section className="form-section">
            <h2>{t('producer.productForm.images')}</h2>
            <p className="section-hint">{t('imageUploader.dragReorder')}</p>
            
            <ImageUploader
              images={formData.images}
              onImagesChange={handleImagesChange}
              maxImages={5}
              folder="products"
            />
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
