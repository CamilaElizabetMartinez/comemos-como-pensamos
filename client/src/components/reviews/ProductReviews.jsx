import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './ProductReviews.css';

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [ratingDistribution, setRatingDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const fetchReviews = useCallback(async () => {
    try {
      const response = await api.get(`/reviews/product/${productId}?page=${currentPage}&limit=5`);
      setReviews(response.data.data.reviews);
      setRatingDistribution(response.data.data.ratingDistribution || []);
      setTotalPages(response.data.totalPages);
      setTotalReviews(response.data.total);
      
      if (response.data.data.ratingDistribution?.length > 0) {
        const totalRatings = response.data.data.ratingDistribution.reduce(
          (sum, item) => sum + (item._id * item.count), 0
        );
        const totalCount = response.data.data.ratingDistribution.reduce(
          (sum, item) => sum + item.count, 0
        );
        setAverageRating(totalCount > 0 ? totalRatings / totalCount : 0);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [productId, currentPage]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating, interactive = false, onSelect = null) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
          onClick={() => interactive && onSelect && onSelect(i)}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const getRatingCount = (rating) => {
    const found = ratingDistribution.find(item => item._id === rating);
    return found ? found.count : 0;
  };

  const getRatingPercentage = (rating) => {
    if (totalReviews === 0) return 0;
    return (getRatingCount(rating) / totalReviews) * 100;
  };

  if (loading) {
    return <div className="reviews-loading">{t('common.loading')}</div>;
  }

  return (
    <div className="product-reviews">
      <h2>{t('reviews.title')}</h2>

      <div className="reviews-summary">
        <div className="average-rating">
          <span className="rating-number">{averageRating.toFixed(1)}</span>
          <div className="rating-stars">{renderStars(Math.round(averageRating))}</div>
          <span className="total-reviews">
            {totalReviews} {t('reviews.reviewsCount')}
          </span>
        </div>

        <div className="rating-breakdown">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="rating-bar-row">
              <span className="rating-label">{rating} ★</span>
              <div className="rating-bar">
                <div
                  className="rating-bar-fill"
                  style={{ width: `${getRatingPercentage(rating)}%` }}
                />
              </div>
              <span className="rating-count">{getRatingCount(rating)}</span>
            </div>
          ))}
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="no-reviews">
          <p>{t('reviews.noReviews')}</p>
          {isAuthenticated && (
            <p className="no-reviews-hint">{t('reviews.beFirstToReview')}</p>
          )}
        </div>
      ) : (
        <>
          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review._id} className="review-card">
                <div className="review-header">
                  <div className="reviewer-info">
                    <div className="reviewer-avatar">
                      {review.userId?.firstName?.charAt(0)}
                      {review.userId?.lastName?.charAt(0)}
                    </div>
                    <div className="reviewer-details">
                      <span className="reviewer-name">
                        {review.userId?.firstName} {review.userId?.lastName?.charAt(0)}.
                      </span>
                      <span className="review-date">{formatDate(review.createdAt)}</span>
                    </div>
                  </div>
                  <div className="review-rating">
                    {renderStars(review.rating)}
                  </div>
                </div>
                {review.comment && (
                  <p className="review-comment">{review.comment}</p>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="reviews-pagination">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="btn btn-pagination"
              >
                {t('common.previous')}
              </button>
              <span className="page-info">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="btn btn-pagination"
              >
                {t('common.next')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductReviews;

