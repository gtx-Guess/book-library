import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, FriendProfile } from '../services/api';
import BookCover from '../components/BookCover';
import RatingDisplay from '../components/RatingDisplay';

type ListType = 'completed' | 'currently-reading' | 'dnf' | 'want-to-read';

const LIST_TITLES: Record<ListType, string> = {
  'completed': 'Completed',
  'currently-reading': 'Currently Reading',
  'dnf': 'Did Not Finish',
  'want-to-read': 'Want to Read',
};

export default function FriendLibraryPage() {
  const navigate = useNavigate();
  const { friendId, listType } = useParams<{ friendId: string; listType: string }>();
  const [books, setBooks] = useState<any[]>([]);
  const [friendProfile, setFriendProfile] = useState<FriendProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!friendId || !listType) return;

    async function loadData() {
      try {
        const profileData = await api.profile.getFriend(friendId!);
        setFriendProfile(profileData);

        switch (listType as ListType) {
          case 'completed': {
            const data = await api.friends.getCompleted(friendId!, page);
            setBooks(data.books);
            setTotalPages(data.pagination.totalPages);
            break;
          }
          case 'currently-reading': {
            const data = await api.friends.getCurrentlyReading(friendId!);
            setBooks(data);
            break;
          }
          case 'dnf': {
            const data = await api.friends.getDNF(friendId!);
            setBooks(data);
            break;
          }
          case 'want-to-read': {
            const data = await api.friends.getWantToRead(friendId!);
            setBooks(data);
            break;
          }
        }
      } catch (err) {
        console.error('Failed to load friend library:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [friendId, listType, page]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
        Loading...
      </div>
    );
  }

  const title = LIST_TITLES[listType as ListType] || 'Books';
  const friendName = friendProfile?.displayName || friendProfile?.username || 'Friend';

  return (
    <div className="container">
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => navigate(`/friends/${friendId}`)}
          style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.25rem', lineHeight: 1 }}
          aria-label="Back"
        >
          ←
        </button>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{title}</h1>
          <div className="text-secondary" style={{ fontSize: '0.8rem' }}>{friendName}'s library</div>
        </div>
      </header>

      {books.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
          <p>No books in this list yet.</p>
        </div>
      ) : (
        books.map((item: any) => {
          const book = item.book;
          const authors = book.authors?.join(', ') || 'Unknown Author';

          return (
            <div key={item.id} className="card" style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <BookCover src={book.coverImage} title={book.title} width={60} height={90} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem', fontWeight: 600, color: 'var(--text)' }}>{book.title}</h3>
                  <p className="text-secondary" style={{ fontSize: '0.85rem', margin: 0 }}>{authors}</p>
                  {listType === 'completed' && item.rating && (
                    <div style={{ marginTop: 4 }}>
                      <RatingDisplay rating={item.rating} />
                    </div>
                  )}
                  {listType === 'completed' && item.completedDate && (
                    <div className="text-secondary" style={{ fontSize: '0.8rem', marginTop: 2 }}>
                      Finished {new Date(item.completedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
                    </div>
                  )}
                  {listType === 'currently-reading' && item.currentPage && book.pageCount && (
                    <div className="text-secondary" style={{ fontSize: '0.8rem', marginTop: 2 }}>
                      Page {item.currentPage} of {book.pageCount}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}

      {listType === 'completed' && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem', marginBottom: '1rem' }}>
          <button className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span className="text-secondary" style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem' }}>
            {page} / {totalPages}
          </span>
          <button className="btn btn-secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
