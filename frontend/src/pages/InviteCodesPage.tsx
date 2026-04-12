import { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api, InviteCode } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function InviteCodesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user?.role === 'demo') {
    return <Navigate to="/" replace />;
  }
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    try {
      const data = await api.inviteCodes.getMine();
      setCodes(data);
    } catch {
      setError('Failed to load invite codes');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const newCode = await api.inviteCodes.generate();
      setCodes((prev) => [newCode, ...prev]);
    } catch {
      setError('Failed to generate invite code');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      const updated = await api.inviteCodes.deactivate(id);
      setCodes((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch {
      setError('Failed to deactivate invite code');
    }
  };

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            fontSize: '1rem',
            cursor: 'pointer',
            padding: '0',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Invite Codes</h1>
        <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
          Share codes with friends so they can create an account
        </p>
      </header>

      {error && <div className="error" style={{ marginBottom: '1rem' }}>{error}</div>}

      <button
        className="btn btn-primary btn-full"
        onClick={handleGenerate}
        disabled={generating}
        style={{ fontSize: '1.1rem', padding: '1rem', marginBottom: '1.5rem' }}
      >
        {generating ? 'Generating...' : '+ Generate New Code'}
      </button>

      {codes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <p className="text-secondary">No invite codes yet. Generate one to share with friends!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {codes.map((code) => (
            <div
              key={code.id}
              className="card"
              style={{
                opacity: code.isActive ? 1 : 0.5,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <code style={{
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      color: code.isActive ? 'var(--primary)' : 'var(--text-secondary)',
                      letterSpacing: '0.1em',
                    }}>
                      {code.code}
                    </code>
                    {code.isActive && (
                      <button
                        onClick={() => handleCopy(code.code, code.id)}
                        style={{
                          background: 'none',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          padding: '0.15rem 0.4rem',
                          fontSize: '0.75rem',
                          color: copiedId === code.id ? '#6ee7b7' : 'var(--text-secondary)',
                          cursor: 'pointer',
                        }}
                      >
                        {copiedId === code.id ? 'Copied!' : 'Copy'}
                      </button>
                    )}
                  </div>
                  <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
                    Used {code.useCount} / {code.maxUses} times
                  </p>
                  {!code.isActive && (
                    <p style={{ fontSize: '0.8rem', color: '#f87171', marginTop: '0.25rem' }}>
                      Deactivated
                    </p>
                  )}
                </div>
                {code.isActive && code.useCount < code.maxUses && (
                  <button
                    onClick={() => handleDeactivate(code.id)}
                    style={{
                      background: 'none',
                      border: '1px solid #7f1d1d',
                      borderRadius: '6px',
                      padding: '0.3rem 0.6rem',
                      fontSize: '0.75rem',
                      color: '#f87171',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Deactivate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
