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

const TABS = ['general', 'images', 'pricing'];

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
      
      const productName = product.name || { es: '', en: '', fr: '', de: '' };
      const productDescription = product.description || { es: '', en: '', fr: '', de: '' };
      
      // Check if there are existing translations to show them expanded
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

        <form onSubmit={handleSubmit} className="product-form tabbed-form">
          <nav className="form-tabs">
            {TABS.map(tab => (
              <button
                key={tab}
                type="button"
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                <span className="tab-icon">
                  {tab === 'general' && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  )}
                  {tab === 'images' && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  )}
                  {tab === 'pricing' && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  )}
                </span>
                <span className="tab-label">{t(`producer.productForm.tabs.${tab}`)}</span>
              </button>
            ))}
          </nav>

          <div className="form-content">
            {/* Tab: General */}
            {activeTab === 'general' && (
              <div className="tab-panel">
                <section className="form-section">
                  <h2>{t('producer.productForm.nameSectionTitle')} *</h2>
                  <div className="form-group">
                    <input
                      type="text"
                      value={formData.name.es}
                      onChange={(event) => handleLocalizedChange('name', 'es', event.target.value)}
                      placeholder={t('producer.productForm.namePlaceholder')}
                      className="input-main"
                    />
                  </div>
                </section>

                <section className="form-section">
                  <h2>{t('producer.productForm.descriptionSectionTitle')}</h2>
                  <div className="form-group">
                    <textarea
                      value={formData.description.es}
                      onChange={(event) => handleLocalizedChange('description', 'es', event.target.value)}
                      placeholder={t('producer.productForm.descriptionPlaceholder')}
                      rows="4"
                      className="input-main"
                    />
                  </div>
                </section>

                <section className="form-section">
                  <h2>{t('producer.productForm.category')}</h2>
                  <div className="form-group">
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
                </section>

                {/* Collapsible translations */}
                <div className="translations-section">
                  <button
                    type="button"
                    className="btn-toggle-translations"
                    onClick={() => setShowTranslations(!showTranslations)}
                  >
                    <span className={`toggle-icon ${showTranslations ? 'open' : ''}`}>▶</span>
                    {t('producer.productForm.addTranslations')}
                    <span className="optional-badge">{t('common.optional')}</span>
                  </button>

                  {showTranslations && (
                    <div className="translations-content">
                      <p className="translations-hint">{t('producer.productForm.translationsHint')}</p>
                      
                      <div className="form-group">
                        <label>{t('producer.productForm.nameSectionTitle')}</label>
                        <div className="localized-inputs">
                          {['en', 'fr', 'de'].map(lang => (
                            <div key={lang} className="localized-input">
                              <span className="lang-label">{lang.toUpperCase()}</span>
                              <input
                                type="text"
                                value={formData.name[lang]}
                                onChange={(event) => handleLocalizedChange('name', lang, event.target.value)}
                                placeholder={t('producer.productForm.namePlaceholder')}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="form-group">
                        <label>{t('producer.productForm.descriptionSectionTitle')}</label>
                        <div className="localized-inputs">
                          {['en', 'fr', 'de'].map(lang => (
                            <div key={lang} className="localized-input">
                              <span className="lang-label">{lang.toUpperCase()}</span>
                              <textarea
                                value={formData.description[lang]}
                                onChange={(event) => handleLocalizedChange('description', lang, event.target.value)}
                                placeholder={t('producer.productForm.descriptionPlaceholder')}
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

            {/* Tab: Images */}
            {activeTab === 'images' && (
              <div className="tab-panel">
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
              </div>
            )}

            {/* Tab: Pricing */}
            {activeTab === 'pricing' && (
              <div className="tab-panel">
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
                      <div className="form-row three-cols">
                        <div className="form-group">
                          <label>{t('producer.productForm.price')} (€) *</label>
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
                          <label>{t('producer.productForm.unit')} *</label>
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

                        <div className="form-group">
                          <label>{t('producer.productForm.stock')} *</label>
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
              </div>
            )}
          </div>

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
