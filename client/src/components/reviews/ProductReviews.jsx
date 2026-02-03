import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { IconStarFilled } from '../common/Icons';
import './ProductReviews.css';

const ProductReviews = ({ productId, description }) => {
  const [activeTab, setActiveTab] = useState(description ? 'description' : 'reviews');
  const [reviews, setReviews] = useState([]);
  const [ratingDistribution, setRatingDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

  const tabs = useMemo(() => {
    const tabList = [];
    if (description) {
      tabList.push({ id: 'description', label: t('productTabs.description') });
    }
    tabList.push({ id: 'reviews', label: `${t('productTabs.reviews')} (${totalReviews})` });
    return tabList;
  }, [description, totalReviews, t]);

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
          role={interactive ? 'button' : undefined}
          aria-label={interactive ? `${i} estrellas` : undefined}
        >
          <IconStarFilled size={18} />
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

  const handleSubmitReview = async (event) => {
    event.preventDefault();
    
    if (newReview.rating === 0) {
      toast.error(t('reviews.selectRating'));
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/reviews', {
        productId,
        rating: newReview.rating,
        comment: newReview.comment
      });
      
      toast.success(t('reviews.reviewAdded'));
      setNewReview({ rating: 0, comment: '' });
      setShowReviewForm(false);
      setCurrentPage(1);
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      const errorMessage = error.response?.data?.message || t('reviews.reviewError');
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const hasUserReviewed = reviews.some(review => review.userId?._id === user?._id);

  return (
    <div className="product-tabs-wrapper">
      {/* Tabs Navigation */}
      <ul className="product-tabs" role="tablist">
        {tabs.map((tab) => (
          <li
            key={tab.id}
            role="presentation"
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
          >
            <button
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tab-panel-${tab.id}`}
              onClick={() => handleTabChange(tab.id)}
              tabIndex={activeTab === tab.id ? 0 : -1}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>

      {/* Tab Panels */}
      <div className="tab-panels">
        {/* Description Panel */}
        {description && (
          <div
            id="tab-panel-description"
            role="tabpanel"
            aria-labelledby="tab-description"
            className={`tab-panel ${activeTab === 'description' ? 'active' : ''}`}
          >
            <div className="description-content">
              {description.split('\n').map((paragraph, index) => (
                paragraph.trim() && <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Panel */}
        <div
          id="tab-panel-reviews"
          role="tabpanel"
          aria-labelledby="tab-reviews"
          className={`tab-panel ${activeTab === 'reviews' ? 'active' : ''}`}
        >
          {loading ? (
            <div className="reviews-loading">{t('common.loading')}</div>
          ) : (
            <div className="reviews-content">
              <h2 className="reviews-title">{t('reviews.title')}</h2>

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
                      <span className="rating-label">{rating} <IconStarFilled size={12} /></span>
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

              {isAuthenticated && !hasUserReviewed && (
                <div className="write-review-section">
                  {!showReviewForm ? (
                    <button 
                      className="btn btn-write-review"
                      onClick={() => setShowReviewForm(true)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      {t('reviews.writeReview')}
                    </button>
                  ) : (
                    <form onSubmit={handleSubmitReview} className="review-form">
                      <div className="review-form-header">
                        <h3>{t('reviews.writeReview')}</h3>
                        <button
                          type="button"
                          className="btn-close-form"
                          onClick={() => {
                            setShowReviewForm(false);
                            setNewReview({ rating: 0, comment: '' });
                          }}
                          aria-label={t('common.close')}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="form-group">
                        <label>{t('reviews.yourRating')} *</label>
                        <div className="rating-selector">
                          {renderStars(newReview.rating, true, (rating) => 
                            setNewReview(prev => ({ ...prev, rating }))
                          )}
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="review-comment">{t('reviews.yourComment')}</label>
                        <textarea
                          id="review-comment"
                          value={newReview.comment}
                          onChange={(event) => setNewReview(prev => ({ ...prev, comment: event.target.value }))}
                          placeholder={t('reviews.commentPlaceholder')}
                          rows={4}
                        />
                      </div>

                      <div className="form-actions">
                        <button 
                          type="button" 
                          className="btn btn-cancel"
                          onClick={() => {
                            setShowReviewForm(false);
                            setNewReview({ rating: 0, comment: '' });
                          }}
                        >
                          {t('common.cancel')}
                        </button>
                        <button 
                          type="submit" 
                          className="btn btn-submit"
                          disabled={submitting || newReview.rating === 0}
                        >
                          {submitting ? t('common.loading') : t('reviews.submitReview')}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {reviews.length === 0 ? (
                <div className="no-reviews">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;

