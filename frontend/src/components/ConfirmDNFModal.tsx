import { useState } from 'react';
import BookCover from './BookCover';

interface Props {
  book: {
    title: string;
    authors: string[];
    coverImage?: string;
    pageCount?: number;
  };
  onConfirm: (own: boolean | undefined, willPurchase: string | undefined) => void;
  onCancel: () => void;
}

export default function ConfirmDNFModal({ book, onConfirm, onCancel }: Props) {
  const [own, setOwn] = useState<string>('');
  const [willPurchase, setWillPurchase] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(
      own === '' ? undefined : own === 'yes',
      willPurchase === '' ? undefined : willPurchase
    );
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
        padding: '1rem',
        zIndex: 1000,
      }}
      onClick={onCancel}
    >
      <div
        className="card"
        style={{ maxWidth: '500px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Add DNF Book</h2>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <BookCover src={book.coverImage} title={book.title} width={80} height={120} />
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{book.title}</h3>
            {book.authors.length > 0 && (
              <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
                {book.authors.join(', ')}
              </p>
            )}
            {book.pageCount && (
              <p className="text-secondary" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                {book.pageCount} pages
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: '1rem' }}>
            <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
              Do you own this book?
            </span>
            <select
              className="input"
              value={own}
              onChange={(e) => setOwn(e.target.value)}
            >
              <option value="">Not specified</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>

          <label style={{ display: 'block', marginBottom: '1.5rem' }}>
            <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
              Will you purchase this book?
            </span>
            <select
              className="input"
              value={willPurchase}
              onChange={(e) => setWillPurchase(e.target.value)}
            >
              <option value="">Not specified</option>
              <option value="yes">Yes</option>
              <option value="maybe">Maybe</option>
              <option value="no">No</option>
            </select>
          </label>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add to DNF
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
