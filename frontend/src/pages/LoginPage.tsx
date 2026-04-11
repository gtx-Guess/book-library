import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isPlatformAuthenticatorAvailable } from '../utils/webauthn';

export default function LoginPage() {
  const { login, loginAsDemo, loginWithFaceId } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [faceIdLoading, setFaceIdLoading] = useState(false);
  const [hasBiometrics, setHasBiometrics] = useState(false);
  const [platformAvailable, setPlatformAvailable] = useState(false);

  const lastWebAuthnUser = localStorage.getItem('last_webauthn_username');

  useEffect(() => {
    isPlatformAuthenticatorAvailable().then((available) => {
      setHasBiometrics(available);
      setPlatformAvailable(available && !!lastWebAuthnUser);
    });
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      // Migrate old key to user-specific key
      if (localStorage.getItem('webauthn_registered') === 'true' && !localStorage.getItem(`webauthn_registered_${username}`)) {
        localStorage.setItem(`webauthn_registered_${username}`, 'true');
        localStorage.removeItem('webauthn_registered');
      }
      const alreadyRegistered = localStorage.getItem(`webauthn_registered_${username}`) === 'true';
      const skippedThisSession = sessionStorage.getItem('webauthn_setup_skipped') === 'true';
      if (hasBiometrics && !alreadyRegistered && !skippedThisSession) {
        navigate('/setup-face-id', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 429) {
        setError('Too many login attempts. Please wait a few minutes and try again.');
      } else {
        setError('Invalid username or password');
      }
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
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 429) {
        setError('Too many login attempts. Please wait a few minutes and try again.');
      } else {
        setError('Failed to load demo. Please try again.');
      }
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
        // Username in localStorage may be stale (e.g. account renamed) — clear it
        localStorage.removeItem('last_webauthn_username');
        setPlatformAvailable(false);
        setError('No Face ID set up for that account. Please sign in with your password.');
      } else {
        setError('Face ID sign-in failed. Please use your password.');
      }
    } finally {
      setFaceIdLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(180deg, #1a1040 0%, #0f1628 100%)',
        padding: '40px 24px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle glow */}
        <div style={{
          position: 'absolute',
          width: 200,
          height: 200,
          background: 'radial-gradient(circle, rgba(37,99,235,0.15), transparent)',
          top: -40,
          left: '50%',
          transform: 'translateX(-50%)',
        }} />

        {/* Book spines */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 4,
          marginBottom: 16,
          position: 'relative',
          zIndex: 2,
        }}>
          {[
            { w: 18, h: 90, bg: 'linear-gradient(180deg,#dc2626,#991b1b)' },
            { w: 14, h: 80, bg: 'linear-gradient(180deg,#2563eb,#1e40af)', mt: 10 },
            { w: 20, h: 95, bg: 'linear-gradient(180deg,#059669,#047857)' },
            { w: 12, h: 75, bg: 'linear-gradient(180deg,#d97706,#b45309)', mt: 15 },
            { w: 22, h: 100, bg: 'linear-gradient(180deg,#7c3aed,#6d28d9)' },
            { w: 16, h: 85, bg: 'linear-gradient(180deg,#0891b2,#0e7490)', mt: 5 },
            { w: 18, h: 92, bg: 'linear-gradient(180deg,#e11d48,#be123c)' },
            { w: 14, h: 78, bg: 'linear-gradient(180deg,#4f46e5,#4338ca)', mt: 12 },
            { w: 20, h: 88, bg: 'linear-gradient(180deg,#16a34a,#15803d)', mt: 2 },
          ].map((book, i) => (
            <div
              key={i}
              style={{
                width: book.w,
                height: book.h,
                background: book.bg,
                borderRadius: 3,
                marginTop: book.mt || 0,
                boxShadow: '2px 2px 8px rgba(0,0,0,0.3)',
              }}
            />
          ))}
        </div>

        {/* Shelf line */}
        <div style={{
          height: 4,
          background: 'linear-gradient(90deg, transparent, #4a3520, #6b4c30, #4a3520, transparent)',
          borderRadius: 2,
          marginBottom: 16,
          position: 'relative',
          zIndex: 2,
        }} />

        {/* Title */}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: '0 0 4px 0' }}>
            Book Tracker
          </h1>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
            Your personal reading journal
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div style={{ padding: '24px', maxWidth: 400, margin: '0 auto' }}>
        {/* Face ID button */}
        {platformAvailable && (
          <>
            <button
              onClick={handleFaceIdLogin}
              disabled={faceIdLoading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 10,
                border: '1px solid rgba(16,185,129,0.3)',
                background: 'rgba(6,78,59,0.4)',
                color: '#6ee7b7',
                fontSize: 14,
                fontWeight: 600,
                cursor: faceIdLoading ? 'not-allowed' : 'pointer',
                marginBottom: 12,
              }}
            >
              {faceIdLoading ? 'Authenticating...' : `🔒 Sign in as ${lastWebAuthnUser} with Face ID`}
            </button>

            {/* Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              margin: '12px 0',
            }}>
              <div style={{ flex: 1, height: 1, background: '#2a2a4a' }} />
              <span style={{ fontSize: 11, color: '#4a4a6a' }}>or use password</span>
              <div style={{ flex: 1, height: 1, background: '#2a2a4a' }} />
            </div>
          </>
        )}

        {/* Password form — always visible */}
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            style={{
              width: '100%',
              padding: '11px 14px',
              borderRadius: 10,
              border: '1px solid #2a2a4a',
              background: 'rgba(15,15,30,0.6)',
              color: '#e2e8f0',
              fontSize: 13,
              marginBottom: 10,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            style={{
              width: '100%',
              padding: '11px 14px',
              borderRadius: 10,
              border: '1px solid #2a2a4a',
              background: 'rgba(15,15,30,0.6)',
              color: '#e2e8f0',
              fontSize: 13,
              marginBottom: 12,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <button
            type="submit"
            disabled={loading || !username || !password}
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 10,
              border: 'none',
              background: (!username || !password) ? '#1e293b' : '#2563eb',
              color: (!username || !password) ? '#64748b' : 'white',
              fontSize: 14,
              fontWeight: 600,
              cursor: (!username || !password) ? 'not-allowed' : 'pointer',
              boxShadow: (username && password) ? '0 4px 16px rgba(37,99,235,0.3)' : 'none',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          margin: '16px 0',
        }}>
          <div style={{ flex: 1, height: 1, background: '#2a2a4a' }} />
          <span style={{ fontSize: 11, color: '#4a4a6a' }}>or</span>
          <div style={{ flex: 1, height: 1, background: '#2a2a4a' }} />
        </div>

        {/* Demo button */}
        <button
          onClick={handleDemoLogin}
          disabled={demoLoading}
          style={{
            width: '100%',
            padding: 12,
            borderRadius: 10,
            border: '1px solid rgba(79,70,229,0.3)',
            background: 'rgba(79,70,229,0.2)',
            color: '#a5b4fc',
            fontSize: 14,
            fontWeight: 600,
            cursor: demoLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {demoLoading ? 'Loading demo...' : 'Try the Demo →'}
        </button>

        {/* Bottom links */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: 16,
        }}>
          <span
            onClick={() => navigate('/register')}
            style={{ fontSize: 12, color: '#2563eb', cursor: 'pointer' }}
          >
            Have an invite code? Create account
          </span>
        </div>

        {/* Error */}
        {error && (
          <p style={{ color: '#f87171', fontSize: 13, textAlign: 'center', marginTop: 12 }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
