import { useState } from 'react';

interface AddLinkModalProps {
  bookTitle: string;
  currentLink?: string;
  onConfirm: (link: string) => void;
  onCancel: () => void;
}

export default function AddLinkModal({
  bookTitle,
  currentLink,
  onConfirm,
  onCancel,
}: AddLinkModalProps) {
  const [link, setLink] = useState(currentLink || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (link.trim()) {
      onConfirm(link.trim());
    }
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
        style={{ maxWidth: '450px', width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>
          Add Link
        </h2>

        <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Add a purchase or reference link for <strong>{bookTitle}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: '1.5rem' }}>
            <span
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
              }}
            >
              Link URL
            </span>
            <input
              type="url"
              className="input"
              placeholder="https://www.amazon.com/..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
              required
              autoFocus
            />
            <span
              className="text-secondary"
              style={{ fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}
            >
              Enter the full URL including https://
            </span>
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
            >
              Save Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
