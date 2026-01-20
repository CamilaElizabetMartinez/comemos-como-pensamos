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

export const ListSkeleton = ({ type = 'order', count = 3 }) => (
  <div className={`skeleton-list skeleton-list-${type}`}>
    {Array(count).fill(null).map((_, index) => (
      type === 'order' ? <OrderCardSkeleton key={index} /> : <ProductCardSkeleton key={index} />
    ))}
  </div>
);

export default Skeleton;

