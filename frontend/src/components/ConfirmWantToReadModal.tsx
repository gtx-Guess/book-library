interface Props {
  book: {
    title: string;
    authors: string[];
    coverImage?: string;
    pageCount?: number;
  };
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmWantToReadModal({ book, onConfirm, onCancel }: Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm();
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
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Add to Want to Read</h2>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          {book.coverImage && (
            <img
              src={book.coverImage}
              alt={book.title}
              style={{
                width: '80px',
                height: '120px',
                objectFit: 'cover',
                borderRadius: '4px',
              }}
            />
          )}
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
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add to Want to Read
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
