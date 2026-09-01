import React, { useState } from 'react';
import Modal from '../common/Modal';
import { reviewApi } from '../../api/services';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export default function ReviewModal({ isOpen, onClose, order, onReviewed }) {
  const { showToast } = useNotifications();
  const { t } = useAuth();
  const [storeRating, setStoreRating] = useState(5);
  const [driverRating, setDriverRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setStoreRating(5);
      setDriverRating(5);
      setComment('');
      setSubmitting(false);
    }
  }, [isOpen]);

  if (!order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await reviewApi.createReview({
        orderId: order.id,
        storeRating,
        driverRating,
        comment,
      });
      showToast(t('reviewSuccess'), 'success');
      if (onReviewed) onReviewed();
      onClose();
    } catch (err) {
      showToast(err.message || t('reviewError'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, setRating) => {
    return (
      <div style={{ display: 'flex', gap: '0.4rem', cursor: 'pointer', fontSize: '1.6rem' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            onClick={() => setRating(star)}
            style={{
              color: star <= rating ? 'var(--accent-amber)' : 'var(--border-strong)',
              transition: 'transform var(--transition-fast)',
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${t('reviewModalTitle')} #${order.orderNumber || order.id}`}
    >
      <form onSubmit={handleSubmit}>
        {/* Store Rating */}
        <div className="form-group">
          <label className="form-label">{t('storeRatingLabel')} ({order.storeName || 'Store'})</label>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {renderStars(storeRating, setStoreRating)}
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{storeRating} {t('outOf5')}</span>
          </div>
        </div>

        {/* Driver Rating */}
        <div className="form-group">
          <label className="form-label">{t('driverRatingLabel')}</label>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {renderStars(driverRating, setDriverRating)}
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{driverRating} {t('outOf5')}</span>
          </div>
        </div>

        {/* Comment */}
        <div className="form-group">
          <label className="form-label">{t('commentLabel')}</label>
          <textarea
            className="form-textarea"
            rows="3"
            placeholder={t('commentPlaceholder')}
            value={comment}
            onChange={e => setComment(e.target.value)}
          ></textarea>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '0.5rem' }}
          disabled={submitting}
        >
          {submitting ? t('submittingReview') : t('submitReviewBtn')}
        </button>
      </form>
    </Modal>
  );
}
