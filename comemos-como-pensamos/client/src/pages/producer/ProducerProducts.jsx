import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './ProducerProducts.css';

const ProducerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [producer, setProducer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'producer') {
      navigate('/');
      return;
    }
    fetchProducerAndProducts();
  }, [user, navigate]);

  const fetchProducerAndProducts = async () => {
    try {
      const producerRes = await api.get('/producers/me');
      const prod = producerRes.data.data.producer;
      setProducer(prod);

      const productsRes = await api.get(`/products?producerId=${prod._id}&limit=100`);
      setProducts(productsRes.data.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error(t('producer.products.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm(t('producer.products.confirmDelete'))) return;

    try {
      await api.delete(`/products/${productId}`);
      setProducts(products.filter(p => p._id !== productId));
      toast.success(t('producer.products.deleted'));
    } catch (error) {
      toast.error(t('producer.products.deleteError'));
    }
  };

  const handleToggleAvailability = async (product) => {
    try {
      await api.put(`/products/${product._id}`, {
        isAvailable: !product.isAvailable
      });
      setProducts(products.map(p => 
        p._id === product._id ? { ...p, isAvailable: !p.isAvailable } : p
      ));
      toast.success(
        product.isAvailable 
          ? t('producer.products.deactivated') 
          : t('producer.products.activated')
      );
    } catch (error) {
      toast.error(t('producer.products.updateError'));
    }
  };

  const getLocalizedText = (textObject) => {
    if (!textObject) return '';
    return textObject[i18n.language] || textObject.es || '';
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = getLocalizedText(product.name)
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'active') return matchesSearch && product.isAvailable && product.stock > 0;
    if (filter === 'inactive') return matchesSearch && (!product.isAvailable || product.stock === 0);
    if (filter === 'lowStock') return matchesSearch && product.stock > 0 && product.stock <= 5;
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="producer-products">
        <div className="container">
          <div className="loading">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="producer-products">
      <div className="container">
        <header className="page-header">
          <div className="header-left">
            <Link to="/producer" className="back-link">
              ← {t('producer.products.backToDashboard')}
            </Link>
            <h1>{t('producer.products.title')}</h1>
          </div>
          <Link to="/producer/products/new" className="btn btn-primary">
            ➕ {t('producer.products.addNew')}
          </Link>
        </header>

        <div className="products-toolbar">
          <div className="search-box">
            <input
              type="text"
              placeholder={t('producer.products.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              {t('producer.products.filterAll')} ({products.length})
            </button>
            <button
              className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              {t('producer.products.filterActive')} (
              {products.filter(p => p.isAvailable && p.stock > 0).length})
            </button>
            <button
              className={`filter-tab ${filter === 'inactive' ? 'active' : ''}`}
              onClick={() => setFilter('inactive')}
            >
              {t('producer.products.filterInactive')} (
              {products.filter(p => !p.isAvailable || p.stock === 0).length})
            </button>
            <button
              className={`filter-tab ${filter === 'lowStock' ? 'active' : ''}`}
              onClick={() => setFilter('lowStock')}
            >
              ⚠️ {t('producer.products.filterLowStock')} (
              {products.filter(p => p.stock > 0 && p.stock <= 5).length})
            </button>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="no-products">
            <p>{t('producer.products.noProducts')}</p>
            <Link to="/producer/products/new" className="btn btn-primary">
              {t('producer.products.createFirst')}
            </Link>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <div key={product._id} className="product-card">
                <div className="product-image">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={getLocalizedText(product.name)} />
                  ) : (
                    <div className="no-image">📦</div>
                  )}
                  <span className={`availability-badge ${product.isAvailable && product.stock > 0 ? 'available' : 'unavailable'}`}>
                    {product.isAvailable && product.stock > 0 
                      ? t('producer.products.available') 
                      : t('producer.products.unavailable')}
                  </span>
                </div>
                <div className="product-info">
                  <h3>{getLocalizedText(product.name)}</h3>
                  <div className="product-meta">
                    <span className="price">€{product.price?.toFixed(2)}/{product.unit}</span>
                    <span className={`stock ${product.stock <= 5 ? 'low' : ''}`}>
                      {t('producer.products.stock')}: {product.stock}
                    </span>
                  </div>
                  <p className="category">{t(`categories.${product.category}`)}</p>
                </div>
                <div className="product-actions">
                  <button
                    onClick={() => navigate(`/producer/products/edit/${product._id}`)}
                    className="btn btn-small btn-edit"
                  >
                    ✏️ {t('common.edit')}
                  </button>
                  <button
                    onClick={() => handleToggleAvailability(product)}
                    className={`btn btn-small ${product.isAvailable ? 'btn-deactivate' : 'btn-activate'}`}
                  >
                    {product.isAvailable ? '⏸️' : '▶️'}
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product._id)}
                    className="btn btn-small btn-delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProducerProducts;

