import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api, GoogleBookResult } from '../services/api';
import { getBookFromOpenLibrary } from '../services/openLibrary';
import ConfirmBookModal from '../components/ConfirmBookModal';
import homeIcon from '../assets/home.png';

const STORAGE_KEY = 'addBookPage_searchState';

export default function AddBookPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetYear = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GoogleBookResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingBookId, setLoadingBookId] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<{
    googleBook: GoogleBookResult;
    pageCount?: number;
  } | null>(null);

  // Restore search state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const { query, results } = JSON.parse(savedState);
        setSearchQuery(query);
        setSearchResults(results);
      } catch (err) {
        console.error('Failed to restore search state:', err);
      }
    }
  }, []);

  // Save search state to localStorage whenever it changes
  useEffect(() => {
    if (searchQuery || searchResults.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        query: searchQuery,
        results: searchResults,
      }));
    }
  }, [searchQuery, searchResults]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError('');
      const results = await api.searchBooks(searchQuery);
      setSearchResults(results);
    } catch (err) {
      setError('Failed to search books');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsFinished = async (book: GoogleBookResult) => {
    try {
      setLoadingBookId(book.id);
      setError('');

      let pageCount = book.volumeInfo.pageCount;

      // If Google doesn't have page count, try Open Library
      if (!pageCount) {
        // Extract ISBN from industryIdentifiers if available
        const isbn =
          book.volumeInfo.industryIdentifiers?.find(
            (id) => id.type === 'ISBN_13' || id.type === 'ISBN_10'
          )?.identifier;

        const openLibraryData = await getBookFromOpenLibrary(
          isbn,
          book.volumeInfo.title,
          book.volumeInfo.authors?.[0]
        );

        if (openLibraryData?.pageCount) {
          pageCount = openLibraryData.pageCount;
        }
      }

      // Show modal with final pageCount (or undefined)
      setSelectedBook({
        googleBook: book,
        pageCount,
      });
    } catch (err) {
      setError('Failed to fetch book details');
      console.error(err);
    } finally {
      setLoadingBookId(null);
    }
  };

  const handleConfirmAdd = async (pageCount: number | undefined, completedDate: string, rating: number | undefined, own: boolean | undefined, willPurchase: string | undefined, link: string | undefined) => {
    if (!selectedBook) return;

    try {
      const book = selectedBook.googleBook;
      const coverImage =
        book.volumeInfo.imageLinks?.thumbnail ||
        book.volumeInfo.imageLinks?.smallThumbnail;

      // Convert date string to ISO format with time
      const completedDateTime = new Date(completedDate + 'T12:00:00').toISOString();

      await api.addCompletedBook({
        googleBooksId: book.id,
        title: book.volumeInfo.title,
        authors: book.volumeInfo.authors || [],
        description: book.volumeInfo.description,
        coverImage,
        pageCount,
        rating,
        own,
        willPurchase,
        link,
        publisher: book.volumeInfo.publisher,
        publishedDate: book.volumeInfo.publishedDate,
        categories: book.volumeInfo.categories || [],
        completedDate: completedDateTime,
      });

      // Clear search state after successful add
      localStorage.removeItem(STORAGE_KEY);

      // Navigate based on target year
      const currentYear = new Date().getFullYear();
      if (targetYear === currentYear) {
        navigate('/');
      } else {
        navigate(`/year/${targetYear}`);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to add book';
      setError(errorMessage);
      console.error(err);
      setSelectedBook(null);
    }
  };

  const handleCancelModal = () => {
    setSelectedBook(null);
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', position: 'relative' }}>
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
        <h1 style={{ fontSize: '1.5rem' }}>Add Book</h1>
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

      <form onSubmit={handleSearch} className="mb-3">
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="input"
            placeholder="Search by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '...' : '🔍'}
          </button>
        </div>
      </form>

      {searchResults.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {searchResults.map((book) => (
            <div key={book.id} className="card">
              <div style={{ display: 'flex', gap: '1rem' }}>
                {(book.volumeInfo.imageLinks?.thumbnail ||
                  book.volumeInfo.imageLinks?.smallThumbnail) && (
                  <img
                    src={
                      book.volumeInfo.imageLinks.thumbnail ||
                      book.volumeInfo.imageLinks.smallThumbnail
                    }
                    alt={book.volumeInfo.title}
                    style={{
                      width: '80px',
                      height: '120px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                    }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    {book.volumeInfo.title}
                  </h3>
                  {book.volumeInfo.authors && (
                    <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      {book.volumeInfo.authors.join(', ')}
                    </p>
                  )}
                <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
                    {book.volumeInfo.pageCount || 0} pages
                </p>
                  <button
                    className="btn btn-primary mt-2"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                    onClick={() => handleMarkAsFinished(book)}
                    disabled={loadingBookId === book.id}
                  >
                    {loadingBookId === book.id ? 'Loading...' : '✓ Mark as Finished'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && searchQuery && searchResults.length === 0 && (
        <div className="text-center text-secondary mt-4">
          No results found. Try a different search.
        </div>
      )}

      {selectedBook && (
        <ConfirmBookModal
          book={{
            title: selectedBook.googleBook.volumeInfo.title,
            authors: selectedBook.googleBook.volumeInfo.authors || [],
            coverImage:
              selectedBook.googleBook.volumeInfo.imageLinks?.thumbnail ||
              selectedBook.googleBook.volumeInfo.imageLinks?.smallThumbnail,
            pageCount: selectedBook.pageCount,
            isbn: selectedBook.googleBook.volumeInfo.industryIdentifiers?.find(
              (id) => id.type === 'ISBN_13' || id.type === 'ISBN_10'
            )?.identifier,
          }}
          defaultDate={
            targetYear === new Date().getFullYear()
              ? new Date().toISOString().split('T')[0]
              : `${targetYear}-12-31`
          }
          onConfirm={handleConfirmAdd}
          onCancel={handleCancelModal}
        />
      )}
    </div>
  );
}
