import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import './ProductsPage.css';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { t } = useTranslation();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data.data.products);
    } catch (error) {
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success('Producto agregado al carrito');
  };

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  return (
    <div className="products-page">
      <div className="container">
        <h1>{t('products.title')}</h1>
        <div className="products-grid">
          {products.map((product) => (
            <div key={product._id} className="product-card">
              {product.images?.[0] && (
                <img src={product.images[0]} alt={product.name?.es} />
              )}
              <div className="product-info">
                <h3>{product.name?.es}</h3>
                <p className="product-price">€{product.price?.toFixed(2)}</p>
                <p className="product-unit">{product.unit}</p>
                {product.isAvailable ? (
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="btn btn-primary"
                  >
                    {t('products.addToCart')}
                  </button>
                ) : (
                  <button className="btn" disabled>
                    {t('products.outOfStock')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
