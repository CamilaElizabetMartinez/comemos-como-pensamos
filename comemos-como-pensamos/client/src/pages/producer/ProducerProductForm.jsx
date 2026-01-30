import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import ImageUploader from '../../components/common/ImageUploader';
import { PRODUCT_CATEGORIES, PRODUCT_UNITS, WEIGHT_UNITS } from '../../constants/products';
import './ProducerProductForm.css';

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

const TAB_ICONS = {
  general: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  images: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  pricing: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
};

const ProducerProductForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showTranslations, setShowTranslations] = useState(false);

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

  useEffect(() => {
    if (user?.role !== 'producer') {
      navigate('/');
      return;
    }
    if (isEditing) {
      fetchProduct();
    }
  }, [user, navigate, isEditing]);

  const fetchProduct = useCallback(async () => {
    try {
      const response = await api.get(`/products/${id}`);
      const product = response.data.data.product;

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

      const productName = product.name || { es: '', en: '', fr: '', de: '' };
      const productDescription = product.description || { es: '', en: '', fr: '', de: '' };

      const hasExistingTranslations =
        productName.en || productName.fr || productName.de ||
        productDescription.en || productDescription.fr || productDescription.de;

      if (hasExistingTranslations) {
        setShowTranslations(true);
      }

      setFormData({
        name: productName,
        description: productDescription,
        category: product.category || 'vegetables',
        price: product.price?.toString() || '',
        unit: product.unit || 'kg',
        stock: product.stock?.toString() || '',
        images: product.images || [],
        isAvailable: product.isAvailable ?? true,
        hasVariants: product.hasVariants || false,
        variants: normalizedVariants
      });
    } catch (error) {
      toast.error(t('producer.productForm.loadError', 'Error al cargar producto'));
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
      [field]: { ...prev[field], [lang]: value }
    }));
  }, []);

  const handleImagesChange = useCallback((newImages) => {
    setFormData(prev => ({ ...prev, images: newImages }));
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
        [field]: { ...newVariants[index][field], [lang]: value }
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
      toast.error(t('producer.productForm.nameRequired', 'El nombre es obligatorio'));
      return false;
    }

    if (formData.hasVariants) {
      if (formData.variants.length === 0) {
        toast.error(t('producer.productForm.variantsRequired', 'Debes añadir al menos una variante'));
        return false;
      }
      for (let index = 0; index < formData.variants.length; index++) {
        const variant = formData.variants[index];
        if (!variant.name.es) {
          toast.error(t('producer.productForm.variantNameRequired', `Variante ${index + 1}: nombre obligatorio`));
          return false;
        }
        if (!variant.price || parseFloat(variant.price) <= 0) {
          toast.error(t('producer.productForm.variantPriceRequired', `Variante ${index + 1}: precio obligatorio`));
          return false;
        }
        if (variant.stock === '' || parseInt(variant.stock) < 0) {
          toast.error(t('producer.productForm.variantStockRequired', `Variante ${index + 1}: stock obligatorio`));
          return false;
        }
      }
    } else {
      if (!formData.price || parseFloat(formData.price) <= 0) {
        toast.error(t('producer.productForm.priceRequired', 'El precio es obligatorio'));
        return false;
      }
      if (formData.stock === '' || parseInt(formData.stock) < 0) {
        toast.error(t('producer.productForm.stockRequired', 'El stock es obligatorio'));
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
      const imageUrls = formData.images.map(img => typeof img === 'string' ? img : img.url);

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
        toast.success(t('producer.productForm.updated', 'Producto actualizado'));
      } else {
        await api.post('/products', payload);
        toast.success(t('producer.productForm.created', 'Producto creado'));
      }
      navigate('/producer/products');
    } catch (error) {
      toast.error(error.response?.data?.message || t('producer.productForm.saveError', 'Error al guardar'));
    } finally {
      setSaving(false);
    }
  }, [formData, validateForm, isEditing, id, navigate, t]);

  const totalVariantsStock = useMemo(() => {
    if (!formData.hasVariants) return 0;
    return formData.variants.reduce((sum, variant) => sum + (parseInt(variant.stock) || 0), 0);
  }, [formData.hasVariants, formData.variants]);

  const tabs = useMemo(() => [
    { id: 'general', label: t('producer.productForm.tabs.general', 'General') },
    { id: 'images', label: t('producer.productForm.tabs.images', 'Imágenes') },
    { id: 'pricing', label: t('producer.productForm.tabs.pricing', 'Precio') }
  ], [t]);

  if (loading) {
    return (
      <div className="producer-product-form">
        <div className="container">
          <div className="loading">{t('common.loading', 'Cargando...')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="producer-product-form">
      <div className="container">
        <header className="form-header">
          <Link to="/producer/products" className="back-link">
            ← {t('producer.products.backToDashboard', 'Volver')}
          </Link>
          <h1>
            {isEditing
              ? t('producer.productForm.editTitle', 'Editar Producto')
              : t('producer.productForm.createTitle', 'Crear Producto')}
          </h1>
        </header>

        <form onSubmit={handleSubmit} className="product-form tabbed-form">
          <nav className="form-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{TAB_ICONS[tab.id]}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="form-content">
            {activeTab === 'general' && (
              <div className="tab-panel">
                <section className="form-section">
                  <h2>{t('producer.productForm.nameSectionTitle', 'Nombre del producto')} *</h2>
                  <div className="form-group">
                    <input
                      type="text"
                      value={formData.name.es}
                      onChange={(event) => handleLocalizedChange('name', 'es', event.target.value)}
                      placeholder={t('producer.productForm.namePlaceholder', 'Ej: Tomates cherry ecológicos')}
                      className="input-main"
                    />
                  </div>
                </section>

                <section className="form-section">
                  <h2>{t('producer.productForm.descriptionSectionTitle', 'Descripción')}</h2>
                  <div className="form-group">
                    <textarea
                      value={formData.description.es}
                      onChange={(event) => handleLocalizedChange('description', 'es', event.target.value)}
                      placeholder={t('producer.productForm.descriptionPlaceholder', 'Describe tu producto...')}
                      rows="4"
                      className="input-main"
                    />
                  </div>
                </section>

                <section className="form-section">
                  <h2>{t('producer.productForm.category', 'Categoría')}</h2>
                  <div className="form-group">
                    <select name="category" value={formData.category} onChange={handleChange}>
                      {PRODUCT_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>
                          {t(`categories.${cat}`, cat)}
                        </option>
                      ))}
                    </select>
                  </div>
                </section>

                <div className="translations-section">
                  <button
                    type="button"
                    className="btn-toggle-translations"
                    onClick={() => setShowTranslations(!showTranslations)}
                  >
                    <span className={`toggle-icon ${showTranslations ? 'open' : ''}`}>▶</span>
                    {t('producer.productForm.addTranslations', 'Añadir traducciones')}
                    <span className="optional-badge">{t('common.optional', 'opcional')}</span>
                  </button>

                  {showTranslations && (
                    <div className="translations-content">
                      <p className="translations-hint">{t('producer.productForm.translationsHint', 'Añade traducciones para otros idiomas')}</p>

                      <div className="form-group">
                        <label>{t('producer.productForm.nameSectionTitle', 'Nombre')}</label>
                        <div className="localized-inputs">
                          {['en', 'fr', 'de'].map(lang => (
                            <div key={lang} className="localized-input">
                              <span className="lang-label">{lang.toUpperCase()}</span>
                              <input
                                type="text"
                                value={formData.name[lang]}
                                onChange={(event) => handleLocalizedChange('name', lang, event.target.value)}
                                placeholder={t('producer.productForm.namePlaceholder', 'Nombre del producto')}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="form-group">
                        <label>{t('producer.productForm.descriptionSectionTitle', 'Descripción')}</label>
                        <div className="localized-inputs">
                          {['en', 'fr', 'de'].map(lang => (
                            <div key={lang} className="localized-input">
                              <span className="lang-label">{lang.toUpperCase()}</span>
                              <textarea
                                value={formData.description[lang]}
                                onChange={(event) => handleLocalizedChange('description', lang, event.target.value)}
                                placeholder={t('producer.productForm.descriptionPlaceholder', 'Descripción')}
                                rows="2"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'images' && (
              <div className="tab-panel">
                <section className="form-section">
                  <h2>{t('producer.productForm.images', 'Imágenes')}</h2>
                  <p className="section-hint">{t('imageUploader.dragReorder', 'Arrastra para reordenar. Máximo 5 imágenes.')}</p>
                  <ImageUploader
                    images={formData.images}
                    onImagesChange={handleImagesChange}
                    maxImages={5}
                    folder="products"
                  />
                </section>
              </div>
            )}

            {activeTab === 'pricing' && (
              <div className="tab-panel">
                <section className="form-section">
                  <h2>{t('producer.productForm.pricingStock', 'Precio y Stock')}</h2>

                  <div className={`variants-toggle-card ${formData.hasVariants ? 'active' : ''}`}>
                    <label className="variants-toggle-label">
                      <div className="variants-toggle-content">
                        <div className="variants-toggle-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                            <line x1="12" y1="22.08" x2="12" y2="12" />
                          </svg>
                        </div>
                        <div className="variants-toggle-info">
                          <span className="variants-toggle-title">
                            {t('producer.productForm.useVariants', '¿Vendes este producto en diferentes formatos?')}
                          </span>
                          <span className="variants-toggle-description">
                            {t('producer.productForm.variantsHint', 'Ej: Pack 500g, Caja 1kg, Formato familiar 2kg')}
                          </span>
                        </div>
                      </div>
                      <div className="variants-toggle-switch">
                        <input
                          type="checkbox"
                          checked={formData.hasVariants}
                          onChange={handleToggleVariants}
                        />
                        <span className="switch-slider"></span>
                      </div>
                    </label>
                  </div>

                  {!formData.hasVariants ? (
                    <>
                      <div className="form-row three-cols">
                        <div className="form-group">
                          <label>{t('producer.productForm.price', 'Precio')} (€) *</label>
                          <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                          />
                        </div>

                        <div className="form-group">
                          <label>{t('producer.productForm.unit', 'Unidad')} *</label>
                          <select name="unit" value={formData.unit} onChange={handleChange}>
                            {PRODUCT_UNITS.map(unit => (
                              <option key={unit} value={unit}>{t(`units.${unit}`, unit)}</option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label>{t('producer.productForm.stock', 'Stock')} *</label>
                          <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            min="0"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <p className="field-hint">{t('producer.productForm.stockHint', 'Cantidad disponible para venta')}</p>

                      <div className={`availability-toggle ${formData.isAvailable ? 'available' : 'unavailable'}`}>
                        <label className="availability-toggle-label">
                          <div className="availability-toggle-content">
                            <div className="availability-toggle-icon">
                              {formData.isAvailable ? (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                  <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                              ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10" />
                                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                </svg>
                              )}
                            </div>
                            <div className="availability-toggle-info">
                              <span className="availability-toggle-status">
                                {formData.isAvailable 
                                  ? t('producer.productForm.availableStatus', 'Disponible para venta')
                                  : t('producer.productForm.unavailableStatus', 'No disponible')}
                              </span>
                            </div>
                          </div>
                          <div className="availability-toggle-switch">
                            <input
                              type="checkbox"
                              name="isAvailable"
                              checked={formData.isAvailable}
                              onChange={handleChange}
                            />
                            <span className="switch-slider"></span>
                          </div>
                        </label>
                      </div>
                    </>
                  ) : (
                    <div className="variants-section">
                      <div className="variants-header">
                        <h3>{t('producer.productForm.variantsTitle', 'Variantes del producto')}</h3>
                        <span className="variants-stock-total">
                          {t('producer.productForm.totalStock', 'Stock total')}: {totalVariantsStock}
                        </span>
                      </div>

                      {formData.variants.map((variant, index) => (
                        <div key={index} className={`variant-card ${variant.isDefault ? 'is-default' : ''}`}>
                          <div className="variant-header">
                            <span className="variant-number">
                              {t('producer.productForm.variant', 'Variante')} {index + 1}
                              {variant.isDefault && (
                                <span className="default-badge">{t('producer.productForm.default', 'Principal')}</span>
                              )}
                            </span>
                            <div className="variant-actions">
                              {!variant.isDefault && (
                                <button
                                  type="button"
                                  className="btn-set-default"
                                  onClick={() => handleSetDefaultVariant(index)}
                                >
                                  {t('producer.productForm.setDefault', 'Hacer principal')}
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
                              <label>{t('producer.productForm.variantName', 'Nombre de la variante')} * (ej: 500g, 1kg)</label>
                              <input
                                type="text"
                                value={variant.name.es}
                                onChange={(event) => handleVariantLocalizedChange(index, 'name', 'es', event.target.value)}
                                placeholder={t('producer.productForm.variantNamePlaceholder', 'Ej: Pack 500g')}
                              />
                            </div>

                            <div className="form-row three-cols">
                              <div className="form-group">
                                <label>{t('producer.productForm.price', 'Precio')} (€) *</label>
                                <input
                                  type="number"
                                  value={variant.price}
                                  onChange={(event) => handleVariantChange(index, 'price', event.target.value)}
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                />
                              </div>

                              <div className="form-group">
                                <label>{t('producer.productForm.stock', 'Stock')} *</label>
                                <input
                                  type="number"
                                  value={variant.stock}
                                  onChange={(event) => handleVariantChange(index, 'stock', event.target.value)}
                                  min="0"
                                  placeholder="0"
                                />
                              </div>

                              <div className="form-group">
                                <label>{t('producer.productForm.sku', 'SKU')}</label>
                                <input
                                  type="text"
                                  value={variant.sku}
                                  onChange={(event) => handleVariantChange(index, 'sku', event.target.value)}
                                  placeholder="SKU-001"
                                />
                              </div>
                            </div>

                            <div className="form-row two-cols">
                              <div className="form-group">
                                <label>{t('producer.productForm.compareAtPrice', 'Precio anterior')} (€)</label>
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
                                <label>{t('producer.productForm.weight', 'Peso')}</label>
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
                        + {t('producer.productForm.addVariant', 'Añadir variante')}
                      </button>
                    </div>
                  )}
                </section>
              </div>
            )}
          </div>

          <div className="form-actions">
            <Link to="/producer/products" className="btn btn-secondary">
              {t('common.cancel', 'Cancelar')}
            </Link>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving
                ? t('common.loading', 'Guardando...')
                : isEditing
                  ? t('producer.productForm.saveChanges', 'Guardar cambios')
                  : t('producer.productForm.createProduct', 'Crear producto')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProducerProductForm;
