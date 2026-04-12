import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, BookOpen } from 'lucide-react';
import { api, YearlyStats } from '../services/api';

export default function GoalDetailsPage() {
  const navigate = useNavigate();
  const { year } = useParams<{ year: string }>();
  const currentYear = parseInt(year || new Date().getFullYear().toString());
  const [stats, setStats] = useState<YearlyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, [currentYear]);

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
          onClick={() => {
            const todayYear = new Date().getFullYear();
            if (currentYear === todayYear) {
              navigate('/');
            } else {
              navigate(`/year/${currentYear}`);
            }
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            marginRight: '0.5rem',
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Goal Details</h1>
          <p className="text-secondary">{currentYear}</p>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {!stats?.hasGoal ? (
        <div className="card text-center">
          <h2 style={{ marginBottom: '1rem' }}>Set Your Reading Goal</h2>
          <p className="text-secondary mb-3">
            How many books do you want to read this year?
          </p>
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/goal/${currentYear}/edit`)}
          >
            Set Goal
          </button>
        </div>
      ) : (
        <>
          <div className="card mb-3">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                {stats.booksRead} / {stats.goalCount}
              </div>
              <div className="text-secondary" style={{ fontSize: '1.25rem', marginTop: '0.5rem' }}>
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

          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
            <button
              className="btn btn-primary btn-full"
              onClick={() => navigate(`/add?year=${currentYear}`)}
              style={{ fontSize: '1.1rem', padding: '1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <Plus size={18} /> Add Book
            </button>
            <button
              className="btn btn-secondary btn-full"
              onClick={() => navigate(`/library/${currentYear}`)}
              style={{ fontSize: '1.1rem', padding: '1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <BookOpen size={18} /> Library
            </button>
          </div>

          <div className="mt-3">
            <button
              className="btn btn-secondary btn-full"
              onClick={() => navigate(`/goal/${currentYear}/edit`)}
            >
              Edit Goal
            </button>
          </div>
        </>
      )}
    </div>
  );
}
