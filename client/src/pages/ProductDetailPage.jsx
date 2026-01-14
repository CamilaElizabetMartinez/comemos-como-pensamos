import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const data = await productService.getProductById(id);
      setProduct(data.data.product);
    } catch (error) {
      toast.error('Error al cargar producto');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product);
    toast.success('Producto agregado al carrito');
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (!product) return <div className="loading">Producto no encontrado</div>;

  return (
    <div className="product-detail-page">
      <div className="container">
        <div className="product-detail">
          <div className="product-images">
            {product.images?.map((img, index) => (
              <img key={index} src={img} alt={product.name?.es} />
            ))}
          </div>
          <div className="product-details">
            <h1>{product.name?.es}</h1>
            <p className="price">€{product.price?.toFixed(2)} / {product.unit}</p>
            <p className="description">{product.description?.es}</p>
            <p className="stock">Stock: {product.stock} unidades</p>
            {product.isAvailable ? (
              <button onClick={handleAddToCart} className="btn btn-primary">
                Agregar al Carrito
              </button>
            ) : (
              <button className="btn" disabled>Sin Stock</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
