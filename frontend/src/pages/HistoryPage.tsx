import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, AllYearsStats } from '../services/api';

export default function HistoryPage() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [data, setData] = useState<AllYearsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await api.getAllYearsWithStats();
      setData(response);
    } catch (err) {
      setError('Failed to load history');
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
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
        <button
          onClick={() => navigate('/')}
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
        <h1 style={{ fontSize: '1.75rem' }}>Reading History</h1>
      </div>

      {error && <div className="error">{error}</div>}

      {/* All-Time Stats */}
      {data && (
        <>
          <div className="card mb-3" style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              📊 All-Time Stats
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                  {data.allTime.totalBooks}
                </div>
                <div className="text-secondary" style={{ fontSize: '0.9rem' }}>
                  Total Books
                </div>
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                  {data.allTime.totalPages.toLocaleString()}
                </div>
                <div className="text-secondary" style={{ fontSize: '0.9rem' }}>
                  Total Pages
                </div>
              </div>
            </div>
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
                {data.allTime.yearsTracked} {data.allTime.yearsTracked === 1 ? 'year' : 'years'} tracked
                • Avg {data.allTime.avgBooksPerYear} books/year
              </p>
            </div>
          </div>

          {/* Grand Library Button */}
          <div className="mb-3">
            <button
              className="btn btn-primary btn-full"
              onClick={() => navigate('/library/all')}
              style={{ fontSize: '1.1rem', padding: '1rem' }}
            >
              📚 View Grand Library
            </button>
          </div>

          {/* Year Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.years.map((yearData) => (
              <div
                key={yearData.year}
                className="card"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/year/${yearData.year}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {yearData.year}
                      </h3>
                      {yearData.year === currentYear && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            background: 'var(--primary)',
                            color: 'white',
                            borderRadius: '1rem',
                          }}
                        >
                          Current
                        </span>
                      )}
                      {yearData.goalAchieved && yearData.year !== currentYear && (
                        <span style={{ fontSize: '1.25rem', color: '#22c55e' }}>✓</span>
                      )}
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                      {yearData.booksRead} books • {yearData.totalPagesRead.toLocaleString()} pages
                    </div>
                    {yearData.hasGoal && (
                      <div className="text-secondary" style={{ fontSize: '0.9rem' }}>
                        Goal: {yearData.booksRead}/{yearData.goalCount} ({yearData.progress}%)
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>
                    →
                  </div>
                </div>
              </div>
            ))}
          </div>

          {data.years.length === 0 && (
            <div className="card text-center">
              <p className="text-secondary">No reading data yet. Start tracking your books!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
