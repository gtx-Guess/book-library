import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Plus, Search, CheckCircle, ChevronDown } from 'lucide-react';
import { api, CurrentlyReadingBook } from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import BookCover from '../components/BookCover';
import ConfirmBookModal from '../components/ConfirmBookModal';
import GoalProgressBar from '../components/GoalProgressBar';

export default function CurrentlyReadingPage() {
  const navigate = useNavigate();
  const [allBooks, setAllBooks] = useState<CurrentlyReadingBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookToDelete, setBookToDelete] = useState<CurrentlyReadingBook | null>(null);
  const [bookToMarkFinished, setBookToMarkFinished] = useState<CurrentlyReadingBook | null>(null);
  const [filterAuthor, setFilterAuthor] = useState('');
  const [filterPublisher, setFilterPublisher] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [goalData, setGoalData] = useState<{ hasGoal: boolean; booksRead: number; goalCount: number } | null>(null);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await api.getAllCurrentlyReadingBooks();
      setAllBooks(data);
      try {
        const currentYear = new Date().getFullYear();
        const stats = await api.getStats(currentYear);
        setGoalData({ hasGoal: stats.hasGoal, booksRead: stats.booksRead, goalCount: stats.goalCount });
      } catch (err) {
        // Goal data is optional
      }
    } catch (err) {
      setError('Failed to load currently reading books');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (book: CurrentlyReadingBook) => {
    setBookToDelete(book);
  };

  const handleConfirmDelete = async () => {
    if (!bookToDelete) return;

    try {
      await api.deleteCurrentlyReadingBook(bookToDelete.id);
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

  const handleMarkFinishedClick = (book: CurrentlyReadingBook) => {
    setBookToMarkFinished(book);
  };

  const handleConfirmMarkFinished = async (
    pageCount: number | undefined,
    completedDate: string,
    rating: number | undefined,
    own: boolean | undefined,
    willPurchase: string | undefined,
    link: string | undefined
  ) => {
    if (!bookToMarkFinished) return;

    try {
      const book = bookToMarkFinished.book;
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

      // Backend automatically removes from currently reading list
      // Update UI state to reflect the removal
      setAllBooks(allBooks.filter((b) => b.id !== bookToMarkFinished.id));
      setBookToMarkFinished(null);

      // Navigate to home page
      navigate('/');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to add book to library';
      setError(errorMessage);
      console.error(err);
      setBookToMarkFinished(null);
    }
  };

  const handleCancelMarkFinished = () => {
    setBookToMarkFinished(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    });
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
            <BookOpen size={22} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} />Currently Reading
          </h1>
          <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {allBooks.length} {allBooks.length === 1 ? 'book' : 'books'}
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/add-currently-reading')}
          style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          <Plus size={14} /> Add Book
        </button>
      </div>

      {goalData?.hasGoal && (
        <div style={{
          background: 'var(--surface)',
          borderRadius: 10,
          padding: '10px 14px',
          border: '1px solid var(--border)',
          marginBottom: '1rem',
        }}>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, fontWeight: 600 }}>
            {new Date().getFullYear()} Reading Goal
          </div>
          <GoalProgressBar booksRead={goalData.booksRead} goalCount={goalData.goalCount} compact />
        </div>
      )}

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
          <p className="text-secondary">No books in your currently reading list yet.</p>
          <button
            className="btn btn-primary mt-3"
            onClick={() => navigate('/add-currently-reading')}
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
            {filteredBooks.map((currentlyReadingBook) => (
              <div key={currentlyReadingBook.id} className="card">
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <BookCover src={currentlyReadingBook.book.coverImage} title={currentlyReadingBook.book.title} width={80} height={120} />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                      {currentlyReadingBook.book.title}
                    </h3>
                    {currentlyReadingBook.book.authors.length > 0 && (
                      <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        {currentlyReadingBook.book.authors.join(', ')}
                      </p>
                    )}
                    {currentlyReadingBook.startedDate && (
                      <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                        Started: {formatDate(currentlyReadingBook.startedDate)}
                      </p>
                    )}
                    {(currentlyReadingBook.currentPage != null || currentlyReadingBook.book.pageCount) && (
                      <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
                        {currentlyReadingBook.currentPage != null
                          ? `Page ${currentlyReadingBook.currentPage}${currentlyReadingBook.book.pageCount ? ` / ${currentlyReadingBook.book.pageCount}` : ''}`
                          : `${currentlyReadingBook.book.pageCount} pages`}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                      <button
                        className="btn btn-primary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        onClick={() => handleMarkFinishedClick(currentlyReadingBook)}
                      >
                        <CheckCircle size={14} /> Mark as Finished
                      </button>
                      {/* Remove button — hidden for seeded demo books */}
                      {!currentlyReadingBook.isSeeded && (
                        <button
                          className="btn"
                          style={{
                            padding: '0.5rem 1rem',
                            fontSize: '0.9rem',
                            background: '#dc2626',
                            color: 'white',
                            border: 'none'
                          }}
                          onClick={() => handleDeleteClick(currentlyReadingBook)}
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
          message={`Are you sure you want to remove "${bookToDelete.book.title}" from your currently reading list? This action cannot be undone.`}
          confirmText="Remove"
          cancelText="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          danger={true}
        />
      )}

      {/* Mark as Finished Modal */}
      {bookToMarkFinished && (
        <ConfirmBookModal
          book={{
            title: bookToMarkFinished.book.title,
            authors: bookToMarkFinished.book.authors || [],
            coverImage: bookToMarkFinished.book.coverImage,
            pageCount: bookToMarkFinished.book.pageCount,
          }}
          defaultDate={new Date().toISOString().split('T')[0]}
          onConfirm={handleConfirmMarkFinished}
          onCancel={handleCancelMarkFinished}
        />
      )}
    </div>
  );
}
