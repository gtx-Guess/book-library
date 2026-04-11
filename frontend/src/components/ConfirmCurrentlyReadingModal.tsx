import { useState } from 'react';
import BookCover from './BookCover';

interface Props {
  book: {
    title: string;
    authors: string[];
    coverImage?: string;
    pageCount?: number;
  };
  onConfirm: (startedDate?: string) => void;
  onCancel: () => void;
}

export default function ConfirmCurrentlyReadingModal({ book, onConfirm, onCancel }: Props) {
  const [startedDate, setStartedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(startedDate || undefined);
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
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Add to Currently Reading</h2>

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
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
              Started Date
            </label>
            <input
              type="date"
              className="input"
              value={startedDate}
              onChange={(e) => setStartedDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add to Currently Reading
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
