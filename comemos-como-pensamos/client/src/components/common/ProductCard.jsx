import React, { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';
import './ProductCard.css';

const ProductCard = ({ product, showAddToCart = true }) => {
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();

  const currentLang = useMemo(() => i18n.language || 'es', [i18n.language]);

  const productName = useMemo(() => 
    product.name?.[currentLang] || product.name?.es || '',
    [product.name, currentLang]
  );

  const hasSecondImage = useMemo(() => 
    product.images?.length > 1,
    [product.images]
  );

  const isNew = useMemo(() => 
    product.createdAt && (new Date() - new Date(product.createdAt)) < 7 * 24 * 60 * 60 * 1000,
    [product.createdAt]
  );

  const hasVariants = useMemo(() => 
    product.hasVariants && product.variants?.length > 0,
    [product.hasVariants, product.variants]
  );

  const isLowStock = useMemo(() => 
    product.isAvailable && product.stock > 0 && product.stock <= 5,
    [product.isAvailable, product.stock]
  );

  const displayPrice = useMemo(() => {
    if (hasVariants) {
      return Math.min(...product.variants.map(variant => variant.price));
    }
    return product.price;
  }, [hasVariants, product.variants, product.price]);

  const unitLabel = useMemo(() => {
    if (hasVariants && product.variants?.[0]) {
      const defaultVariant = product.variants.find(v => v.isDefault) || product.variants[0];
      if (defaultVariant.weight && defaultVariant.weightUnit) {
        return `${defaultVariant.weight}${defaultVariant.weightUnit}`;
      }
    }
    return product.unit ? t(`units.${product.unit}`) : null;
  }, [hasVariants, product.variants, product.unit, t]);

  const handleAddToCart = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    const result = addToCart(product);
    if (result.success === false) {
      toast.error(result.message);
    } else {
      toast.success(t('products.addedToCart'));
    }
  }, [addToCart, product, t]);

  return (
    <article className="product-card">
      {isNew && (
        <span className="badge-new">{t('products.new')}</span>
      )}
      {isLowStock && (
        <span className="badge-low-stock">{t('products.lowStock', 'Últimas unidades')}</span>
      )}
      {!product.isAvailable && (
        <span className="badge-out-of-stock">{t('products.outOfStock')}</span>
      )}
      
      <div className="product-image-container">
        <Link to={`/products/${product._id}`}>
          {product.images?.[0] ? (
            <>
              <img 
                src={product.images[0]} 
                alt={productName}
                className="product-image-main"
                loading="lazy"
              />
              {hasSecondImage && (
                <img 
                  src={product.images[1]} 
                  alt={productName}
                  className="product-image-hover"
                  loading="lazy"
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
        <span className="product-vat">{t('products.vatIncluded')}</span>
      </div>

      {unitLabel && (
        <span className="product-weight-badge">{unitLabel}</span>
      )}

      {showAddToCart && (
        product.isAvailable ? (
          hasVariants ? (
            <Link 
              to={`/products/${product._id}`}
              className="btn-add-to-cart btn-select-options"
            >
              {t('products.selectOptions')}
            </Link>
          ) : (
            <button
              onClick={handleAddToCart}
              className="btn-add-to-cart"
            >
              {t('products.addToCart')}
            </button>
          )
        ) : (
          <button className="btn-add-to-cart disabled" disabled>
            {t('products.outOfStock')}
          </button>
        )
      )}
    </article>
  );
};

export default ProductCard;
