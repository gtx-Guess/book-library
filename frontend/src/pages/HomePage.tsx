import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import BookCover from '../components/BookCover';
import RatingDisplay from '../components/RatingDisplay';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const [stats, setStats] = useState<any>(null);
  const [listCounts, setListCounts] = useState({ currentlyReading: 0, wantToRead: 0, dnf: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, crBooks, wtrBooks, dnfBooks] = await Promise.all([
          api.getStats(currentYear),
          api.getAllCurrentlyReadingBooks(),
          api.getAllWantToReadBooks(),
          api.getAllDNFBooks(),
        ]);
        setStats(statsData);
        setListCounts({
          currentlyReading: crBooks.length,
          wantToRead: wtrBooks.length,
          dnf: dnfBooks.length,
        });
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentYear]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 1rem', color: '#94a3b8' }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: '1.5rem', color: '#f1f5f9', margin: 0 }}>
          {user?.role === 'demo' ? 'Welcome! 👋' : `Welcome ${user?.username}!`}
        </h1>
        {user?.role === 'demo' && (
          <span style={{
            display: 'inline-block',
            background: '#854d0e',
            color: '#fef08a',
            fontSize: 11,
            padding: '2px 8px',
            borderRadius: 4,
            marginTop: 4,
          }}>
            Demo Mode
          </span>
        )}
      </div>

      {/* Consolidated Stats Card */}
      <div style={{
        background: '#1a1a2e',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        border: '1px solid #2a2a4a',
      }}>
        {/* Pages Read - hero number */}
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#2563eb' }}>
            {(stats?.totalPagesRead || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>
            pages read across {stats?.booksRead || 0} books
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid #2a2a4a', margin: '0 -16px', padding: '0 16px' }} />

        {/* Last Book + Goal side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
          {/* Last Book */}
          <div>
            <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
              Last Finished
            </div>
            {stats?.lastBook ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookCover
                  src={stats.lastBook.coverImage}
                  title={stats.lastBook.title}
                  width={32}
                  height={46}
                />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9', lineHeight: 1.2 }}>
                    {stats.lastBook.title.length > 20
                      ? stats.lastBook.title.substring(0, 20) + '...'
                      : stats.lastBook.title}
                  </div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>
                    {new Date(stats.lastBook.completedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}
                  </div>
                  {stats.lastBook.rating && (
                    <RatingDisplay rating={stats.lastBook.rating} />
                  )}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 12, color: '#64748b' }}>No books yet — start reading!</div>
            )}
          </div>

          {/* Goal */}
          <div>
            <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
              {currentYear} Goal
            </div>
            {stats?.hasGoal ? (
              <div
                onClick={() => navigate(`/goal/${currentYear}`)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ fontSize: 22, fontWeight: 700, color: '#2563eb' }}>
                  {stats.booksRead}
                  <span style={{ fontSize: 14, color: '#64748b', fontWeight: 400 }}> / {stats.goalCount}</span>
                </div>
                <div style={{
                  background: '#1e293b',
                  borderRadius: 99,
                  height: 6,
                  overflow: 'hidden',
                  marginTop: 6,
                }}>
                  <div style={{
                    background: '#2563eb',
                    height: '100%',
                    width: `${Math.min(stats.progress, 100)}%`,
                    borderRadius: 99,
                  }} />
                </div>
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>
                  {stats.progress}% complete
                </div>
              </div>
            ) : (
              <div
                onClick={() => navigate('/settings')}
                style={{ fontSize: 12, color: '#2563eb', cursor: 'pointer' }}
              >
                Set a reading goal →
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Your Lists */}
      <div style={{
        fontSize: 11,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
        fontWeight: 600,
      }}>
        Your Lists
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        {[
          { emoji: '📚', name: 'Library', count: stats?.booksRead || 0, path: `/library/${currentYear}` },
          { emoji: '📖', name: 'Currently Reading', count: listCounts.currentlyReading, path: '/currently-reading' },
          { emoji: '📋', name: 'Want to Read', count: listCounts.wantToRead, path: '/want-to-read' },
          { emoji: '📕', name: 'DNF', count: listCounts.dnf, path: '/dnf' },
        ].map((list) => (
          <div
            key={list.path}
            onClick={() => navigate(list.path)}
            style={{
              background: '#1a1a2e',
              borderRadius: 10,
              padding: 14,
              border: '1px solid #2a2a4a',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 6 }}>{list.emoji}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{list.name}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{list.count} books</div>
          </div>
        ))}
      </div>

      {/* Reading History */}
      <div
        onClick={() => navigate('/history')}
        style={{
          background: '#1a1a2e',
          borderRadius: 10,
          padding: '12px 14px',
          border: '1px solid #2a2a4a',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          marginBottom: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>📈</span>
          <span style={{ fontSize: 13, color: '#f1f5f9' }}>Reading History</span>
        </div>
        <span style={{ color: '#64748b', fontSize: 12 }}>→</span>
      </div>

      {/* Admin Dashboard */}
      {user?.role === 'admin' && (
        <button
          onClick={() => navigate('/admin')}
          className="btn btn-secondary btn-full"
          style={{ marginBottom: 12 }}
        >
          🛡️ Admin Dashboard
        </button>
      )}
    </div>
  );
}
