import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, YearlyStats } from '../services/api';
import RatingDisplay from '../components/RatingDisplay';
import BookCover from '../components/BookCover';
import homeIcon from '../assets/home.png';

export default function YearDetailsPage() {
  const navigate = useNavigate();
  const { year } = useParams<{ year: string }>();
  const yearNum = parseInt(year || new Date().getFullYear().toString());
  const [stats, setStats] = useState<YearlyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, [yearNum]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await api.getStats(yearNum);
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
      timeZone: 'UTC',
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
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', position: 'relative' }}>
        <button
          onClick={() => navigate('/history')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '0.5rem',
            marginRight: '0.5rem',
          }}
        >
          ←
        </button>
        <div style={{ flex: 1, textAlign: 'center', marginRight: '35pt'}}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{yearNum}</h1>
          <p className="text-secondary" style={{ fontSize: '0.9rem' }}>Reading Year</p>
        </div>
        <button
          onClick={() => navigate('/')}
          style={{
            position: 'absolute',
            right: 0,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
          }}
          title="Home"
        >
          <img src={homeIcon} alt="Home" style={{ width: '24px', height: '24px' }} />
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {/* Pages Read */}
      <div className="card mb-3" style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          Pages Read in {yearNum}
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

      {/* Goal Progress */}
      {stats?.hasGoal && (
        <div className="card mb-3">
          <h2 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Reading Goal
          </h2>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
              {stats.booksRead} / {stats.goalCount}
            </div>
            <div className="text-secondary" style={{ fontSize: '1.1rem', marginTop: '0.5rem' }}>
              {stats.progress}% Complete
            </div>
            <div
              style={{
                width: '100%',
                height: '8px',
                background: 'var(--border)',
                borderRadius: '4px',
                marginTop: '1rem',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${stats.progress}%`,
                  height: '100%',
                  background: 'var(--primary)',
                  transition: 'width 0.3s',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
        <button
          className="btn btn-primary btn-full"
          onClick={() => navigate(`/add?year=${yearNum}`)}
          style={{ fontSize: '1.1rem', padding: '1rem' }}
        >
          ➕ Add Book
        </button>
        <button
          className="btn btn-secondary btn-full"
          onClick={() => navigate(`/library/${yearNum}`)}
          style={{ fontSize: '1.1rem', padding: '1rem' }}
        >
          📖 Library
        </button>
      </div>

      {!stats?.hasGoal && (
        <div className="mt-3">
          <button
            className="btn btn-secondary btn-full"
            onClick={() => navigate(`/goal/${yearNum}/edit`)}
          >
            Set Reading Goal for {yearNum}
          </button>
        </div>
      )}
    </div>
  );
}
