import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';
import toast from '../../lib/toast';

interface ReviewFormProps {
  circuitId: string;
  bookingId: string;
  circuitName: string;
  onSubmitted: () => void;
  onCancel: () => void;
}

const RATING_CATEGORIES = [
  { key: 'overall_rating', label: 'Overall Experience' },
  { key: 'safety_rating', label: 'Safety & Security' },
  { key: 'comfort_rating', label: 'Comfort & Accommodation' },
  { key: 'guide_rating', label: 'Guide & Support' },
  { key: 'value_rating', label: 'Value for Money' },
  { key: 'medical_support_rating', label: 'Medical Support' },
] as const;

function StarRating({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-gray-700 min-w-[140px]">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(star)}
            className="p-0.5"
          >
            <Icon
              name={star <= (hover || value) ? 'star' : 'star_border'}
              className={`text-2xl ${
                star <= (hover || value) ? 'text-amber-400' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  circuitId,
  bookingId,
  circuitName,
  onSubmitted,
  onCancel,
}) => {
  const { user } = useAuth();
  const [ratings, setRatings] = useState<Record<string, number>>({
    overall_rating: 0,
    safety_rating: 0,
    comfort_rating: 0,
    guide_rating: 0,
    value_rating: 0,
    medical_support_rating: 0,
  });
  const [reviewText, setReviewText] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 5 - photos.length;
    if (files.length > remaining) {
      toast.error(`You can upload up to 5 photos. ${remaining} slot(s) remaining.`);
    }
    setPhotos((prev) => [...prev, ...files.slice(0, remaining)]);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (ratings.overall_rating === 0) {
      toast.error('Please provide an overall rating');
      return;
    }

    setSubmitting(true);
    try {
      // Upload photos
      const photoUrls: string[] = [];
      for (const photo of photos) {
        const ext = photo.name.split('.').pop();
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('review-photos')
          .upload(path, photo);
        if (uploadError) {
          console.error('Photo upload error:', uploadError);
          continue;
        }
        const { data: urlData } = supabase.storage.from('review-photos').getPublicUrl(path);
        photoUrls.push(urlData.publicUrl);
      }

      const { error } = await supabase.from('reviews').insert({
        circuit_id: circuitId,
        booking_id: bookingId,
        user_id: user.id,
        ...ratings,
        review_text: reviewText,
        photos: photoUrls,
        status: 'pending',
      });

      if (error) throw error;

      toast.success('Review submitted! It will be visible after moderation.');
      onSubmitted();
    } catch (err) {
      console.error('Review submit error:', err);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-[#e7dfda]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#181410]">Write a Review</h2>
            <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded-lg">
              <Icon name="close" className="text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">{circuitName}</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-[#181410] text-sm">Ratings</h3>
            {RATING_CATEGORIES.map(({ key, label }) => (
              <StarRating
                key={key}
                label={label}
                value={ratings[key]}
                onChange={(v) => setRatings((prev) => ({ ...prev, [key]: v }))}
              />
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#181410] mb-2">
              Your Experience
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your pilgrimage experience..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#181410] mb-2">
              Photos ({photos.length}/5)
            </label>
            <div className="flex flex-wrap gap-2">
              {photos.map((photo, i) => (
                <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removePhoto(i)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-bl p-0.5"
                  >
                    <Icon name="close" className="text-xs" />
                  </button>
                </div>
              ))}
              {photos.length < 5 && (
                <label className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                  <Icon name="add_a_photo" className="text-gray-400" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoAdd}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-[#e7dfda] flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      </div>
    </div>
  );
};
