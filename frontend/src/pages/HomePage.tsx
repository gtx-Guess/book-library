import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, YearlyStats } from '../services/api';
import RatingDisplay from '../components/RatingDisplay';
import BookCover from '../components/BookCover';
import { useAuth } from '../contexts/AuthContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const currentYear = new Date().getFullYear();
  const [stats, setStats] = useState<YearlyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await api.getStats(currentYear);
      setStats(data);
    } catch (err) {
      setError('Failed to load stats');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
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
      {/* Welcome Header */}
      <header style={{ marginBottom: '2rem', textAlign: 'center', position: 'relative' }}>
        {/* Logout button — desktop only */}
        <button
          onClick={logout}
          className="sign-out-desktop"
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            padding: '0.3rem 0.6rem',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          Sign out
        </button>

        {/* Demo badge */}
        {user?.role === 'demo' && (
          <div style={{
            display: 'inline-block',
            background: '#fef3c7',
            color: '#92400e',
            padding: '0.25rem 0.75rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: '600',
            marginBottom: '0.5rem',
          }}>
            Demo Mode
          </div>
        )}

        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          {user?.role === 'demo' ? 'Welcome! 👋' : `Welcome ${user?.username} 👋`}
        </h1>
        <p className="text-secondary" style={{ fontSize: '1rem' }}>
          Your reading journey in {currentYear}
        </p>
      </header>

      {error && <div className="error">{error}</div>}

      {/* Pages Read */}
      <div className="card mb-3" style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          Pages Read in {currentYear}
        </h2>
        <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)' }}>
          {stats?.totalPagesRead.toLocaleString() || 0}
        </div>
        <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
          across {stats?.booksRead || 0} {stats?.booksRead === 1 ? 'book' : 'books'}
        </p>
      </div>

      {/* Last Book Added */}
      {stats?.lastBook && (
        <div className="card mb-3">
          <h2 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            Last Book Added
          </h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <BookCover src={stats.lastBook.coverImage} title={stats.lastBook.title} width={70} height={105} />
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                {stats.lastBook.title}
              </h3>
              {stats.lastBook.authors.length > 0 && (
                <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                  by {stats.lastBook.authors.join(', ')}
                </p>
              )}
              <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
                Finished: {formatDate(stats.lastBook.completedDate)}
              </p>
              {stats.lastBook.pageCount && (
                <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
                  {stats.lastBook.pageCount} pages
                </p>
              )}
              {stats.lastBook.rating && (
                <div style={{ marginTop: '0.5rem' }}>
                  <RatingDisplay rating={stats.lastBook.rating} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Goal Progress (Smaller) */}
      {stats?.hasGoal && (
        <div
          className="card mb-3"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate(`/goal/${currentYear}`)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                {currentYear} Reading Goal
              </h2>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {stats.booksRead} / {stats.goalCount} books
              </div>
              <div className="text-secondary" style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                {stats.progress}% complete
              </div>
            </div>
            <div
              style={{
                fontSize: '2rem',
                color: 'var(--text-secondary)',
              }}
            >
              →
            </div>
          </div>
        </div>
      )}

      {user?.role === 'admin' && (
        <div style={{ marginBottom: '1rem' }}>
          <button
            className="btn btn-secondary btn-full"
            onClick={() => navigate('/admin')}
            style={{ fontSize: '1.1rem', padding: '1rem' }}
          >
            Admin Dashboard
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
        <button
          className="btn btn-primary btn-full"
          onClick={() => navigate('/add')}
          style={{ fontSize: '1.1rem', padding: '1rem' }}
        >
          ➕ Add Book
        </button>
        <button
          className="btn btn-secondary btn-full"
          onClick={() => navigate(`/library/${currentYear}`)}
          style={{ fontSize: '1.1rem', padding: '1rem' }}
        >
          View {currentYear} Library
        </button>
      </div>

      <div className="mt-3">
        <button
          className="btn btn-secondary btn-full"
          onClick={() => navigate('/history')}
          style={{ fontSize: '1.1rem', padding: '1rem' }}
        >
          📈 View Reading History
        </button>
      </div>

      <div className="mt-3">
        <button
          className="btn btn-secondary btn-full"
          onClick={() => navigate('/want-to-read')}
          style={{ fontSize: '1.1rem', padding: '1rem' }}
        >
          📚 Want to Read
        </button>
      </div>

      <div className="mt-3">
        <button
          className="btn btn-secondary btn-full"
          onClick={() => navigate('/dnf')}
          style={{ fontSize: '1.1rem', padding: '1rem' }}
        >
          📕 DNF
        </button>
      </div>

      {!stats?.hasGoal && (
        <div className="mt-3">
          <button
            className="btn btn-secondary btn-full"
            onClick={() => navigate(`/goal/${currentYear}/edit`)}
          >
            Set Reading Goal
          </button>
        </div>
      )}

      {user?.role !== 'demo' && (
        <div className="mt-3">
          <button
            className="btn btn-secondary btn-full"
            onClick={() => navigate('/invite-codes')}
            style={{ fontSize: '1.1rem', padding: '1rem' }}
          >
            🔗 Invite Codes
          </button>
        </div>
      )}

      {/* Sign out — mobile only, at the bottom */}
      <div className="sign-out-mobile mt-4" style={{ textAlign: 'center' }}>
        <button
          onClick={logout}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '0.5rem',
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
