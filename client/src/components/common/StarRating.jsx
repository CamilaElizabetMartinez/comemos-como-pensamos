import React, { useMemo, memo } from 'react';
import PropTypes from 'prop-types';
import { IconStarFilled, IconStarOutline } from './Icons';
import './StarRating.css';

const StarRating = ({ rating = 0, size = 16, showEmpty = true, maxStars = 5 }) => {
  const stars = useMemo(() => {
    const result = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < maxStars; i++) {
      if (i < fullStars) {
        result.push(
          <IconStarFilled key={i} size={size} className="star-icon filled" />
        );
      } else if (i === fullStars && hasHalfStar) {
        result.push(
          <span key={i} className="star-icon half">
            <IconStarOutline size={size} className="star-outline" />
            <span className="star-half-fill">
              <IconStarFilled size={size} />
            </span>
          </span>
        );
      } else if (showEmpty) {
        result.push(
          <IconStarOutline key={i} size={size} className="star-icon empty" />
        );
      }
    }
    return result;
  }, [rating, size, showEmpty, maxStars]);

  return (
    <span className="star-rating" aria-label={`${rating} de ${maxStars} estrellas`}>
      {stars}
    </span>
  );
};

StarRating.propTypes = {
  rating: PropTypes.number,
  size: PropTypes.number,
  showEmpty: PropTypes.bool,
  maxStars: PropTypes.number,
};

export default memo(StarRating);
