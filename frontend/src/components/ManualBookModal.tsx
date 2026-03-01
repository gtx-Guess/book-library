import { useState } from 'react';

export interface ManualBookData {
  title: string;
  authors: string[];
  pageCount?: number;
  publishedDate?: string;
  publisher?: string;
}

interface ManualBookModalProps {
  onSubmit: (book: ManualBookData) => void;
  onCancel: () => void;
}

export default function ManualBookModal({ onSubmit, onCancel }: ManualBookModalProps) {
  const [title, setTitle] = useState('');
  const [authorsRaw, setAuthorsRaw] = useState('');
  const [pageCount, setPageCount] = useState('');
  const [publishedDate, setPublishedDate] = useState('');
  const [publisher, setPublisher] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const authors = authorsRaw
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    onSubmit({
      title: title.trim(),
      authors,
      pageCount: pageCount ? parseInt(pageCount, 10) : undefined,
      publishedDate: publishedDate || undefined,
      publisher: publisher.trim() || undefined,
    });
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
        <h2 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Add Book Manually</h2>
        <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Fill in what you know — only the title is required.
        </p>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: '1rem' }}>
            <span style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Title <span style={{ color: '#f87171' }}>*</span>
            </span>
            <input
              type="text"
              className="input"
              placeholder="e.g. The Name of the Wind"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </label>

          <label style={{ display: 'block', marginBottom: '1rem' }}>
            <span style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Author(s)
            </span>
            <input
              type="text"
              className="input"
              placeholder="e.g. Patrick Rothfuss, J.R.R. Tolkien"
              value={authorsRaw}
              onChange={(e) => setAuthorsRaw(e.target.value)}
            />
            <span className="text-secondary" style={{ fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
              Separate multiple authors with a comma
            </span>
          </label>

          <label style={{ display: 'block', marginBottom: '1rem' }}>
            <span style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Page Count
            </span>
            <input
              type="number"
              className="input"
              placeholder="e.g. 662"
              value={pageCount}
              onChange={(e) => setPageCount(e.target.value)}
              min="1"
            />
          </label>

          <label style={{ display: 'block', marginBottom: '1rem' }}>
            <span style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Published Year
            </span>
            <input
              type="text"
              className="input"
              placeholder="e.g. 2007"
              value={publishedDate}
              onChange={(e) => setPublishedDate(e.target.value)}
            />
          </label>

          <label style={{ display: 'block', marginBottom: '1.5rem' }}>
            <span style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Publisher
            </span>
            <input
              type="text"
              className="input"
              placeholder="e.g. DAW Books"
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
            />
          </label>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
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
              disabled={!title.trim()}
            >
              Next →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
