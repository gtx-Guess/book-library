import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardList, Plus, Search, CheckCircle, ChevronDown } from 'lucide-react';
import { api, WantToReadBook } from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import BookCover from '../components/BookCover';
import ConfirmBookModal from '../components/ConfirmBookModal';

export default function WantToReadPage() {
  const navigate = useNavigate();
  const [books, setBooks] = useState<WantToReadBook[]>([]);
  const [allBooks, setAllBooks] = useState<WantToReadBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookToDelete, setBookToDelete] = useState<WantToReadBook | null>(null);
  const [bookToAddToLibrary, setBookToAddToLibrary] = useState<WantToReadBook | null>(null);
  const [filterAuthor, setFilterAuthor] = useState('');
  const [filterPublisher, setFilterPublisher] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await api.getAllWantToReadBooks();
      setAllBooks(data);
      setBooks(data);
    } catch (err) {
      setError('Failed to load want to read books');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (book: WantToReadBook) => {
    setBookToDelete(book);
  };

  const handleConfirmDelete = async () => {
    if (!bookToDelete) return;

    try {
      await api.deleteWantToReadBook(bookToDelete.id);
      setBooks(books.filter((b) => b.id !== bookToDelete.id));
      setAllBooks(allBooks.filter((b) => b.id !== bookToDelete.id));
      setBookToDelete(null);
    } catch (err) {
      setError('Failed to delete book');
      console.error(err);
      setBookToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setBookToDelete(null);
  };

  const handleAddToLibraryClick = (book: WantToReadBook) => {
    setBookToAddToLibrary(book);
  };

  const handleConfirmAddToLibrary = async (
    pageCount: number | undefined,
    completedDate: string,
    rating: number | undefined,
    own: boolean | undefined,
    willPurchase: string | undefined,
    link: string | undefined
  ) => {
    if (!bookToAddToLibrary) return;

    try {
      const book = bookToAddToLibrary.book;
      const completedDateTime = new Date(completedDate + 'T12:00:00').toISOString();

      await api.addCompletedBook({
        googleBooksId: book.googleBooksId,
        title: book.title,
        authors: book.authors || [],
        description: book.description,
        coverImage: book.coverImage,
        pageCount,
        rating,
        own,
        willPurchase,
        link,
        publisher: book.publisher,
        publishedDate: book.publishedDate,
        categories: book.categories || [],
        completedDate: completedDateTime,
      });

      // Backend automatically removes from want to read list
      // Update UI state to reflect the removal
      setBooks(books.filter((b) => b.id !== bookToAddToLibrary.id));
      setAllBooks(allBooks.filter((b) => b.id !== bookToAddToLibrary.id));
      setBookToAddToLibrary(null);

      // Navigate to home page
      navigate('/');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to add book to library';
      setError(errorMessage);
      console.error(err);
      setBookToAddToLibrary(null);
    }
  };

  const handleCancelAddToLibrary = () => {
    setBookToAddToLibrary(null);
  };

  // Get unique authors and publishers for filter dropdowns
  const uniqueAuthors = Array.from(
    new Set(allBooks.flatMap(b => b.book.authors))
  ).sort();

  const uniquePublishers = Array.from(
    new Set(allBooks.map(b => b.book.publisher).filter(p => p))
  ).sort();

  // Filter books based on selected filters
  const filteredBooks = allBooks.filter(book => {
    if (filterAuthor && !book.book.authors.includes(filterAuthor)) {
      return false;
    }

    if (filterPublisher && book.book.publisher !== filterPublisher) {
      return false;
    }

    return true;
  });

  const clearFilters = () => {
    setFilterAuthor('');
    setFilterPublisher('');
  };

  const hasActiveFilters = filterAuthor || filterPublisher;

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
            cursor: 'pointer',
            padding: '0.5rem',
            marginRight: '0.5rem',
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.5rem' }}>
            <ClipboardList size={22} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} />Want to Read
          </h1>
          <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {allBooks.length} {allBooks.length === 1 ? 'book' : 'books'}
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/add-want-to-read')}
          style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          <Plus size={14} /> Add Book
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {/* Filter Section */}
      {allBooks.length > 0 && (
        <div className="card mb-3" style={{ padding: '1rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={() => setShowFilters(!showFilters)}
          >
            <h2 style={{ fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Search size={14} /> Filters
              {hasActiveFilters && (
                <span
                  style={{
                    marginLeft: '0.5rem',
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.5rem',
                    background: 'var(--primary)',
                    color: 'white',
                    borderRadius: '1rem',
                  }}
                >
                  Active
                </span>
              )}
            </h2>
            <span>
              {showFilters ? <ChevronDown size={16} /> : <Plus size={16} />}
            </span>
          </div>

          {showFilters && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <label style={{ display: 'block' }}>
                  <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                    Author
                  </span>
                  <select
                    className="input"
                    value={filterAuthor}
                    onChange={(e) => setFilterAuthor(e.target.value)}
                  >
                    <option value="">All Authors</option>
                    {uniqueAuthors.map(author => (
                      <option key={author} value={author}>{author}</option>
                    ))}
                  </select>
                </label>

                <label style={{ display: 'block' }}>
                  <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                    Publisher
                  </span>
                  <select
                    className="input"
                    value={filterPublisher}
                    onChange={(e) => setFilterPublisher(e.target.value)}
                  >
                    <option value="">All Publishers</option>
                    {uniquePublishers.map(publisher => (
                      <option key={publisher} value={publisher}>{publisher}</option>
                    ))}
                  </select>
                </label>
              </div>

              {hasActiveFilters && (
                <button
                  className="btn btn-secondary btn-full"
                  onClick={clearFilters}
                  style={{ fontSize: '0.9rem' }}
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {filteredBooks.length === 0 && allBooks.length > 0 ? (
        <div className="card text-center">
          <p className="text-secondary">No books match the selected filters.</p>
          <button
            className="btn btn-primary mt-3"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>
      ) : allBooks.length === 0 ? (
        <div className="card text-center">
          <p className="text-secondary">No books in your want to read list yet.</p>
          <button
            className="btn btn-primary mt-3"
            onClick={() => navigate('/add-want-to-read')}
          >
            Add Your First Book
          </button>
        </div>
      ) : (
        <>
          {/* Results count */}
          {hasActiveFilters && (
            <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Showing {filteredBooks.length} of {allBooks.length} books
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredBooks.map((wantToReadBook) => (
              <div key={wantToReadBook.id} className="card">
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <BookCover src={wantToReadBook.book.coverImage} title={wantToReadBook.book.title} width={80} height={120} />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                      {wantToReadBook.book.title}
                    </h3>
                    {wantToReadBook.book.authors.length > 0 && (
                      <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        {wantToReadBook.book.authors.join(', ')}
                      </p>
                    )}
                    {wantToReadBook.book.pageCount && (
                      <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
                        {wantToReadBook.book.pageCount} pages
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                      <button
                        className="btn btn-primary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        onClick={() => handleAddToLibraryClick(wantToReadBook)}
                      >
                        <CheckCircle size={14} /> Add to Library
                      </button>
                      {/* Remove button — hidden for seeded demo books */}
                      {!wantToReadBook.isSeeded && (
                        <button
                          className="btn"
                          style={{
                            padding: '0.5rem 1rem',
                            fontSize: '0.9rem',
                            background: '#dc2626',
                            color: 'white',
                            border: 'none'
                          }}
                          onClick={() => handleDeleteClick(wantToReadBook)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Confirm Delete Dialog */}
      {bookToDelete && (
        <ConfirmDialog
          title="Remove Book"
          message={`Are you sure you want to remove "${bookToDelete.book.title}" from your want to read list? This action cannot be undone.`}
          confirmText="Remove"
          cancelText="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          danger={true}
        />
      )}

      {/* Add to Library Modal */}
      {bookToAddToLibrary && (
        <ConfirmBookModal
          book={{
            title: bookToAddToLibrary.book.title,
            authors: bookToAddToLibrary.book.authors || [],
            coverImage: bookToAddToLibrary.book.coverImage,
            pageCount: bookToAddToLibrary.book.pageCount,
          }}
          defaultDate={new Date().toISOString().split('T')[0]}
          onConfirm={handleConfirmAddToLibrary}
          onCancel={handleCancelAddToLibrary}
        />
      )}
    </div>
  );
}
