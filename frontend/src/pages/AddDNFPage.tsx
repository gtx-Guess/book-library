import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, GoogleBookResult } from '../services/api';
import ConfirmDNFModal from '../components/ConfirmDNFModal';
import ManualBookModal, { ManualBookData } from '../components/ManualBookModal';
import BookCover from '../components/BookCover';
import homeIcon from '../assets/home.png';

const STORAGE_KEY = 'addDNFPage_searchState';

export default function AddDNFPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GoogleBookResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingBookId, setLoadingBookId] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<GoogleBookResult | null>(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualBook, setManualBook] = useState<ManualBookData | null>(null);

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

  const handleSelectBook = (book: GoogleBookResult) => {
    setSelectedBook(book);
  };

  const handleConfirmAdd = async (own: boolean | undefined, willPurchase: string | undefined) => {
    if (!selectedBook) return;

    try {
      const book = selectedBook;
      const coverImage =
        book.volumeInfo.imageLinks?.thumbnail ||
        book.volumeInfo.imageLinks?.smallThumbnail;

      await api.addDNFBook({
        googleBooksId: book.id,
        title: book.volumeInfo.title,
        authors: book.volumeInfo.authors || [],
        description: book.volumeInfo.description,
        coverImage,
        pageCount: book.volumeInfo.pageCount,
        publisher: book.volumeInfo.publisher,
        publishedDate: book.volumeInfo.publishedDate,
        categories: book.volumeInfo.categories || [],
        own,
        willPurchase,
      });

      localStorage.removeItem(STORAGE_KEY);
      navigate('/dnf');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to add DNF book';
      setError(errorMessage);
      console.error(err);
      setSelectedBook(null);
    }
  };

  const handleCancelModal = () => {
    setSelectedBook(null);
  };

  const handleManualBookSubmit = (book: ManualBookData) => {
    setShowManualModal(false);
    setManualBook(book);
  };

  const handleConfirmManualDNF = async (own: boolean | undefined, willPurchase: string | undefined) => {
    if (!manualBook) return;

    try {
      await api.addDNFBook({
        title: manualBook.title,
        authors: manualBook.authors,
        pageCount: manualBook.pageCount,
        publishedDate: manualBook.publishedDate,
        publisher: manualBook.publisher,
        categories: [],
        own,
        willPurchase,
      });

      localStorage.removeItem(STORAGE_KEY);
      navigate('/dnf');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to add DNF book';
      setError(errorMessage);
      setManualBook(null);
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', position: 'relative' }}>
        <button
          onClick={() => navigate('/dnf')}
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
        <h1 style={{ fontSize: '1.5rem' }}>Add DNF Book</h1>
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <span className="text-secondary" style={{ fontSize: '0.85rem' }}>
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
          </span>
          <button
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}
            onClick={() => setShowManualModal(true)}
          >
            + Add Manually
          </button>
        </div>
      )}

      {searchResults.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {searchResults.map((book) => (
            <div key={book.id} className="card">
              <div style={{ display: 'flex', gap: '1rem' }}>
                <BookCover
                  src={book.volumeInfo.imageLinks?.thumbnail || book.volumeInfo.imageLinks?.smallThumbnail}
                  title={book.volumeInfo.title}
                  width={80}
                  height={120}
                />
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
                    onClick={() => handleSelectBook(book)}
                    disabled={loadingBookId === book.id}
                  >
                    {loadingBookId === book.id ? 'Loading...' : '➕ Add to DNF'}
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

      {searchResults.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #2a2a4a' }}>
          <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
            Can't find your book?
          </p>
          <button className="btn btn-secondary" onClick={() => setShowManualModal(true)}>
            + Add Manually
          </button>
        </div>
      )}

      {selectedBook && (
        <ConfirmDNFModal
          book={{
            title: selectedBook.volumeInfo.title,
            authors: selectedBook.volumeInfo.authors || [],
            coverImage:
              selectedBook.volumeInfo.imageLinks?.thumbnail ||
              selectedBook.volumeInfo.imageLinks?.smallThumbnail,
            pageCount: selectedBook.volumeInfo.pageCount,
          }}
          onConfirm={handleConfirmAdd}
          onCancel={handleCancelModal}
        />
      )}

      {showManualModal && (
        <ManualBookModal
          onSubmit={handleManualBookSubmit}
          onCancel={() => setShowManualModal(false)}
        />
      )}

      {manualBook && (
        <ConfirmDNFModal
          book={{ title: manualBook.title, authors: manualBook.authors, pageCount: manualBook.pageCount }}
          onConfirm={handleConfirmManualDNF}
          onCancel={() => setManualBook(null)}
        />
      )}
    </div>
  );
}
