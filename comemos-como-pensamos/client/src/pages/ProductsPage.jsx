import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { ListSkeleton } from '../components/common/Skeleton';
import SearchAutocomplete from '../components/common/SearchAutocomplete';
import './ProductsPage.css';

const CATEGORIES = ['fruits', 'vegetables', 'dairy', 'meat', 'bakery', 'other'];
const SORT_OPTIONS = ['newest', 'price_asc', 'price_desc', 'rating', 'name'];

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [producers, setProducers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const { addToCart } = useCart();
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    producerId: searchParams.get('producer') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page')) || 1
  });

  const [showFilters, setShowFilters] = useState(false);

  const currentLang = useMemo(() => i18n.language || 'es', [i18n.language]);

  const fetchProducers = useCallback(async () => {
    try {
      const response = await api.get('/producers?limit=100');
      setProducers(response.data.data.producers || []);
    } catch (error) {
      console.error('Error fetching producers:', error);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.producerId) params.append('producerId', filters.producerId);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.sort && filters.sort !== 'newest') params.append('sort', filters.sort);
      params.append('page', filters.page);
      params.append('limit', 12);

      const data = await productService.getProducts(params.toString());
      setProducts(data.data.products || []);
      setTotalPages(data.totalPages || 1);
      setTotalProducts(data.total || 0);
    } catch (error) {
      toast.error(t('products.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [filters, t]);

  useEffect(() => {
    fetchProducers();
  }, [fetchProducers]);

  useEffect(() => {
    fetchProducts();
    
    const newParams = new URLSearchParams();
    if (filters.search) newParams.set('search', filters.search);
    if (filters.category) newParams.set('category', filters.category);
    if (filters.producerId) newParams.set('producer', filters.producerId);
    if (filters.minPrice) newParams.set('minPrice', filters.minPrice);
    if (filters.maxPrice) newParams.set('maxPrice', filters.maxPrice);
    if (filters.sort !== 'newest') newParams.set('sort', filters.sort);
    if (filters.page > 1) newParams.set('page', filters.page);
    
    setSearchParams(newParams);
  }, [filters, fetchProducts, setSearchParams]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value
    }));
  }, []);

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, page: 1 }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      category: '',
      producerId: '',
      minPrice: '',
      maxPrice: '',
      sort: 'newest',
      page: 1
    });
  }, []);

  const handleAddToCart = useCallback((product, e) => {
    e.preventDefault();
    e.stopPropagation();
    const result = addToCart(product);
    if (result.success === false) {
      toast.error(result.message);
    } else {
      toast.success(t('products.addedToCart'));
    }
  }, [addToCart, t]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.producerId) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    return count;
  }, [filters]);

  return (
    <div className="products-page">
      <div className="container">
        <div className="products-header">
          <h1>{t('products.title')}</h1>
          <p className="products-count">
            {totalProducts} {t('products.productsFound')}
          </p>
        </div>

        <div className="search-bar-container">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <SearchAutocomplete
              value={filters.search}
              onChange={(value) => handleFilterChange('search', value)}
              onSubmit={handleSearchSubmit}
              placeholder={t('products.search')}
            />
          </form>
          
          <button 
            className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <svg className="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            {t('common.filter')}
            {activeFiltersCount > 0 && (
              <span className="filter-badge">{activeFiltersCount}</span>
            )}
          </button>
        </div>

        <div className={`filters-panel ${showFilters ? 'open' : ''}`}>
          <div className="filters-grid">
            <div className="filter-group">
              <label>{t('products.category')}</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">{t('products.allCategories')}</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{t(`categories.${cat}`)}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>{t('products.producer')}</label>
              <select
                value={filters.producerId}
                onChange={(e) => handleFilterChange('producerId', e.target.value)}
              >
                <option value="">{t('products.allProducers')}</option>
                {producers.map(producer => (
                  <option key={producer._id} value={producer._id}>
                    {producer.businessName}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group price-range">
              <label>{t('products.priceRange')}</label>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder={t('products.min')}
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  min="0"
                  step="0.01"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder={t('products.max')}
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="filter-group">
              <label>{t('common.sort')}</label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option} value={option}>
                    {t(`products.sort_${option}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              ✕ {t('products.clearFilters')}
            </button>
          )}
        </div>

        {loading ? (
          <ListSkeleton type="product" count={8} />
        ) : products.length === 0 ? (
          <div className="no-products">
            <h2>{t('products.noProducts')}</h2>
            <p>{t('products.noProductsDesc')}</p>
            {activeFiltersCount > 0 && (
              <button className="btn btn-primary" onClick={clearFilters}>
                {t('products.clearFilters')}
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="products-grid">
              {products.map((product) => {
                const productName = product.name?.[currentLang] || product.name?.es;
                const hasSecondImage = product.images?.length > 1;
                const isNew = product.createdAt && 
                  (new Date() - new Date(product.createdAt)) < 7 * 24 * 60 * 60 * 1000;
                const hasVariants = product.hasVariants && product.variants?.length > 0;
                
                // Get minimum price for products with variants
                const displayPrice = hasVariants 
                  ? Math.min(...product.variants.map(variant => variant.price))
                  : product.price;
                
                return (
                  <article key={product._id} className="product-card">
                    {isNew && (
                      <span className="badge-new">{t('products.new')}</span>
                    )}
                    {!product.isAvailable && (
                      <span className="badge-out-of-stock">{t('products.outOfStock')}</span>
                    )}
                    {product.isAvailable && product.stock > 0 && product.stock <= 5 && (
                      <span className="badge-low-stock">{t('products.lowStock')}</span>
                    )}
                    
                    <div className="product-image-container">
                      <Link to={`/products/${product._id}`}>
                        {product.images?.[0] ? (
                          <>
                            <img 
                              src={product.images[0]} 
                              alt={productName}
                              className="product-image-main"
                            />
                            {hasSecondImage && (
                              <img 
                                src={product.images[1]} 
                                alt={productName}
                                className="product-image-hover"
                              />
                            )}
                          </>
                        ) : (
                          <div className="product-no-image" />
                        )}
                      </Link>
                    </div>

                    <h3 className="product-title">
                      <Link to={`/products/${product._id}`}>
                        {productName}
                      </Link>
                    </h3>

                    <div className="product-price-block">
                      {hasVariants && (
                        <span className="price-from">{t('products.fromPrice')}</span>
                      )}
                      <span className="product-price-main">
                        {displayPrice?.toFixed(2).replace('.', ',')}
                        <span className="currency">€</span>
                      </span>
                      <small className="product-iva">{t('products.vatIncluded')}</small>
                    </div>

                    {!hasVariants && (
                      <span className="product-unit-badge">
                        {t(`units.${product.unit}`)}
                      </span>
                    )}

                    {hasVariants && (
                      <span className="product-variants-badge">
                        {product.variants.length} {t('products.options')}
                      </span>
                    )}

                    {product.isAvailable ? (
                      hasVariants ? (
                        <Link 
                          to={`/products/${product._id}`}
                          className="btn-add-to-cart btn-select-options"
                        >
                          {t('products.selectOptions')}
                        </Link>
                      ) : (
                        <button
                          onClick={(event) => handleAddToCart(product, event)}
                          className="btn-add-to-cart"
                        >
                          {t('products.addToCart')}
                        </button>
                      )
                    ) : (
                      <button className="btn-add-to-cart disabled" disabled>
                        {t('products.outOfStock')}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  disabled={filters.page === 1}
                  onClick={() => handleFilterChange('page', filters.page - 1)}
                >
                  ← {t('common.previous')}
                </button>
                
                <div className="pagination-info">
                  {t('products.page')} {filters.page} {t('products.of')} {totalPages}
                </div>

                <button
                  className="pagination-btn"
                  disabled={filters.page === totalPages}
                  onClick={() => handleFilterChange('page', filters.page + 1)}
                >
                  {t('common.next')} →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
