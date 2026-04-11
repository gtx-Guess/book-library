import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, CompletedBook, PaginatedBooks } from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import RatingDisplay from '../components/RatingDisplay';
import AddLinkModal from '../components/AddLinkModal';
import BookCover from '../components/BookCover';
import EditBookModal from '../components/EditBookModal';
import homeIcon from '../assets/home.png';

export default function LibraryPage() {
  const navigate = useNavigate();
  const { year } = useParams<{ year: string }>();
  const isGrandLibrary = year === 'all';

  const [books, setBooks] = useState<CompletedBook[]>([]);
  const [allBooks, setAllBooks] = useState<CompletedBook[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const ITEMS_PER_PAGE = 20;
  const [error, setError] = useState('');
  const [bookToDelete, setBookToDelete] = useState<CompletedBook | null>(null);
  const [bookToAddLink, setBookToAddLink] = useState<CompletedBook | null>(null);
  const [bookToEdit, setBookToEdit] = useState<CompletedBook | null>(null);
  const [filterTitle, setFilterTitle] = useState('');
  const [filterAuthor, setFilterAuthor] = useState('');
  const [filterPublisher, setFilterPublisher] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [filterOwn, setFilterOwn] = useState('');
  const [filterWillPurchase, setFilterWillPurchase] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (year) {
      loadBooks();
    }
  }, [year]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      if (isGrandLibrary) {
        // Fetch all books for filtering
        let allFetchedBooks: CompletedBook[] = [];
        let currentPage = 1;
        let hasMore = true;

        while (hasMore) {
          const data: PaginatedBooks = await api.getAllCompletedBooks(currentPage, 100);
          allFetchedBooks = allFetchedBooks.concat(data.books);

          if (currentPage >= data.pagination.totalPages) {
            hasMore = false;
          } else {
            currentPage++;
          }
        }

        setAllBooks(allFetchedBooks);
        setBooks(allFetchedBooks);
      } else {
        const data = await api.getCompletedBooks(parseInt(year!));
        setAllBooks(data);
        setBooks(data);
      }
    } catch (err) {
      setError('Failed to load books');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (book: CompletedBook) => {
    setBookToDelete(book);
  };

  const handleConfirmDelete = async () => {
    if (!bookToDelete) return;

    try {
      await api.deleteCompletedBook(bookToDelete.id);
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

  const handleAddLinkClick = (book: CompletedBook) => {
    setBookToAddLink(book);
  };

  const handleConfirmAddLink = async (link: string) => {
    if (!bookToAddLink) return;

    try {
      await api.updateCompletedBook(bookToAddLink.id, { link });
      // Update the book in the local state
      setBooks(books.map(b =>
        b.id === bookToAddLink.id
          ? { ...b, link }
          : b
      ));
      setAllBooks(allBooks.map(b =>
        b.id === bookToAddLink.id
          ? { ...b, link }
          : b
      ));
      setBookToAddLink(null);
    } catch (err) {
      setError('Failed to add link');
      console.error(err);
      setBookToAddLink(null);
    }
  };

  const handleCancelAddLink = () => {
    setBookToAddLink(null);
  };

  const handleEditClick = (book: CompletedBook) => {
    setBookToEdit(book);
  };

  const handleConfirmEdit = async (data: { completedDate?: string; pageCount?: number | null; own?: boolean; willPurchase?: string; link?: string; rating?: number | null }) => {
    if (!bookToEdit) return;

    try {
      await api.updateCompletedBook(bookToEdit.id, data);
      const updatedFields: Partial<typeof bookToEdit> = { ...data };
      if (data.completedDate) {
        updatedFields.completedDate = new Date(data.completedDate).toISOString();
        updatedFields.year = new Date(data.completedDate).getFullYear();
      }
      setBooks(books.map(b =>
        b.id === bookToEdit.id
          ? { ...b, ...updatedFields }
          : b
      ));
      setAllBooks(allBooks.map(b =>
        b.id === bookToEdit.id
          ? { ...b, ...updatedFields }
          : b
      ));
      setBookToEdit(null);
    } catch (err) {
      setError('Failed to update book');
      console.error(err);
      setBookToEdit(null);
    }
  };

  const handleDeleteFromEdit = () => {
    if (!bookToEdit) return;
    // Close edit modal and open delete confirmation
    setBookToDelete(bookToEdit);
    setBookToEdit(null);
  };

  const handleCancelEdit = () => {
    setBookToEdit(null);
  };

  // Get unique authors and publishers for filter dropdowns from all books
  const uniqueAuthors = Array.from(
    new Set(allBooks.flatMap(b => b.book.authors))
  ).sort();

  const uniquePublishers = Array.from(
    new Set(allBooks.map(b => b.book.publisher).filter(p => p))
  ).sort();

  // Filter books based on selected filters
  const filteredBooks = allBooks.filter(book => {
    if (filterTitle && !book.book.title.toLowerCase().includes(filterTitle.toLowerCase())) {
      return false;
    }

    if (filterAuthor && !book.book.authors.includes(filterAuthor)) {
      return false;
    }

    if (filterPublisher && book.book.publisher !== filterPublisher) {
      return false;
    }

    if (filterRating) {
      const ratingNum = parseFloat(filterRating);
      if (!book.rating || book.rating !== ratingNum) {
        return false;
      }
    }

    if (filterOwn !== '') {
      if (filterOwn === 'owned' && book.own !== true) {
        return false;
      }
      if (filterOwn === 'not-owned' && book.own !== false) {
        return false;
      }
    }

    if (filterWillPurchase !== '') {
      if (filterWillPurchase === 'will-buy' && book.willPurchase !== 'yes') {
        return false;
      }
      if (filterWillPurchase === 'maybe-buy' && book.willPurchase !== 'maybe') {
        return false;
      }
      if (filterWillPurchase === 'wont-buy' && book.willPurchase !== 'no') {
        return false;
      }
    }

    return true;
  });

  const clearFilters = () => {
    setFilterTitle('');
    setFilterAuthor('');
    setFilterPublisher('');
    setFilterRating('');
    setFilterOwn('');
    setFilterWillPurchase('');
  };

  const hasActiveFilters = filterTitle || filterAuthor || filterPublisher || filterRating || filterOwn !== '' || filterWillPurchase !== '';

  // Group books by bookId and count occurrences for Grand Library
  const processedBooks = isGrandLibrary
    ? (() => {
        const bookMap = new Map<string, { book: CompletedBook; count: number; allReads: CompletedBook[] }>();

        filteredBooks.forEach(book => {
          const existing = bookMap.get(book.bookId);
          if (existing) {
            existing.count++;
            existing.allReads.push(book);
            // Keep the most recent read as the main display
            if (new Date(book.completedDate) > new Date(existing.book.completedDate)) {
              existing.book = book;
            }
          } else {
            bookMap.set(book.bookId, { book, count: 1, allReads: [book] });
          }
        });

        return Array.from(bookMap.values());
      })()
    : filteredBooks.map(book => ({ book, count: 1, allReads: [book] }));

  // Paginate processed books for Grand Library
  const paginatedBooks = isGrandLibrary
    ? processedBooks.slice((pagination.page - 1) * ITEMS_PER_PAGE, pagination.page * ITEMS_PER_PAGE)
    : processedBooks;

  const totalPages = isGrandLibrary
    ? Math.ceil(processedBooks.length / ITEMS_PER_PAGE)
    : 1;

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [filterTitle, filterAuthor, filterPublisher, filterRating, filterOwn, filterWillPurchase]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', position: 'relative' }}>
        <button
          onClick={() => {
            if (isGrandLibrary) {
              navigate('/history');
            } else {
              const currentYear = new Date().getFullYear();
              if (parseInt(year!) === currentYear) {
                navigate('/');
              } else {
                navigate(`/year/${year}`);
              }
            }
          }}
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
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.5rem' }}>
            {isGrandLibrary ? '📚 Grand Library' : `${year} Library`}
          </h1>
          {isGrandLibrary && (
            <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {allBooks.length} books across all years
            </p>
          )}
        </div>
        <button
          onClick={() => navigate('/')}
          style={{
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

      {/* Filter Section */}
      {allBooks.length > 0 && (
        <div className="card mb-3" style={{ padding: '1rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <input
              type="text"
              className="input"
              placeholder="Search by title..."
              value={filterTitle}
              onChange={(e) => setFilterTitle(e.target.value)}
              style={{ flex: 1, margin: 0 }}
            />
            {hasActiveFilters && !filterTitle && (
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '0.2rem 0.4rem',
                  background: 'var(--primary)',
                  color: 'white',
                  borderRadius: '1rem',
                  whiteSpace: 'nowrap',
                }}
              >
                Filters
              </span>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1.1rem',
                padding: '0.35rem 0.6rem',
                lineHeight: 1,
                color: showFilters ? 'var(--primary)' : 'var(--text-secondary)',
              }}
              title="Toggle filters"
            >
              {showFilters ? '▼' : '➕'}
            </button>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <label style={{ display: 'block' }}>
                  <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                    Rating
                  </span>
                  <select
                    className="input"
                    value={filterRating}
                    onChange={(e) => setFilterRating(e.target.value)}
                  >
                    <option value="">All Ratings</option>
                    {[10, 9.5, 9, 8.5, 8, 7.5, 7, 6.5, 6, 5.5, 5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5].map(rating => (
                      <option key={rating} value={rating}>{rating}/10</option>
                    ))}
                  </select>
                </label>

                <label style={{ display: 'block' }}>
                  <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                    Ownership
                  </span>
                  <select
                    className="input"
                    value={filterOwn}
                    onChange={(e) => setFilterOwn(e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="owned">Owned</option>
                    <option value="not-owned">Not Owned</option>
                  </select>
                </label>

                <label style={{ display: 'block' }}>
                  <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                    Will Purchase
                  </span>
                  <select
                    className="input"
                    value={filterWillPurchase}
                    onChange={(e) => setFilterWillPurchase(e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="will-buy">Will Buy</option>
                    <option value="maybe-buy">Maybe Buy</option>
                    <option value="wont-buy">Won't Buy</option>
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
          <p className="text-secondary">No books found.</p>
          {!isGrandLibrary && (
            <button
              className="btn btn-primary mt-3"
              onClick={() => navigate('/add')}
            >
              Add Your First Book
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Results count */}
          {hasActiveFilters && (
            <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Showing {isGrandLibrary ? processedBooks.length : filteredBooks.length} of {isGrandLibrary ? processedBooks.length : allBooks.length} books
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {paginatedBooks.map(({ book: completedBook, count }) => (
              <div key={completedBook.id} className="card" style={{ position: 'relative' }}>
                {/* Edit Icon — hidden for seeded demo books */}
                {!completedBook.isSeeded && (
                  <button
                    onClick={() => handleEditClick(completedBook)}
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1.25rem',
                      padding: '0.25rem',
                      lineHeight: 1,
                      color: 'var(--text-secondary)',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                    title="Edit book details"
                  >
                    ✏️
                  </button>
                )}

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <BookCover src={completedBook.book.coverImage} title={completedBook.book.title} width={80} height={120} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.1rem', margin: 0 }}>
                        {completedBook.book.title}
                      </h3>
                      {isGrandLibrary && count > 1 && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            background: '#e0e7ff',
                            color: '#4338ca',
                            borderRadius: '0.25rem',
                            fontWeight: '600',
                          }}
                        >
                          {count}× read
                        </span>
                      )}
                    </div>
                    {completedBook.book.authors.length > 0 && (
                      <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        {completedBook.book.authors.join(', ')}
                      </p>
                    )}
                    <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
                      Finished: {formatDate(completedBook.completedDate)}
                    </p>
                    {(completedBook.pageCount ?? completedBook.book.pageCount) && (
                      <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
                        {completedBook.pageCount ?? completedBook.book.pageCount} pages
                      </p>
                    )}
                    {completedBook.rating && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <RatingDisplay rating={completedBook.rating} />
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                      {completedBook.own !== null && completedBook.own !== undefined && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            background: completedBook.own ? '#dcfce7' : '#fee2e2',
                            color: completedBook.own ? '#166534' : '#991b1b',
                            borderRadius: '0.25rem',
                            fontWeight: '500',
                          }}
                        >
                          {completedBook.own ? '✓ Owned' : '✗ Not Owned'}
                        </span>
                      )}
                      {completedBook.willPurchase !== null && completedBook.willPurchase !== undefined && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            background:
                              completedBook.willPurchase === 'yes' ? '#dbeafe' :
                              completedBook.willPurchase === 'maybe' ? '#fef3c7' :
                              '#f3f4f6',
                            color:
                              completedBook.willPurchase === 'yes' ? '#1e40af' :
                              completedBook.willPurchase === 'maybe' ? '#92400e' :
                              '#6b7280',
                            borderRadius: '0.25rem',
                            fontWeight: '500',
                          }}
                        >
                          {completedBook.willPurchase === 'yes' ? '🛒 Will Buy' :
                           completedBook.willPurchase === 'maybe' ? 'Maybe Buy' :
                           'Won\'t Buy'}
                        </span>
                      )}
                    </div>
                    {(completedBook.link || ((completedBook.willPurchase === 'yes' || completedBook.willPurchase === 'maybe') && !completedBook.link)) && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                        {completedBook.link && (
                          <a
                            href={completedBook.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', textDecoration: 'none' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            🔗 View Purchase Link
                          </a>
                        )}
                        {(completedBook.willPurchase === 'yes' || completedBook.willPurchase === 'maybe') && !completedBook.link && (
                          <button
                            className="btn btn-primary"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                            onClick={() => handleAddLinkClick(completedBook)}
                          >
                            ➕ Add Link
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination for Grand Library */}
          {isGrandLibrary && totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
              <button
                className="btn btn-secondary"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                style={{ padding: '0.5rem 1rem' }}
              >
                ← Prev
              </button>
              <div style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center' }}>
                Page {pagination.page} of {totalPages}
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === totalPages}
                style={{ padding: '0.5rem 1rem' }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Confirm Delete Dialog */}
      {bookToDelete && (
        <ConfirmDialog
          title="Remove Book"
          message={`Are you sure you want to remove "${bookToDelete.book.title}" from your library? This action cannot be undone.`}
          confirmText="Remove"
          cancelText="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          danger={true}
        />
      )}

      {/* Add Link Modal */}
      {bookToAddLink && (
        <AddLinkModal
          bookTitle={bookToAddLink.book.title}
          currentLink={bookToAddLink.link}
          onConfirm={handleConfirmAddLink}
          onCancel={handleCancelAddLink}
        />
      )}

      {/* Edit Book Modal */}
      {bookToEdit && (
        <EditBookModal
          bookTitle={bookToEdit.book.title}
          currentCompletedDate={bookToEdit.completedDate}
          currentPageCount={bookToEdit.pageCount ?? bookToEdit.book.pageCount ?? undefined}
          currentOwn={bookToEdit.own ?? undefined}
          currentWillPurchase={bookToEdit.willPurchase ?? undefined}
          currentLink={bookToEdit.link ?? undefined}
          currentRating={bookToEdit.rating ?? undefined}
          onConfirm={handleConfirmEdit}
          onDelete={handleDeleteFromEdit}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
}
