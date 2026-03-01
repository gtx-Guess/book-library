import { useState } from 'react';
import BookCover from './BookCover';
import InlineStars from './InlineStars';

interface ConfirmBookModalProps {
  book: {
    title: string;
    authors: string[];
    coverImage?: string;
    pageCount?: number;
    isbn?: string;
  };
  defaultDate?: string;
  onConfirm: (pageCount: number | undefined, completedDate: string, rating: number | undefined, own: boolean | undefined, willPurchase: string | undefined, link: string | undefined) => void;
  onCancel: () => void;
}

export default function ConfirmBookModal({
  book,
  defaultDate,
  onConfirm,
  onCancel,
}: ConfirmBookModalProps) {
  const [pageCount, setPageCount] = useState(
    book.pageCount?.toString() || ''
  );
  const [completedDate, setCompletedDate] = useState(
    defaultDate || new Date().toISOString().split('T')[0]
  );
  const [rating, setRating] = useState('');
  const [own, setOwn] = useState('');
  const [willPurchase, setWillPurchase] = useState('');
  const [link, setLink] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPageCount = pageCount.trim()
      ? parseInt(pageCount, 10)
      : undefined;
    const finalRating = rating.trim() ? Math.min(10, Math.max(0, parseFloat(rating))) : undefined;
    const finalOwn = own === 'yes' ? true : own === 'no' ? false : undefined;
    const finalWillPurchase = willPurchase === '' ? undefined : willPurchase;
    const finalLink = link.trim() || undefined;
    onConfirm(finalPageCount, completedDate, finalRating, finalOwn, finalWillPurchase, finalLink);
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
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
          Confirm Book Details
        </h2>

        {/* Book Preview */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <BookCover src={book.coverImage} title={book.title} width={60} height={90} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', fontWeight: '600' }}>
              {book.title}
            </h3>
            {book.authors.length > 0 && (
              <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                <strong>Author:</strong> {book.authors.join(', ')}
              </p>
            )}
            {book.isbn && (
              <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
                <strong>ISBN:</strong> {book.isbn}
              </p>
            )}
          </div>
        </div>

        {/* Editable Form */}
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: '1rem' }}>
            <span
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
              }}
            >
              Completion Date
            </span>
            <input
              type="date"
              className="input"
              value={completedDate}
              onChange={(e) => setCompletedDate(e.target.value)}
              required
            />
            <span
              className="text-secondary"
              style={{ fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}
            >
              When did you finish this book?
            </span>
          </label>

          <label style={{ display: 'block', marginBottom: '1rem' }}>
            <span
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
              }}
            >
              Page Count
              {book.pageCount && (
                <span className="text-secondary" style={{ fontWeight: 'normal', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                  (Suggested: {book.pageCount})
                </span>
              )}
            </span>
            <input
              type="number"
              className="input"
              placeholder={book.pageCount ? book.pageCount.toString() : "Enter page count (optional)"}
              value={pageCount}
              onChange={(e) => setPageCount(e.target.value)}
              min="1"
            />
            <span
              className="text-secondary"
              style={{ fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}
            >
              You can edit this or leave it empty
            </span>
          </label>

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
              <option value="">Select...</option>
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
              <option value="">Select...</option>
              <option value="yes">Yes</option>
              <option value="maybe">Maybe</option>
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
              Add a link to purchase or more info
            </span>
          </label>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
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
              Confirm & Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
