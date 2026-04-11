import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ImportSummary, SyncStatus } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ImportSummaryModal from '../components/ImportSummaryModal';

interface SyncToast {
  syncId: string;
  status: SyncStatus['status'] | 'idle';
  total: number;
  processed: number;
  message: string;
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);

  const [toast, setToast] = useState<SyncToast | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so the same file can be re-selected
    e.target.value = '';

    setImportError('');
    setImporting(true);
    try {
      const summary = await api.importGoodReads(file);
      setImportSummary(summary);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Import failed. Please check the file and try again.';
      setImportError(msg);
    } finally {
      setImporting(false);
    }
  };

  const startSync = async (bookIds: string[]) => {
    setImportSummary(null);
    try {
      const { syncId } = await api.startImportSync(bookIds);

      setToast({ syncId, status: 'idle', total: 0, processed: 0, message: 'Starting metadata sync…' });

      pollIntervalRef.current = setInterval(async () => {
        try {
          const status = await api.getImportSyncStatus(syncId);
          setToast((prev) =>
            prev
              ? {
                  ...prev,
                  status: status.status,
                  total: status.total,
                  processed: status.processed,
                  message:
                    status.status === 'running'
                      ? `Syncing metadata… ${status.processed} / ${status.total}`
                      : status.status === 'completed'
                      ? 'Metadata synced successfully!'
                      : 'Sync failed.',
                }
              : prev
          );

          if (status.status === 'completed' || status.status === 'failed') {
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            setTimeout(() => setToast(null), 4000);
          }
        } catch {
          // 404 or any error → treat as done
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          setToast((prev) =>
            prev ? { ...prev, status: 'completed', message: 'Metadata synced successfully!' } : prev
          );
          setTimeout(() => setToast(null), 4000);
        }
      }, 3000);
    } catch {
      setImportError('Failed to start metadata sync.');
    }
  };

  const handleSyncMetadata = () => {
    if (!importSummary) return;
    startSync(importSummary.importedBookIds);
  };

  const isDemo = user?.role === 'demo';

  const progressPercent =
    toast && toast.total > 0 ? Math.round((toast.processed / toast.total) * 100) : 0;

  return (
    <div className="container">
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            padding: '0.25rem',
            lineHeight: 1,
          }}
          aria-label="Back"
        >
          ←
        </button>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: 0 }}>Settings</h1>
      </header>

      {/* Import from GoodReads card */}
      <div className="card mb-3">
        <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Import from GoodReads
        </h2>
        <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
          Export your GoodReads library as a CSV file and import it here. Your books will be sorted
          into the matching lists (Read, Currently Reading, Want to Read, DNF).
        </p>

        {importError && (
          <div className="error" style={{ marginBottom: '1rem' }}>
            {importError}
          </div>
        )}

        {isDemo ? (
          <p className="text-secondary" style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>
            Import is not available in demo mode.
          </p>
        ) : (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <button
              className="btn btn-primary"
              disabled={importing}
              onClick={() => fileInputRef.current?.click()}
            >
              {importing ? 'Importing…' : 'Choose GoodReads CSV'}
            </button>
          </>
        )}
      </div>

      {/* Import summary modal */}
      {importSummary && (
        <ImportSummaryModal
          summary={importSummary}
          onSyncMetadata={handleSyncMetadata}
          onClose={() => setImportSummary(null)}
        />
      )}

      {/* Sync progress toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            background: 'var(--card-bg, #fff)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '1rem 1.25rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            zIndex: 2000,
            minWidth: '260px',
            maxWidth: '340px',
          }}
        >
          <p style={{ margin: 0, marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
            {toast.message}
          </p>
          {toast.status === 'running' && toast.total > 0 && (
            <>
              <div
                style={{
                  height: '6px',
                  background: 'var(--border)',
                  borderRadius: '999px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${progressPercent}%`,
                    background: 'var(--primary)',
                    borderRadius: '999px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <p className="text-secondary" style={{ fontSize: '0.8rem', marginTop: '0.35rem', marginBottom: 0 }}>
                {progressPercent}%
              </p>
            </>
          )}
          {(toast.status === 'idle' || (toast.status === 'running' && toast.total === 0)) && (
            <div
              style={{
                height: '6px',
                background: 'var(--border)',
                borderRadius: '999px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: '40%',
                  background: 'var(--primary)',
                  borderRadius: '999px',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
