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
  const { user, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [syncing, setSyncing] = useState(false);

  const [toast, setToast] = useState<SyncToast | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentYear = new Date().getFullYear();
  const [goalInfo, setGoalInfo] = useState<{ hasGoal: boolean; booksRead: number; goalCount: number; progress: number } | null>(null);
  const [hasWebAuthn, setHasWebAuthn] = useState(false);
  const [inviteCodeCount, setInviteCodeCount] = useState(0);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    async function loadSettingsData() {
      try {
        const stats = await api.getStats(currentYear);
        setGoalInfo({
          hasGoal: stats.hasGoal,
          booksRead: stats.booksRead,
          goalCount: stats.goalCount,
          progress: stats.progress,
        });
      } catch (err) {
        console.error('Failed to load goal info:', err);
      }

      if (user?.role !== 'demo') {
        try {
          const codes = await api.inviteCodes.getMine();
          const activeCount = codes.filter((c: any) => c.isActive).length;
          setInviteCodeCount(activeCount);
        } catch (err) {
          console.error('Failed to load invite codes:', err);
        }
      }

      try {
        const lastUser = localStorage.getItem('last_webauthn_username');
        setHasWebAuthn(!!lastUser);
      } catch {
        setHasWebAuthn(false);
      }
    }
    loadSettingsData();
  }, [currentYear, user?.role]);

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

  const startSyncPolling = (syncId: string) => {
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
  };

  const startSync = async (bookIds: string[]) => {
    setImportSummary(null);
    try {
      const { syncId } = await api.startImportSync(bookIds);
      startSyncPolling(syncId);
    } catch {
      setImportError('Failed to start metadata sync.');
    }
  };

  const handleSyncMetadata = () => {
    if (!importSummary) return;
    startSync(importSummary.importedBookIds);
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    setImportError('');
    try {
      const result = await api.syncAllMetadata();
      if (!result.syncId) {
        setToast({ syncId: '', status: 'completed', total: 0, processed: 0, message: result.message || 'All books already have metadata' });
        setTimeout(() => setToast(null), 4000);
      } else {
        startSyncPolling(result.syncId);
      }
    } catch {
      setImportError('Failed to start metadata sync.');
    } finally {
      setSyncing(false);
    }
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

      {/* Reading Goal */}
      <div className="card mb-3">
        <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          📊 Reading Goal
        </h2>
        {goalInfo?.hasGoal ? (
          <>
            <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
              {goalInfo.booksRead} / {goalInfo.goalCount} books · {goalInfo.progress}% complete
            </p>
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/goal/${currentYear}/edit`)}
            >
              Edit Goal
            </button>
          </>
        ) : (
          <>
            <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
              Set a reading goal to track your progress this year.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/goal/${currentYear}/edit`)}
            >
              Set Reading Goal
            </button>
          </>
        )}
      </div>

      {/* Face ID / Security */}
      {!isDemo && (
        <div className="card mb-3">
          <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            🔒 Security
          </h2>
          <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
            {hasWebAuthn ? 'Face ID / passkey is configured.' : 'Set up Face ID or a passkey for quick sign-in.'}
          </p>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/setup-face-id')}
          >
            {hasWebAuthn ? 'Manage Face ID' : 'Set Up Face ID'}
          </button>
        </div>
      )}

      {/* Invite Codes */}
      {!isDemo && (
        <div className="card mb-3">
          <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            🔗 Invite Codes
          </h2>
          <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
            {inviteCodeCount > 0
              ? `You have ${inviteCodeCount} active invite code${inviteCodeCount !== 1 ? 's' : ''}.`
              : 'Share codes with friends so they can create an account.'}
          </p>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/invite-codes')}
          >
            Manage Invite Codes
          </button>
        </div>
      )}

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

      {/* Sync Metadata card */}
      {!isDemo && (
        <div className="card mb-3">
          <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            Sync Metadata
          </h2>
          <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
            Fetch cover images, descriptions, and categories from Google Books for any books that are missing them.
          </p>
          <button
            className="btn btn-secondary"
            disabled={syncing || !!toast}
            onClick={handleSyncAll}
          >
            {syncing ? 'Starting…' : toast ? 'Syncing…' : 'Sync Metadata'}
          </button>
        </div>
      )}

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
            left: '1rem',
            right: '1rem',
            maxWidth: '340px',
            marginLeft: 'auto',
            background: 'var(--card-bg, #fff)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '1rem 1.25rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            zIndex: 2000,
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
      {/* Sign Out */}
      <button
        onClick={logout}
        className="btn btn-danger btn-full"
        style={{ marginTop: '1rem', marginBottom: '1rem' }}
      >
        Sign Out
      </button>
    </div>
  );
}
