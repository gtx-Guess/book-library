import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login, loginAsDemo, loginWithFaceId } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [faceIdLoading, setFaceIdLoading] = useState(false);

  const handleOwnerLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login('owner', password);
      const alreadyRegistered = localStorage.getItem('webauthn_registered') === 'true';
      const skippedThisSession = sessionStorage.getItem('webauthn_setup_skipped') === 'true';
      if (!alreadyRegistered && !skippedThisSession) {
        navigate('/setup-face-id', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch {
      setError('Invalid password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setDemoLoading(true);
    try {
      await loginAsDemo();
      navigate('/', { replace: true });
    } catch {
      setError('Failed to load demo. Please try again.');
    } finally {
      setDemoLoading(false);
    }
  };

  const handleFaceIdLogin = async () => {
    setError('');
    setFaceIdLoading(true);
    try {
      await loginWithFaceId();
      navigate('/', { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setError('Face ID cancelled.');
      } else if (err instanceof Error && err.message?.includes('No WebAuthn credentials')) {
        setError('No Face ID set up yet. Please sign in with your password first.');
      } else {
        setError('Face ID sign-in failed. Please use your password.');
      }
    } finally {
      setFaceIdLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: '#1a1a2e',
        borderRadius: '16px',
        border: '1px solid #2a2a4a',
        padding: '2.5rem 2rem',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📚</div>
          <h1 style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: '#fff',
            marginBottom: '0.5rem',
          }}>
            Book Tracker
          </h1>
          <p style={{ color: '#8b8ba7', fontSize: '0.9rem' }}>
            Your personal reading journal
          </p>
        </div>

        {/* Face ID Button */}
        <button
          onClick={handleFaceIdLogin}
          disabled={faceIdLoading}
          style={{
            width: '100%',
            padding: '1rem',
            background: faceIdLoading ? '#1a3a2e' : '#064e3b',
            color: faceIdLoading ? '#4a8a6a' : '#6ee7b7',
            border: '1px solid #065f46',
            borderRadius: '10px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: faceIdLoading ? 'not-allowed' : 'pointer',
            marginBottom: '0.75rem',
            transition: 'background 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          {faceIdLoading ? 'Authenticating...' : '🔒 Sign in with Face ID'}
        </button>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1rem',
        }}>
          <div style={{ flex: 1, height: '1px', background: '#2a2a4a' }} />
          <span style={{ color: '#4a4a6a', fontSize: '0.85rem' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: '#2a2a4a' }} />
        </div>

        {/* Demo Button */}
        <button
          onClick={handleDemoLogin}
          disabled={demoLoading}
          style={{
            width: '100%',
            padding: '1rem',
            background: demoLoading ? '#3a3a6a' : '#4f46e5',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: demoLoading ? 'not-allowed' : 'pointer',
            marginBottom: '0.75rem',
            transition: 'background 0.2s',
          }}
        >
          {demoLoading ? 'Loading demo...' : 'Try the Demo →'}
        </button>
        <p style={{
          textAlign: 'center',
          color: '#6b6b8a',
          fontSize: '0.8rem',
          marginBottom: '1.5rem',
        }}>
          Explore with a pre-loaded 2025 reading library
        </p>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ flex: 1, height: '1px', background: '#2a2a4a' }} />
          <span style={{ color: '#4a4a6a', fontSize: '0.85rem' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: '#2a2a4a' }} />
        </div>

        {/* Owner Login */}
        <form onSubmit={handleOwnerLogin}>
          <label style={{
            display: 'block',
            color: '#8b8ba7',
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.75rem',
          }}>
            Owner Access
          </label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            style={{
              width: '100%',
              padding: '0.85rem 1rem',
              background: '#0f0f1f',
              border: '1px solid #2a2a4a',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '1rem',
              marginBottom: '0.75rem',
              boxSizing: 'border-box',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={loading || !password}
            style={{
              width: '100%',
              padding: '0.85rem',
              background: loading || !password ? '#1f1f3a' : '#2d2d5a',
              color: loading || !password ? '#4a4a6a' : '#a0a0d0',
              border: '1px solid #3a3a6a',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: loading || !password ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {error && (
          <p style={{
            marginTop: '1rem',
            color: '#f87171',
            fontSize: '0.9rem',
            textAlign: 'center',
          }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
