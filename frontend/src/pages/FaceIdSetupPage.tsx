import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function FaceIdSetupPage() {
  const { registerFaceId, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSetup = async () => {
    setLoading(true);
    setError('');
    try {
      await registerFaceId();
      if (user) {
        localStorage.setItem(`webauthn_registered_${user.username}`, 'true');
        localStorage.setItem('last_webauthn_username', user.username);
      }
      navigate('/', { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setError('Setup cancelled. You can set up Face ID next time you sign in.');
      } else {
        setError('Failed to set up Face ID. You can try again next time you sign in.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    sessionStorage.setItem('webauthn_setup_skipped', 'true');
    navigate('/', { replace: true });
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
        textAlign: 'center',
      }}>
        <div style={{ marginBottom: '1rem' }}><Lock size={40} color="#6ee7b7" /></div>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#fff',
          marginBottom: '0.75rem',
        }}>
          Set up Face ID
        </h2>
        <p style={{
          color: '#8b8ba7',
          fontSize: '0.95rem',
          lineHeight: '1.5',
          marginBottom: '2rem',
        }}>
          Sign in faster next time with just a glance. Your biometric data never leaves your device.
        </p>

        <button
          onClick={handleSetup}
          disabled={loading}
          style={{
            width: '100%',
            padding: '1rem',
            background: loading ? '#1a3a2e' : '#064e3b',
            color: loading ? '#4a8a6a' : '#6ee7b7',
            border: '1px solid #065f46',
            borderRadius: '10px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '0.75rem',
            transition: 'background 0.2s',
          }}
        >
          {loading ? 'Setting up...' : 'Set up Face ID'}
        </button>

        <button
          onClick={handleSkip}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.85rem',
            background: 'transparent',
            color: '#6b6b8a',
            border: '1px solid #2a2a4a',
            borderRadius: '10px',
            fontSize: '0.95rem',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          Not now
        </button>

        {error && (
          <p style={{
            marginTop: '1rem',
            color: '#f87171',
            fontSize: '0.9rem',
          }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
