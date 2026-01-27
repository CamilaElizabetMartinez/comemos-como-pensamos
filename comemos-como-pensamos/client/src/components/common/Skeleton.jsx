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

export default Skeleton;

