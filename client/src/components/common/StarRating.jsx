import React, { useMemo } from 'react';
import { IconStarFilled, IconStarOutline } from './Icons';

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
          <span key={i} className="star-icon half" style={{ position: 'relative', display: 'inline-block' }}>
            <IconStarOutline size={size} style={{ position: 'absolute', left: 0 }} />
            <span style={{ overflow: 'hidden', width: '50%', display: 'inline-block' }}>
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

export default StarRating;
