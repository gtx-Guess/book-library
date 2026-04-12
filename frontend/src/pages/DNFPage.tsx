import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookX, Plus, Search, Pencil, ShoppingCart, ChevronDown } from 'lucide-react';
import { api, DNFBook } from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import BookCover from '../components/BookCover';
import EditBookModal from '../components/EditBookModal';

export default function DNFPage() {
  const navigate = useNavigate();
  const [books, setBooks] = useState<DNFBook[]>([]);
  const [allBooks, setAllBooks] = useState<DNFBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookToDelete, setBookToDelete] = useState<DNFBook | null>(null);
  const [bookToEdit, setBookToEdit] = useState<DNFBook | null>(null);
  const [filterAuthor, setFilterAuthor] = useState('');
  const [filterPublisher, setFilterPublisher] = useState('');
  const [filterOwn, setFilterOwn] = useState('');
  const [filterWillPurchase, setFilterWillPurchase] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await api.getAllDNFBooks();
      setAllBooks(data);
      setBooks(data);
    } catch (err) {
      setError('Failed to load DNF books');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!bookToDelete) return;

    try {
      await api.deleteDNFBook(bookToDelete.id);
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

  const handleEditClick = (book: DNFBook) => {
    setBookToEdit(book);
  };

  const handleConfirmEdit = async (data: { own?: boolean; willPurchase?: string; link?: string }) => {
    if (!bookToEdit) return;

    try {
      // Only send own and willPurchase, ignore link
      await api.updateDNFBook(bookToEdit.id, {
        own: data.own,
        willPurchase: data.willPurchase,
      });

      // Update the book in the local state
      setBooks(books.map(b =>
        b.id === bookToEdit.id
          ? { ...b, own: data.own, willPurchase: data.willPurchase }
          : b
      ));
      setAllBooks(allBooks.map(b =>
        b.id === bookToEdit.id
          ? { ...b, own: data.own, willPurchase: data.willPurchase }
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
    setBookToDelete(bookToEdit);
    setBookToEdit(null);
  };

  const handleCancelEdit = () => {
    setBookToEdit(null);
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
    setFilterAuthor('');
    setFilterPublisher('');
    setFilterOwn('');
    setFilterWillPurchase('');
  };

  const hasActiveFilters = filterAuthor || filterPublisher || filterOwn !== '' || filterWillPurchase !== '';

  // Reset filters when they change
  useEffect(() => {
    // This is just to ensure re-render when filters change
  }, [filterAuthor, filterPublisher, filterOwn, filterWillPurchase]);

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
            <BookX size={22} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} />Did Not Finish
          </h1>
          <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {allBooks.length} {allBooks.length === 1 ? 'book' : 'books'}
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/add-dnf')}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
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
          <p className="text-secondary">No DNF books yet.</p>
          <button
            className="btn btn-primary mt-3"
            onClick={() => navigate('/add-dnf')}
          >
            Add Your First DNF Book
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
            {filteredBooks.map((dnfBook) => (
              <div key={dnfBook.id} className="card" style={{ position: 'relative' }}>
                {/* Edit Icon — hidden for seeded demo books */}
                {!dnfBook.isSeeded && (
                  <button
                    onClick={() => handleEditClick(dnfBook)}
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
                    <Pencil size={18} />
                  </button>
                )}

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <BookCover src={dnfBook.book.coverImage} title={dnfBook.book.title} width={80} height={120} />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                      {dnfBook.book.title}
                    </h3>
                    {dnfBook.book.authors.length > 0 && (
                      <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        {dnfBook.book.authors.join(', ')}
                      </p>
                    )}
                    {dnfBook.book.pageCount && (
                      <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
                        {dnfBook.book.pageCount} pages
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                      {dnfBook.own !== null && dnfBook.own !== undefined && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            background: dnfBook.own ? '#dcfce7' : '#fee2e2',
                            color: dnfBook.own ? '#166534' : '#991b1b',
                            borderRadius: '0.25rem',
                            fontWeight: '500',
                          }}
                        >
                          {dnfBook.own ? '✓ Owned' : '✗ Not Owned'}
                        </span>
                      )}
                      {dnfBook.willPurchase !== null && dnfBook.willPurchase !== undefined && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            background:
                              dnfBook.willPurchase === 'yes' ? '#dbeafe' :
                              dnfBook.willPurchase === 'maybe' ? '#fef3c7' :
                              '#f3f4f6',
                            color:
                              dnfBook.willPurchase === 'yes' ? '#1e40af' :
                              dnfBook.willPurchase === 'maybe' ? '#92400e' :
                              '#6b7280',
                            borderRadius: '0.25rem',
                            fontWeight: '500',
                          }}
                        >
                          {dnfBook.willPurchase === 'yes' ? <><ShoppingCart size={12} style={{ marginRight: 3, verticalAlign: 'text-bottom' }} />Will Buy</> :
                           dnfBook.willPurchase === 'maybe' ? 'Maybe Buy' :
                           'Won\'t Buy'}
                        </span>
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
          title="Remove DNF Book"
          message={`Are you sure you want to remove "${bookToDelete.book.title}" from your DNF list? This action cannot be undone.`}
          confirmText="Remove"
          cancelText="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          danger={true}
        />
      )}

      {/* Edit Book Modal - Note: link field will be ignored for DNF books */}
      {bookToEdit && (
        <EditBookModal
          bookTitle={bookToEdit.book.title}
          currentOwn={bookToEdit.own ?? undefined}
          currentWillPurchase={bookToEdit.willPurchase ?? undefined}
          currentLink={undefined}
          hideRating
          hideCompletedDate
          onConfirm={handleConfirmEdit}
          onDelete={handleDeleteFromEdit}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
}
