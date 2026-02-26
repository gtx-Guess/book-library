import { useState } from 'react';

interface EditBookModalProps {
  bookTitle: string;
  currentOwn?: boolean;
  currentWillPurchase?: string;
  currentLink?: string;
  onConfirm: (data: { own?: boolean; willPurchase?: string; link?: string }) => void;
  onDelete: () => void;
  onCancel: () => void;
}

export default function EditBookModal({
  bookTitle,
  currentOwn,
  currentWillPurchase,
  currentLink,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: { own?: boolean; willPurchase?: string; link?: string } = {};

    if (own !== '') {
      data.own = own === 'yes';
    }

    if (willPurchase !== '') {
      data.willPurchase = willPurchase;
    }

    if (link.trim()) {
      data.link = link.trim();
    } else if (currentLink) {
      // If link was cleared, set it to empty string to remove it
      data.link = '';
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
