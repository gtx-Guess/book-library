import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api, UserProfile, Book } from '../services/api';
import BookCover from '../components/BookCover';

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [favorites, setFavorites] = useState<Book[]>([]);
  const [favSource, setFavSource] = useState<'auto' | 'manual'>('auto');
  const [completedBooks, setCompletedBooks] = useState<{ bookId: string; book: Book; rating: number | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [profileData, favData, allBooks] = await Promise.all([
          api.profile.getMe(),
          api.profile.getFavorites(),
          api.getAllCompletedBooks(1, 100),
        ]);
        setProfile(profileData);
        setDisplayName(profileData.displayName || '');
        setBio(profileData.bio || '');
        setFavorites(favData.books);
        setFavSource(favData.source);
        setCompletedBooks(allBooks.books.map((b) => ({ bookId: b.bookId, book: b.book, rating: b.rating ?? null })));
      } catch (err) {
        console.error('Failed to load profile data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.profile.updateMe({
        displayName: displayName || undefined,
        bio: bio || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const isFavorite = (bookId: string) => favorites.some((f) => f.id === bookId);

  const toggleFavorite = async (book: Book) => {
    let newFavorites: Book[];
    if (isFavorite(book.id)) {
      newFavorites = favorites.filter((f) => f.id !== book.id);
    } else {
      if (favorites.length >= 10) return;
      newFavorites = [...favorites, book];
    }
    setFavorites(newFavorites);
    setFavSource('manual');

    if (newFavorites.length === 0) {
      await api.profile.clearFavorites();
      const favData = await api.profile.getFavorites();
      setFavorites(favData.books);
      setFavSource(favData.source);
    } else {
      await api.profile.setFavorites(newFavorites.map((f) => f.id));
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="container">
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={() => navigate('/settings')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.25rem', lineHeight: 1 }}
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: 0 }}>Edit Profile</h1>
      </header>

      <div className="card mb-3" style={{ textAlign: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'var(--primary)', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 22, margin: '0 auto 12px',
        }}>
          {(displayName || profile?.username || '??').slice(0, 2).toUpperCase()}
        </div>
        <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{displayName || profile?.username}</div>
        {bio && <p className="text-secondary" style={{ fontSize: '0.85rem', marginTop: 4 }}>{bio}</p>}
        <div className="text-secondary" style={{ fontSize: '0.75rem', marginTop: 4 }}>Preview of how friends see you</div>
      </div>

      <div className="card mb-3">
        <label style={{ display: 'block', marginBottom: '1rem' }}>
          <span style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Display Name</span>
          <input className="input" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={profile?.username} />
        </label>
        <label style={{ display: 'block', marginBottom: '1rem' }}>
          <span style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Bio</span>
          <textarea className="input" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A short tagline about you..." rows={2} style={{ resize: 'vertical' }} />
        </label>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Profile'}
        </button>
      </div>

      <div className="card mb-3">
        <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
          Favorite Books
        </h2>
        <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
          {favSource === 'auto'
            ? 'Showing your top-rated books. Tap to customize.'
            : `${favorites.length}/10 selected. Tap to toggle.`}
        </p>
        {favorites.length > 0 && (
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: '1rem' }}>
            {favorites.map((book) => (
              <div key={book.id} onClick={() => toggleFavorite(book)} style={{ cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
                <BookCover src={book.coverImage} title={book.title} width={60} height={90} />
                <div style={{
                  position: 'absolute', top: -4, right: -4,
                  background: 'var(--danger)', color: 'white',
                  width: 18, height: 18, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700,
                }}>
                  x
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, fontWeight: 600 }}>
          Your Completed Books
        </div>
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          {completedBooks.map((item) => (
            <div
              key={item.bookId}
              onClick={() => toggleFavorite(item.book)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0',
                cursor: 'pointer', opacity: isFavorite(item.book.id) ? 0.5 : 1,
                borderBottom: '1px solid var(--border)',
              }}
            >
              <BookCover src={item.book.coverImage} title={item.book.title} width={32} height={48} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{item.book.title}</div>
                <div className="text-secondary" style={{ fontSize: '0.75rem' }}>{item.book.authors?.join(', ')}</div>
              </div>
              {isFavorite(item.book.id) && <span style={{ color: 'var(--primary)', fontSize: 14 }}>✓</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
