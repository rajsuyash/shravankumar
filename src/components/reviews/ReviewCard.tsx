import React from 'react';
import { Icon } from '../ui/Icon';
import { format } from 'date-fns';

interface ReviewCardProps {
  review: {
    id: string;
    overall_rating: number;
    safety_rating: number;
    comfort_rating: number;
    guide_rating: number;
    value_rating: number;
    medical_support_rating: number;
    review_text: string;
    photos: string[];
    created_at: string;
    users?: { full_name?: string; email?: string };
  };
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Icon
          key={s}
          name={s <= rating ? 'star' : s - 0.5 <= rating ? 'star_half' : 'star_border'}
          className={`text-sm ${s <= rating ? 'text-amber-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const displayName =
    review.users?.full_name || review.users?.email?.split('@')[0] || 'Pilgrim';

  return (
    <div className="bg-white rounded-xl p-5 border border-[#e7dfda]">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-[#181410] text-sm">{displayName}</p>
            <p className="text-xs text-gray-400">
              {format(new Date(review.created_at), 'dd MMM yyyy')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Icon name="star" className="text-amber-400 text-lg" />
          <span className="font-bold text-[#181410]">{review.overall_rating.toFixed(1)}</span>
        </div>
      </div>

      {review.review_text && (
        <p className="text-sm text-gray-700 mb-3 leading-relaxed">{review.review_text}</p>
      )}

      {review.photos && review.photos.length > 0 && (
        <div className="flex gap-2 mb-3 overflow-x-auto">
          {review.photos.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`Review photo ${i + 1}`}
              className="w-20 h-20 rounded-lg object-cover shrink-0 border"
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-x-4 gap-y-1 pt-3 border-t border-gray-100">
        {[
          { label: 'Safety', value: review.safety_rating },
          { label: 'Comfort', value: review.comfort_rating },
          { label: 'Guide', value: review.guide_rating },
          { label: 'Value', value: review.value_rating },
          { label: 'Medical', value: review.medical_support_rating },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center gap-1">
            <span className="text-[10px] text-gray-500">{label}</span>
            <Stars rating={value} />
          </div>
        ))}
      </div>
    </div>
  );
};
