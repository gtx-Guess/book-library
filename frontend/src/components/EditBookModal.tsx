import { useState } from 'react';
import InlineStars from './InlineStars';

interface EditBookModalProps {
  bookTitle: string;
  currentOwn?: boolean;
  currentWillPurchase?: string;
  currentLink?: string;
  currentRating?: number;
  hideRating?: boolean;
  onConfirm: (data: { own?: boolean; willPurchase?: string; link?: string; rating?: number | null }) => void;
  onDelete: () => void;
  onCancel: () => void;
}

export default function EditBookModal({
  bookTitle,
  currentOwn,
  currentWillPurchase,
  currentLink,
  currentRating,
  hideRating,
  onConfirm,
  onDelete,
  onCancel,
}: EditBookModalProps) {
  const [own, setOwn] = useState(
    currentOwn === undefined ? '' : currentOwn ? 'yes' : 'no'
  );
  const [willPurchase, setWillPurchase] = useState(
    currentWillPurchase || ''
  );
  const [link, setLink] = useState(currentLink || '');
  const [rating, setRating] = useState(
    currentRating !== undefined ? currentRating.toString() : ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: { own?: boolean; willPurchase?: string; link?: string; rating?: number | null } = {};

    if (own !== '') {
      data.own = own === 'yes';
    }

    if (willPurchase !== '') {
      data.willPurchase = willPurchase;
    }

    if (link.trim()) {
      data.link = link.trim();
    } else if (currentLink) {
      data.link = '';
    }

    if (rating.trim()) {
      data.rating = Math.min(10, Math.max(0, parseFloat(rating)));
    } else if (currentRating !== undefined) {
      data.rating = null;
    }

    onConfirm(data);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
      onClick={onCancel}
    >
      <div
        className="card"
        style={{ maxWidth: '450px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>
          Edit Book Details
        </h2>

        <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Update details for <strong>{bookTitle}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: '1rem' }}>
            <span
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
              }}
            >
              Do you own this book?
            </span>
            <select
              className="input"
              value={own}
              onChange={(e) => setOwn(e.target.value)}
            >
              <option value="">Not Set</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>

          <label style={{ display: 'block', marginBottom: '1rem' }}>
            <span
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
              }}
            >
              Will you purchase this book?
            </span>
            <select
              className="input"
              value={willPurchase}
              onChange={(e) => setWillPurchase(e.target.value)}
            >
              <option value="">Not Set</option>
              <option value="yes">Yes</option>
              <option value="maybe">Maybe</option>
              <option value="no">No</option>
            </select>
          </label>

          {!hideRating && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '600' }}>Rating (Optional)</span>
                <InlineStars rating={rating.trim() && !isNaN(parseFloat(rating)) ? Math.min(10, Math.max(0, parseFloat(rating))) : undefined} />
              </div>
              <input
                type="text"
                inputMode="decimal"
                className="input"
                placeholder="e.g. 7.5"
                value={rating}
                onChange={(e) => setRating(e.target.value.slice(0, 3))}
              />
            </div>
          )}

          <label style={{ display: 'block', marginBottom: '1.5rem' }}>
            <span
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
              }}
            >
              Link (Optional)
            </span>
            <input
              type="url"
              className="input"
              placeholder="https://www.amazon.com/..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
            <span
              className="text-secondary"
              style={{ fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}
            >
              Add or update a purchase/reference link
            </span>
          </label>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              Save Changes
            </button>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-danger btn-full"
              onClick={onDelete}
              style={{ fontSize: '0.9rem' }}
            >
              Remove Book from Library
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
