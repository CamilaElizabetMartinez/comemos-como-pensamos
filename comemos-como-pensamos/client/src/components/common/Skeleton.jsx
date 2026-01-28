import React from 'react';
import './Skeleton.css';

const Skeleton = ({ variant = 'rectangular', width, height, count = 1, className = '' }) => {
  const skeletons = Array(count).fill(null);

  return (
    <>
      {skeletons.map((_, index) => (
        <div
          key={index}
          className={`skeleton skeleton-${variant} ${className}`}
          style={{
            width: width || '100%',
            height: height || (variant === 'text' ? '1rem' : variant === 'circular' ? '40px' : '100px')
          }}
        />
      ))}
    </>
  );
};

export const OrderCardSkeleton = () => (
  <div className="skeleton-order-card">
    <div className="skeleton-order-header">
      <Skeleton variant="text" width="120px" height="1.25rem" />
      <Skeleton variant="rectangular" width="80px" height="24px" className="skeleton-badge" />
    </div>
    <div className="skeleton-order-body">
      <Skeleton variant="text" width="70%" height="0.9rem" />
      <Skeleton variant="text" width="50%" height="0.9rem" />
      <Skeleton variant="text" width="40%" height="0.9rem" />
    </div>
    <div className="skeleton-order-footer">
      <Skeleton variant="text" width="100px" height="1.5rem" />
      <Skeleton variant="rectangular" width="120px" height="36px" className="skeleton-button" />
    </div>
  </div>
);

export const ProductCardSkeleton = () => (
  <div className="skeleton-product-card">
    <Skeleton variant="rectangular" height="180px" className="skeleton-image" />
    <div className="skeleton-product-body">
      <Skeleton variant="text" width="60%" height="0.75rem" />
      <Skeleton variant="text" width="90%" height="1.1rem" />
      <Skeleton variant="text" width="40%" height="1.25rem" />
    </div>
  </div>
);

export const ProducerCardSkeleton = () => (
  <div className="skeleton-producer-card">
    <div className="skeleton-producer-header">
      <Skeleton variant="circular" width="80px" height="80px" />
      <div className="skeleton-producer-info">
        <Skeleton variant="text" width="150px" height="1.25rem" />
        <Skeleton variant="text" width="100px" height="0.85rem" />
      </div>
    </div>
    <div className="skeleton-producer-body">
      <Skeleton variant="text" width="100%" height="0.85rem" />
      <Skeleton variant="text" width="80%" height="0.85rem" />
    </div>
    <div className="skeleton-producer-footer">
      <Skeleton variant="rectangular" width="100%" height="36px" className="skeleton-button" />
    </div>
  </div>
);

export const ArticleCardSkeleton = () => (
  <div className="skeleton-article-card">
    <Skeleton variant="rectangular" height="160px" className="skeleton-image" />
    <div className="skeleton-article-body">
      <Skeleton variant="text" width="80%" height="1.1rem" />
      <Skeleton variant="text" width="100%" height="0.85rem" />
      <Skeleton variant="text" width="60%" height="0.85rem" />
      <div className="skeleton-article-meta">
        <Skeleton variant="text" width="80px" height="0.75rem" />
        <Skeleton variant="text" width="60px" height="0.75rem" />
      </div>
    </div>
  </div>
);

export const ListSkeleton = ({ type = 'order', count = 3 }) => {
  const getSkeletonComponent = () => {
    switch (type) {
      case 'order':
        return OrderCardSkeleton;
      case 'producer':
        return ProducerCardSkeleton;
      case 'article':
        return ArticleCardSkeleton;
      default:
        return ProductCardSkeleton;
    }
  };
  
  const SkeletonComponent = getSkeletonComponent();
  
  return (
    <div className={`skeleton-list skeleton-list-${type}`}>
      {Array(count).fill(null).map((_, index) => (
        <SkeletonComponent key={index} />
      ))}
    </div>
  );
};

export const ProductDetailSkeleton = () => (
  <div className="skeleton-product-detail">
    <div className="skeleton-breadcrumbs">
      <Skeleton variant="text" width="200px" height="1rem" />
    </div>
    <div className="skeleton-product-layout">
      <div className="skeleton-gallery">
        <Skeleton variant="rectangular" height="400px" className="skeleton-main-image" />
        <div className="skeleton-thumbnails">
          {Array(4).fill(null).map((_, index) => (
            <Skeleton key={index} variant="rectangular" width="80px" height="80px" />
          ))}
        </div>
      </div>
      <div className="skeleton-product-info">
        <Skeleton variant="text" width="80%" height="2rem" />
        <Skeleton variant="text" width="120px" height="1rem" />
        <Skeleton variant="text" width="100px" height="1rem" />
        <div className="skeleton-price-section">
          <Skeleton variant="text" width="150px" height="2.5rem" />
          <Skeleton variant="text" width="100px" height="1rem" />
        </div>
        <div className="skeleton-description">
          <Skeleton variant="text" width="100%" height="1rem" />
          <Skeleton variant="text" width="90%" height="1rem" />
          <Skeleton variant="text" width="70%" height="1rem" />
        </div>
        <Skeleton variant="rectangular" width="120px" height="2rem" className="skeleton-badge" />
        <div className="skeleton-actions">
          <Skeleton variant="rectangular" width="140px" height="48px" />
          <Skeleton variant="rectangular" height="48px" className="skeleton-button" />
        </div>
      </div>
    </div>
  </div>
);

export const ProducerDetailSkeleton = () => (
  <div className="skeleton-producer-detail">
    <Skeleton variant="text" width="150px" height="1rem" />
    <div className="skeleton-hero">
      <Skeleton variant="rectangular" width="180px" height="180px" />
      <div className="skeleton-hero-info">
        <Skeleton variant="text" width="250px" height="2rem" />
        <Skeleton variant="text" width="200px" height="1rem" />
        <Skeleton variant="text" width="150px" height="1rem" />
        <div className="skeleton-certifications">
          <Skeleton variant="rectangular" width="100px" height="32px" className="skeleton-badge" />
          <Skeleton variant="rectangular" width="120px" height="32px" className="skeleton-badge" />
        </div>
      </div>
    </div>
    <div className="skeleton-section">
      <Skeleton variant="text" width="120px" height="1.5rem" />
      <Skeleton variant="text" width="100%" height="1rem" />
      <Skeleton variant="text" width="90%" height="1rem" />
      <Skeleton variant="text" width="80%" height="1rem" />
    </div>
    <div className="skeleton-section">
      <Skeleton variant="text" width="180px" height="1.5rem" />
      <div className="skeleton-products-grid">
        {Array(4).fill(null).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </div>
  </div>
);

export const PageSkeleton = ({ type = 'product' }) => {
  switch (type) {
    case 'producer':
      return <ProducerDetailSkeleton />;
    default:
      return <ProductDetailSkeleton />;
  }
};

export default Skeleton;

