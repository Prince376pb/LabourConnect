import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import StarRating from '../../components/common/StarRating';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const ReviewModal = ({ isOpen, onClose, revieweeId, revieweeName, jobId, serviceRequestId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        revieweeId,
        rating,
        reviewText,
        jobId: jobId || null,
        serviceRequestId: serviceRequestId || null
      };

      await api.post('/reviews', payload);
      success('Review submitted successfully!');
      if (onReviewSubmitted) onReviewSubmitted();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit review.';
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Submit Review for ${revieweeName || 'User'}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Overall Rating</label>
          <div className="flex items-center space-x-2">
            <StarRating rating={rating} onRate={setRating} interactive size="lg" />
            <span className="text-sm font-bold text-slate-700 ml-2">{rating} out of 5</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Feedback / Comments</label>
          <textarea
            rows="4"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your experience working together..."
            className="w-full rounded-lg border-slate-300 border text-sm p-3 focus:ring-teal-500 focus:border-teal-500"
            required
          ></textarea>
        </div>

        <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Submit Review
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReviewModal;
