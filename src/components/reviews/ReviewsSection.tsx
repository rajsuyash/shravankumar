import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Icon } from '../ui/Icon';
import { ReviewCard } from './ReviewCard';

interface ReviewsSectionProps {
  circuitId: string;
}

interface Review {
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
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ circuitId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 5;

  useEffect(() => {
    fetchReviews();
  }, [circuitId, sortBy]);

  const fetchReviews = async () => {
    setLoading(true);
    let query = supabase
      .from('reviews')
      .select('*, users(full_name, email)')
      .eq('circuit_id', circuitId)
      .eq('status', 'approved');

    if (sortBy === 'newest') query = query.order('created_at', { ascending: false });
    else if (sortBy === 'highest') query = query.order('overall_rating', { ascending: false });
    else query = query.order('overall_rating', { ascending: true });

    const { data, error } = await query;
    if (error) {
      console.error('Failed to fetch reviews:', error);
    }
    setReviews((data || []) as Review[]);
    setPage(0);
    setLoading(false);
  };

  const paged = reviews.slice(0, (page + 1) * PAGE_SIZE);
  const hasMore = paged.length < reviews.length;

  // Compute averages
  const avg = (key: keyof Review) => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((a, r) => a + (r[key] as number), 0);
    return sum / reviews.length;
  };

  const overallAvg = avg('overall_rating');

  if (loading) {
    return (
      <div className="py-8 text-center">
        <Icon name="progress_activity" className="text-primary text-3xl animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#181410]">Reviews</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Icon
                    key={s}
                    name={s <= Math.round(overallAvg) ? 'star' : 'star_border'}
                    className={`text-lg ${s <= Math.round(overallAvg) ? 'text-amber-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="font-bold text-[#181410]">{overallAvg.toFixed(1)}</span>
              <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
            </div>
          )}
        </div>

        {reviews.length > 1 && (
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="newest">Most Recent</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <Icon name="rate_review" className="text-gray-300 text-4xl" />
          <p className="text-gray-400 mt-2">No reviews yet. Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {paged.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
          {hasMore && (
            <button
              onClick={() => setPage((p) => p + 1)}
              className="w-full py-3 text-sm text-primary font-medium hover:bg-primary/5 rounded-lg transition-colors"
            >
              Show more reviews
            </button>
          )}
        </div>
      )}
    </div>
  );
};
