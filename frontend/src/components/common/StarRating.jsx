import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, max = 5, onRate, interactive = false, size = 'sm' }) => {
  const sizeClass = size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: max }).map((_, idx) => {
        const starValue = idx + 1;
        const isFilled = starValue <= Math.round(rating);

        return (
          <button
            key={idx}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate && onRate(starValue)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} p-0.5 focus:outline-none`}
          >
            <Star
              className={`${sizeClass} ${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-slate-100 text-slate-300'
              }`}
            />
          </button>
        );
      })}
      {rating > 0 && !interactive && (
        <span className="text-xs font-semibold text-slate-700 ml-1.5">
          {Number(rating).toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
