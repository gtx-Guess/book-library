import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, FriendProfile, FriendStats, FavoritesResponse } from '../services/api';
import BookCover from '../components/BookCover';
import RatingDisplay from '../components/RatingDisplay';

export default function FriendProfilePage() {
  const navigate = useNavigate();
  const { friendId } = useParams<{ friendId: string }>();
  const [profile, setProfile] = useState<FriendProfile | null>(null);
  const [stats, setStats] = useState<FriendStats | null>(null);
  const [favorites, setFavorites] = useState<FavoritesResponse | null>(null);
  const [listCounts, setListCounts] = useState<{ completed: number; currentlyReading: number; dnf: number; wantToRead: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!friendId) return;

    async function loadProfile() {
      try {
        const [profileData, statsData] = await Promise.all([
          api.profile.getFriend(friendId!),
          api.friends.getStats(friendId!),
        ]);
        setProfile(profileData);
        setStats(statsData);

        if (profileData.shareLibrary) {
          const [favData, completedData, crData, dnfData, wtrData] = await Promise.all([
            api.friends.getFavorites(friendId!),
            api.friends.getCompleted(friendId!, 1, 1),
            api.friends.getCurrentlyReading(friendId!),
            api.friends.getDNF(friendId!),
            api.friends.getWantToRead(friendId!),
          ]);
          setFavorites(favData);
          setListCounts({
            completed: completedData.pagination.totalCount,
            currentlyReading: crData.length,
            dnf: dnfData.length,
            wantToRead: wtrData.length,
          });
        }
      } catch (err) {
        console.error('Failed to load friend profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [friendId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
        Loading...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container">
        <p className="text-secondary">Could not load profile.</p>
      </div>
    );
  }

  const displayName = profile.displayName || profile.username;
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="container">
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => navigate('/social')}
          style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.25rem', lineHeight: 1 }}
          aria-label="Back"
        >
          ←
        </button>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: 0 }}>{displayName}</h1>
      </header>

      <div className="card mb-3" style={{ textAlign: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'var(--primary)', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 22, margin: '0 auto 12px',
        }}>
          {initials}
        </div>
        <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text)' }}>{displayName}</div>
        <div className="text-secondary" style={{ fontSize: '0.85rem' }}>@{profile.username}</div>
        {profile.bio && (
          <p style={{ fontSize: '0.9rem', color: 'var(--text)', marginTop: 8 }}>{profile.bio}</p>
        )}
      </div>

      {stats && (
        <div className="card mb-3">
          <div style={{ display: 'grid', gridTemplateColumns: stats.shareLibrary ? '1fr 1fr' : '1fr', gap: 12 }}>
            {stats.goal && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                  {new Date().getFullYear()} Goal
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>
                  {stats.goal.booksRead}
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 400 }}> / {stats.goal.goalCount}</span>
                </div>
                <div style={{ background: 'var(--border)', borderRadius: 99, height: 5, overflow: 'hidden', marginTop: 4 }}>
                  <div style={{ background: 'var(--primary)', height: '100%', width: `${Math.min(stats.goal.progress, 100)}%`, borderRadius: 99 }} />
                </div>
              </div>
            )}

            {stats.lastBook && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                  Last Finished
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {stats.lastBook.coverImage && (
                    <BookCover src={stats.lastBook.coverImage} title={stats.lastBook.title} width={28} height={40} />
                  )}
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>
                      {stats.lastBook.title.length > 18 ? stats.lastBook.title.substring(0, 18) + '...' : stats.lastBook.title}
                    </div>
                    {stats.lastBook.rating && <RatingDisplay rating={stats.lastBook.rating} />}
                  </div>
                </div>
              </div>
            )}
          </div>

          {stats.shareLibrary && stats.booksThisYear !== undefined && (
            <div style={{ borderTop: '1px solid var(--border)', marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-around' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{stats.booksThisYear}</div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>This Year</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{stats.totalBooks}</div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>All Time</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{(stats.pagesThisYear || 0).toLocaleString()}</div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Pages</div>
              </div>
            </div>
          )}
        </div>
      )}

      {profile.shareLibrary && favorites && favorites.books.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, fontWeight: 600 }}>
            Favorite Books
          </div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
            {favorites.books.map((book) => (
              <BookCover key={book.id} src={book.coverImage} title={book.title} width={70} height={105} />
            ))}
          </div>
        </div>
      )}

      {profile.shareLibrary && listCounts && (
        <>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, fontWeight: 600 }}>
            Library
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            {[
              { emoji: '📚', name: 'Completed', count: listCounts.completed, path: `/friends/${friendId}/completed` },
              { emoji: '📖', name: 'Reading', count: listCounts.currentlyReading, path: `/friends/${friendId}/currently-reading` },
              { emoji: '📋', name: 'Want to Read', count: listCounts.wantToRead, path: `/friends/${friendId}/want-to-read` },
              { emoji: '📕', name: 'DNF', count: listCounts.dnf, path: `/friends/${friendId}/dnf` },
            ].map((list) => (
              <div
                key={list.path}
                onClick={() => navigate(list.path)}
                style={{
                  background: 'var(--surface)', borderRadius: 10, padding: 14,
                  border: '1px solid var(--border)', cursor: 'pointer',
                  boxShadow: '0 1px 3px var(--shadow)',
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 6 }}>{list.emoji}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{list.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{list.count} books</div>
              </div>
            ))}
          </div>
        </>
      )}

      {!profile.shareLibrary && (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '0.9rem' }}>This user has chosen not to share their library.</p>
        </div>
      )}
    </div>
  );
}
