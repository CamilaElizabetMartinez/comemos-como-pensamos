import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { TableSkeleton } from '../../components/common/Skeleton';
import { IconSearch, IconStar, IconStarOutline, IconEye, IconPackage } from '../../components/common/Icons';
import './AdminProducts.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = `/admin/products?page=${currentPage}&limit=15`;
        if (featuredFilter) url += `&featured=${featuredFilter}`;

        const response = await api.get(url);
        if (response.data.success) {
          setProducts(response.data.data.products || []);
          setTotalPages(response.data.data.pagination?.pages || 1);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error(t('admin.products.errorLoading', 'Error al cargar productos'));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user, navigate, currentPage, featuredFilter, t]);

  const handleToggleFeatured = useCallback(async (productId) => {
    try {
      const response = await api.put(`/admin/products/${productId}/featured`);
      if (response.data.success) {
        setProducts(currentProducts => 
          currentProducts.map(product => 
            product._id === productId 
              ? { ...product, isFeatured: response.data.data.isFeatured }
              : product
          )
        );
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(t('admin.products.toggleError', 'Error al actualizar producto'));
    }
  }, [t]);

  const handleSearch = useCallback((event) => {
    event.preventDefault();
    setCurrentPage(1);
  }, []);

  const formatPrice = useMemo(() => (price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }, []);

  const getProductName = useCallback((product) => {
    if (typeof product.name === 'string') return product.name;
    return product.name?.es || product.name?.en || Object.values(product.name || {})[0] || '';
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(product => {
      const name = getProductName(product);
      return name.toLowerCase().includes(term);
    });
  }, [products, searchTerm, getProductName]);

  if (loading && products.length === 0) {
    return (
      <div className="admin-products">
        <div className="container">
          <TableSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-products">
      <div className="container">
        <header className="page-header">
          <div className="header-left">
            <Link to="/admin" className="back-link">
              ← {t('admin.products.backToDashboard', 'Volver al panel')}
            </Link>
            <h1>{t('admin.products.title', 'Gestión de Productos')}</h1>
          </div>
        </header>

        <div className="toolbar">
          <form onSubmit={handleSearch} className="search-box">
            <input
              type="text"
              placeholder={t('admin.products.searchPlaceholder', 'Buscar por nombre...')}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <button type="submit" className="btn-search" aria-label="Buscar">
              <IconSearch size={18} />
            </button>
          </form>
          <div className="featured-filters">
            <button
              className={`filter-btn ${featuredFilter === '' ? 'active' : ''}`}
              onClick={() => { setFeaturedFilter(''); setCurrentPage(1); }}
            >
              {t('admin.products.allProducts', 'Todos')}
            </button>
            <button
              className={`filter-btn ${featuredFilter === 'true' ? 'active' : ''}`}
              onClick={() => { setFeaturedFilter('true'); setCurrentPage(1); }}
            >
              <IconStar size={16} /> {t('admin.products.featuredOnly', 'Destacados')}
            </button>
            <button
              className={`filter-btn ${featuredFilter === 'false' ? 'active' : ''}`}
              onClick={() => { setFeaturedFilter('false'); setCurrentPage(1); }}
            >
              {t('admin.products.notFeatured', 'No destacados')}
            </button>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <IconPackage size={48} />
            <h3>{t('admin.products.noProductsTitle', 'No hay productos')}</h3>
            <p>{t('admin.products.noProducts', 'No se encontraron productos con los filtros actuales')}</p>
          </div>
        ) : (
          <div className="products-table-container">
            <table className="products-table">
              <thead>
                <tr>
                  <th>{t('admin.products.product', 'Producto')}</th>
                  <th>{t('admin.products.producer', 'Productor')}</th>
                  <th>{t('admin.products.price', 'Precio')}</th>
                  <th>{t('admin.products.stock', 'Stock')}</th>
                  <th>{t('admin.products.featured', 'Destacado')}</th>
                  <th>{t('admin.products.actions', 'Acciones')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <div className="product-cell">
                        <img 
                          src={product.images?.[0] || '/placeholder-product.png'} 
                          alt={getProductName(product)}
                          className="product-thumb"
                        />
                        <div className="product-info">
                          <span className="product-name">{getProductName(product)}</span>
                          <span className="product-category">{product.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="producer-cell">
                      {product.producerId?.businessName || '-'}
                    </td>
                    <td className="price-cell">{formatPrice(product.price)}</td>
                    <td className="stock-cell">
                      <span className={`stock-badge ${product.stock > 10 ? 'in-stock' : product.stock > 0 ? 'low-stock' : 'out-of-stock'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleFeatured(product._id)}
                        className={`featured-toggle ${product.isFeatured ? 'is-featured' : ''}`}
                        title={product.isFeatured ? 'Quitar de destacados' : 'Marcar como destacado'}
                        aria-label={product.isFeatured ? 'Quitar de destacados' : 'Marcar como destacado'}
                      >
                        {product.isFeatured ? <IconStar size={20} /> : <IconStarOutline size={20} />}
                      </button>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link 
                          to={`/products/${product._id}`} 
                          className="btn-view"
                          title={t('common.view', 'Ver')}
                          aria-label={t('common.view', 'Ver')}
                        >
                          <IconEye size={18} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="btn btn-pagination"
            >
              {t('common.previous', 'Anterior')}
            </button>
            <span className="page-info">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-pagination"
            >
              {t('common.next', 'Siguiente')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
