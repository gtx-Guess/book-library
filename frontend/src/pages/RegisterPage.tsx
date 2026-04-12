import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Library } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isPlatformAuthenticatorAvailable } from '../utils/webauthn';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(username, password, inviteCode);
      const canBiometric = await isPlatformAuthenticatorAvailable();
      if (canBiometric) {
        navigate('/setup-face-id', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err: unknown) {
      const resp = (err as { response?: { status?: number; data?: { error?: string } } })?.response;
      if (resp?.status === 429) {
        setError('Too many attempts. Please wait a few minutes and try again.');
      } else if (resp?.data?.error) {
        setError(resp.data.error);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.85rem 1rem',
    background: '#0f0f1f',
    border: '1px solid #2a2a4a',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '1rem',
    marginBottom: '0.75rem',
    boxSizing: 'border-box' as const,
    outline: 'none',
  };

  const isValid = username && password && confirmPassword && inviteCode;

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
          <div style={{ marginBottom: '0.5rem' }}><Library size={40} color="#6ee7b7" /></div>
          <h1 style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: '#fff',
            marginBottom: '0.5rem',
          }}>
            Create Account
          </h1>
          <p style={{ color: '#8b8ba7', fontSize: '0.9rem' }}>
            Join with an invite code
          </p>
        </div>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Invite code"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            autoComplete="off"
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={loading || !isValid}
            style={{
              width: '100%',
              padding: '0.85rem',
              background: loading || !isValid ? '#1a3a2e' : '#064e3b',
              color: loading || !isValid ? '#4a8a6a' : '#6ee7b7',
              border: '1px solid #065f46',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading || !isValid ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              marginTop: '0.25rem',
            }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Error */}
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

        {/* Back to login */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link
            to="/login"
            style={{
              color: '#6b6b8a',
              fontSize: '0.85rem',
              textDecoration: 'underline',
              textDecorationColor: '#3a3a5a',
            }}
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
