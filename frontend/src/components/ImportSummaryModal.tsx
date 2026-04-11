import { ImportSummary } from '../services/api';

interface Props {
  summary: ImportSummary;
  onSyncMetadata: () => void;
  onClose: () => void;
}

export default function ImportSummaryModal({ summary, onSyncMetadata, onClose }: Props) {
  const totalImported =
    summary.imported.completed +
    summary.imported.currentlyReading +
    summary.imported.wantToRead +
    summary.imported.dnf;

  const listRows: Array<{ label: string; count: number }> = [
    { label: 'Completed / Read', count: summary.imported.completed },
    { label: 'Currently Reading', count: summary.imported.currentlyReading },
    { label: 'Want to Read', count: summary.imported.wantToRead },
    { label: 'DNF', count: summary.imported.dnf },
  ].filter((row) => row.count > 0);

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
      onClick={onClose}
    >
      <div
        className="card"
        style={{ maxWidth: '500px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Import Complete</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.25rem',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: '0.25rem',
              lineHeight: 1,
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {totalImported === 0 ? (
          <>
            <p className="text-secondary" style={{ marginBottom: '1.25rem' }}>
              No new books were imported.
            </p>
            <button className="btn btn-primary" onClick={onClose}>
              Done
            </button>
          </>
        ) : (
          <>
            {/* Total count */}
            <p style={{ color: '#16a34a', fontWeight: '600', fontSize: '1.05rem', marginBottom: '1rem' }}>
              {totalImported} {totalImported === 1 ? 'book' : 'books'} imported successfully
            </p>

            {/* Per-list breakdown */}
            {listRows.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                <tbody>
                  {listRows.map((row) => (
                    <tr key={row.label}>
                      <td style={{ padding: '0.35rem 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        {row.label}
                      </td>
                      <td style={{ padding: '0.35rem 0', textAlign: 'right', fontWeight: '600', fontSize: '0.95rem' }}>
                        {row.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Skipped duplicates */}
            {summary.skipped.duplicates > 0 && (
              <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                {summary.skipped.duplicates}{' '}
                {summary.skipped.duplicates === 1 ? 'book' : 'books'} already in your library (skipped)
              </p>
            )}

            {/* Custom shelves warning */}
            {summary.customShelves.length > 0 && (
              <div
                style={{
                  background: '#fef3c7',
                  border: '1px solid #f59e0b',
                  borderRadius: '6px',
                  padding: '0.75rem 1rem',
                  marginBottom: '1rem',
                }}
              >
                <p
                  style={{
                    color: '#92400e',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    letterSpacing: '0.05em',
                    marginBottom: '0.5rem',
                  }}
                >
                  CUSTOM SHELVES — NOT IMPORTED
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  {summary.customShelves.map((shelf) => (
                    <li key={shelf.name} style={{ color: '#92400e', fontSize: '0.9rem' }}>
                      {shelf.name} ({shelf.count})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
              <button className="btn btn-primary" onClick={onSyncMetadata}>
                Sync Metadata (covers, descriptions)
              </button>
              <button className="btn btn-secondary" onClick={onClose}>
                Skip
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
