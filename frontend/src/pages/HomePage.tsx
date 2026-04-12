import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Bell, TrendingUp, Users, Shield, Library, BookOpen, ClipboardList, BookX, HandMetal } from 'lucide-react';
import BookCover from '../components/BookCover';
import RatingDisplay from '../components/RatingDisplay';
import NotificationsModal from '../components/NotificationsModal';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const [stats, setStats] = useState<any>(null);
  const [listCounts, setListCounts] = useState({ currentlyReading: 0, wantToRead: 0, dnf: 0 });
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

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
        if (user?.role !== 'demo') {
          try {
            const { count } = await api.notifications.getUnreadCount();
            setUnreadCount(count);
          } catch (err) {
            // Notifications are optional
          }
        }
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
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: 16, textAlign: 'center', position: 'relative' }}>
        {user?.role !== 'demo' && (
          <button
            onClick={() => setShowNotifications(true)}
            className={unreadCount > 0 ? 'bell-shake' : ''}
            style={{
              position: 'absolute', right: 0, top: 0,
              background: 'none', border: 'none',
              fontSize: 20, cursor: 'pointer',
              padding: '0.25rem', lineHeight: 1,
              transformOrigin: 'top center',
            }}
            aria-label="Notifications"
          >
            <Bell size={20} color="var(--text-secondary)" />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                background: '#ef4444', color: 'white',
                fontSize: 10, fontWeight: 700,
                minWidth: 16, height: 16,
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 4px',
              }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        )}
        <h1 style={{ fontSize: '1.5rem', color: 'var(--text)', margin: 0 }}>
          {user?.role === 'demo' ? <><HandMetal size={18} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />Welcome!</> : `Welcome ${user?.username}!`}
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
        background: 'var(--surface)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        border: '1px solid var(--border)',
        boxShadow: '0 1px 3px var(--shadow)',
      }}>
        {/* Pages Read - hero number */}
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--primary)' }}>
            {(stats?.totalPagesRead || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            pages read across {stats?.booksRead || 0} books
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--border)', margin: '0 -16px', padding: '0 16px' }} />

        {/* Last Book + Goal side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
          {/* Last Book */}
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
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
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 }}>
                    {stats.lastBook.title.length > 20
                      ? stats.lastBook.title.substring(0, 20) + '...'
                      : stats.lastBook.title}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
                    {new Date(stats.lastBook.completedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}
                  </div>
                  {stats.lastBook.rating && (
                    <RatingDisplay rating={stats.lastBook.rating} />
                  )}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>No books yet — start reading!</div>
            )}
          </div>

          {/* Goal */}
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
              {currentYear} Goal
            </div>
            {stats?.hasGoal ? (
              <div
                onClick={() => navigate(`/goal/${currentYear}`)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)' }}>
                  {stats.booksRead}
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 400 }}> / {stats.goalCount}</span>
                </div>
                <div style={{
                  background: 'var(--border)',
                  borderRadius: 99,
                  height: 6,
                  overflow: 'hidden',
                  marginTop: 6,
                }}>
                  <div style={{
                    background: 'var(--primary)',
                    height: '100%',
                    width: `${Math.min(stats.progress, 100)}%`,
                    borderRadius: 99,
                  }} />
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 3 }}>
                  {stats.progress}% complete
                </div>
              </div>
            ) : (
              <div
                onClick={() => navigate('/settings')}
                style={{ fontSize: 12, color: 'var(--primary)', cursor: 'pointer' }}
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
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
        fontWeight: 600,
      }}>
        Your Lists
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        {[
          { icon: Library, name: `${currentYear} Library`, count: stats?.booksRead || 0, path: `/library/${currentYear}` },
          { icon: BookOpen, name: 'Currently Reading', count: listCounts.currentlyReading, path: '/currently-reading' },
          { icon: ClipboardList, name: 'Want to Read', count: listCounts.wantToRead, path: '/want-to-read' },
          { icon: BookX, name: 'DNF', count: listCounts.dnf, path: '/dnf' },
        ].map((list) => (
          <div
            key={list.path}
            onClick={() => navigate(list.path)}
            style={{
              background: 'var(--surface)',
              borderRadius: 10,
              padding: 14,
              border: '1px solid var(--border)',
              cursor: 'pointer',
              boxShadow: '0 1px 3px var(--shadow)',
            }}
          >
            <div style={{ marginBottom: 6 }}><list.icon size={22} color="var(--primary)" /></div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{list.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{list.count} books</div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0 12px' }} />

      {/* Reading History + Friends row */}
      <div style={{ display: 'grid', gridTemplateColumns: user?.role === 'demo' ? '1fr' : '1fr 1fr', gap: 8, marginBottom: 12 }}>
        <div
          onClick={() => navigate('/history')}
          style={{
            background: 'var(--surface)',
            borderRadius: 10,
            padding: 14,
            border: '1px solid var(--border)',
            cursor: 'pointer',
            boxShadow: '0 1px 3px var(--shadow)',
            textAlign: 'center',
          }}
        >
          <TrendingUp size={22} color="var(--primary)" style={{ marginBottom: 6 }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Reading History</div>
        </div>
        {user?.role !== 'demo' && (
          <div
            onClick={() => navigate('/social')}
            style={{
              background: 'var(--surface)',
              borderRadius: 10,
              padding: 14,
              border: '1px solid var(--border)',
              cursor: 'pointer',
              boxShadow: '0 1px 3px var(--shadow)',
              textAlign: 'center',
            }}
          >
            <Users size={22} color="var(--primary)" style={{ marginBottom: 6 }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Friends</div>
          </div>
        )}
      </div>

      {/* Admin Dashboard */}
      {user?.role === 'admin' && (
        <button
          onClick={() => navigate('/admin')}
          className="btn btn-secondary btn-full"
          style={{ marginBottom: 12 }}
        >
          <Shield size={16} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} /> Admin Dashboard
        </button>
      )}

      {showNotifications && (
        <NotificationsModal onClose={() => {
          setShowNotifications(false);
          if (user?.role !== 'demo') {
            api.notifications.getUnreadCount().then(({ count }) => setUnreadCount(count)).catch(() => {});
          }
        }} />
      )}
    </div>
  );
}
