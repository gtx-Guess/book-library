# Book App Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the page count display mismatch between home/library, add a title search bar to the library filter card, and allow users to edit `completedDate` and `pageCount` after a book has been added.

**Architecture:** All three fixes touch `LibraryPage.tsx`. The page count fix is a one-line display correction. The search bar adds a new always-visible `filterTitle` input that sits in the filter card header row. The edit expansion adds two new fields to `EditBookModal`, extends the `updateCompletedBook` API call in `api.ts`, and extends the backend controller to persist the new fields.

**Tech Stack:** React + TypeScript + Vite (frontend), Node.js + Express + TypeScript + Prisma (backend)

---

## File Map

| File | What changes |
|------|-------------|
| `frontend/src/pages/LibraryPage.tsx` | Fix pageCount display; add `filterTitle` state + search input in filter header; pass new props to `EditBookModal` |
| `frontend/src/components/EditBookModal.tsx` | Add `currentCompletedDate` and `currentPageCount` props; add date + page count fields to form |
| `frontend/src/services/api.ts` | Expand `updateCompletedBook` type to include `completedDate` and `pageCount` |
| `backend/src/controllers/booksController.ts` | Accept `completedDate` and `pageCount` in `updateCompletedBook`, persist both |

---

## Task 1: Fix page count display mismatch in LibraryPage

**Files:**
- Modify: `frontend/src/pages/LibraryPage.tsx:564-567`

This is the root cause of issues #4 and #5. The library currently shows `completedBook.book.pageCount` (the shared `Book` entity), while the home screen uses `completedBook.pageCount ?? completedBook.book.pageCount` (the per-read override first). When the two differ, the screens disagree.

- [ ] **Step 1: Open `frontend/src/pages/LibraryPage.tsx` and find the page count display block (around line 564)**

It currently reads:
```tsx
{completedBook.book.pageCount && (
  <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
    {completedBook.book.pageCount} pages
  </p>
)}
```

- [ ] **Step 2: Replace with the override-aware expression**

```tsx
{(completedBook.pageCount ?? completedBook.book.pageCount) && (
  <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
    {completedBook.pageCount ?? completedBook.book.pageCount} pages
  </p>
)}
```

- [ ] **Step 3: Start the dev server and verify manually**

```bash
docker compose up --build -d
```

Open `localhost:4000`, navigate to a year's library or the Grand Library, and confirm page counts match what the home screen shows for the "Last Book Added."

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/LibraryPage.tsx
git commit -m "fix: use CompletedBook pageCount override in library display"
```

---

## Task 2: Add title search bar to library filter card

**Files:**
- Modify: `frontend/src/pages/LibraryPage.tsx`

The filter card header row becomes: a text input on the left (always visible, "Search by title..."), and the `+` toggle button on the right (still expands/collapses the filter dropdowns). This replaces the current "🔍 Filters" label + toggle icon layout.

- [ ] **Step 1: Add `filterTitle` state near the other filter states (around line 29)**

Find:
```tsx
const [filterAuthor, setFilterAuthor] = useState('');
```

Add `filterTitle` directly above it:
```tsx
const [filterTitle, setFilterTitle] = useState('');
const [filterAuthor, setFilterAuthor] = useState('');
```

- [ ] **Step 2: Add title filter logic to `filteredBooks` (around line 181)**

Find the start of the `filteredBooks` filter block:
```tsx
const filteredBooks = allBooks.filter(book => {
    if (filterAuthor && !book.book.authors.includes(filterAuthor)) {
```

Add a title check as the very first condition inside the filter:
```tsx
const filteredBooks = allBooks.filter(book => {
    if (filterTitle && !book.book.title.toLowerCase().includes(filterTitle.toLowerCase())) {
      return false;
    }

    if (filterAuthor && !book.book.authors.includes(filterAuthor)) {
```

- [ ] **Step 3: Update `clearFilters` to reset `filterTitle`**

Find:
```tsx
const clearFilters = () => {
    setFilterAuthor('');
    setFilterPublisher('');
```

Replace with:
```tsx
const clearFilters = () => {
    setFilterTitle('');
    setFilterAuthor('');
    setFilterPublisher('');
```

- [ ] **Step 4: Update `hasActiveFilters` to include `filterTitle`**

Find:
```tsx
const hasActiveFilters = filterAuthor || filterPublisher || filterRating || filterOwn !== '' || filterWillPurchase !== '';
```

Replace with:
```tsx
const hasActiveFilters = filterTitle || filterAuthor || filterPublisher || filterRating || filterOwn !== '' || filterWillPurchase !== '';
```

- [ ] **Step 5: Add `filterTitle` to the pagination reset `useEffect` dependency array (around line 264)**

Find:
```tsx
  }, [filterAuthor, filterPublisher, filterRating, filterOwn, filterWillPurchase]);
```

Replace with:
```tsx
  }, [filterTitle, filterAuthor, filterPublisher, filterRating, filterOwn, filterWillPurchase]);
```

- [ ] **Step 6: Restructure the filter card header to show the search input always**

Find the filter card header section (around line 344–374):
```tsx
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
            <h2 style={{ fontSize: '1rem', fontWeight: '600' }}>
              🔍 Filters
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
            <span style={{ fontSize: '1.5rem' }}>
              {showFilters ? '▼' : '➕'}
            </span>
          </div>
```

Replace the entire block above (everything from `<div className="card mb-3"` through the closing `</div>` of the header row) with:
```tsx
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
```

- [ ] **Step 7: Verify in browser**

Reload `localhost:4000`, go to a library view. The filter card should now show a search input as the primary element. Typing filters books by title in real time. The `+` button opens/closes the dropdowns. Clearing the search and all dropdowns makes the "Filters" badge disappear.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/pages/LibraryPage.tsx
git commit -m "feat: add always-visible title search bar to library filter card"
```

---

## Task 3: Extend `api.ts` updateCompletedBook type

**Files:**
- Modify: `frontend/src/services/api.ts:292-295`

The `updateCompletedBook` call currently only accepts `link`, `own`, `willPurchase`, `rating`. Expand it to also accept `completedDate` (ISO date string) and `pageCount`.

- [ ] **Step 1: Find and update the `updateCompletedBook` method in `api.ts`**

Find:
```typescript
  updateCompletedBook: async (id: string, data: { link?: string; own?: boolean; willPurchase?: string; rating?: number | null }): Promise<CompletedBook> => {
    const response = await axiosInstance.patch(`/books/completed/${id}`, data);
    return response.data;
  },
```

Replace with:
```typescript
  updateCompletedBook: async (id: string, data: { link?: string; own?: boolean; willPurchase?: string; rating?: number | null; completedDate?: string; pageCount?: number | null }): Promise<CompletedBook> => {
    const response = await axiosInstance.patch(`/books/completed/${id}`, data);
    return response.data;
  },
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/services/api.ts
git commit -m "feat: expand updateCompletedBook API type to include completedDate and pageCount"
```

---

## Task 4: Extend backend `updateCompletedBook` to persist date and page count

**Files:**
- Modify: `backend/src/controllers/booksController.ts:111-143`

- [ ] **Step 1: Find the `updateCompletedBook` function and extend it**

Find:
```typescript
export async function updateCompletedBook(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { link, own, willPurchase, rating } = req.body;

    const record = await prisma.completedBook.findUnique({ where: { id } });

    if (!record || record.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (record.isSeeded) {
      return res.status(403).json({ error: 'Cannot modify seeded demo books' });
    }

    const updateData: any = {};
    if (link !== undefined) updateData.link = link || null;
    if (own !== undefined) updateData.own = own;
    if (willPurchase !== undefined) updateData.willPurchase = willPurchase;
    if (rating !== undefined) updateData.rating = rating;
```

Replace with:
```typescript
export async function updateCompletedBook(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { link, own, willPurchase, rating, completedDate, pageCount } = req.body;

    const record = await prisma.completedBook.findUnique({ where: { id } });

    if (!record || record.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (record.isSeeded) {
      return res.status(403).json({ error: 'Cannot modify seeded demo books' });
    }

    const updateData: any = {};
    if (link !== undefined) updateData.link = link || null;
    if (own !== undefined) updateData.own = own;
    if (willPurchase !== undefined) updateData.willPurchase = willPurchase;
    if (rating !== undefined) updateData.rating = rating;
    if (completedDate !== undefined) {
      const parsed = new Date(completedDate);
      if (isNaN(parsed.getTime())) {
        return res.status(400).json({ error: 'Invalid completedDate' });
      }
      updateData.completedDate = parsed;
      updateData.year = parsed.getFullYear();
    }
    if (pageCount !== undefined) updateData.pageCount = pageCount;
```

- [ ] **Step 2: Rebuild backend container and verify no TypeScript errors**

```bash
docker compose up --build -d backend
docker compose logs backend --tail=30
```

Expected: no errors in logs, backend starts successfully.

- [ ] **Step 3: Commit**

```bash
git add backend/src/controllers/booksController.ts
git commit -m "feat: accept completedDate and pageCount in updateCompletedBook endpoint"
```

---

## Task 5: Expand `EditBookModal` with date and page count fields

**Files:**
- Modify: `frontend/src/components/EditBookModal.tsx`

Add two new props (`currentCompletedDate: string`, `currentPageCount?: number`) and two new form fields at the top of the form: a date picker (Finished Date) and a page count input.

The `completedDate` coming from the API is an ISO string (e.g. `"2026-04-04T00:00:00.000Z"`). The `<input type="date">` expects `"YYYY-MM-DD"`. We convert on the way in.

- [ ] **Step 1: Update the `EditBookModalProps` interface**

Find:
```typescript
interface EditBookModalProps {
  bookTitle: string;
  currentOwn?: boolean;
  currentWillPurchase?: string;
  currentLink?: string;
  currentRating?: number;
  hideRating?: boolean;
  onConfirm: (data: { own?: boolean; willPurchase?: string; link?: string; rating?: number | null }) => void;
  onDelete: () => void;
  onCancel: () => void;
}
```

Replace with:
```typescript
interface EditBookModalProps {
  bookTitle: string;
  currentCompletedDate: string;
  currentPageCount?: number;
  currentOwn?: boolean;
  currentWillPurchase?: string;
  currentLink?: string;
  currentRating?: number;
  hideRating?: boolean;
  onConfirm: (data: { completedDate?: string; pageCount?: number | null; own?: boolean; willPurchase?: string; link?: string; rating?: number | null }) => void;
  onDelete: () => void;
  onCancel: () => void;
}
```

- [ ] **Step 2: Update the function signature destructuring**

Find:
```typescript
export default function EditBookModal({
  bookTitle,
  currentOwn,
  currentWillPurchase,
  currentLink,
  currentRating,
  hideRating,
  onConfirm,
  onDelete,
  onCancel,
}: EditBookModalProps) {
```

Replace with:
```typescript
export default function EditBookModal({
  bookTitle,
  currentCompletedDate,
  currentPageCount,
  currentOwn,
  currentWillPurchase,
  currentLink,
  currentRating,
  hideRating,
  onConfirm,
  onDelete,
  onCancel,
}: EditBookModalProps) {
```

- [ ] **Step 3: Add state for the two new fields**

Find the existing state declarations at the top of the component body:
```typescript
  const [own, setOwn] = useState(
    currentOwn === undefined ? '' : currentOwn ? 'yes' : 'no'
  );
```

Add `completedDate` and `pageCount` state directly above it:
```typescript
  const [completedDate, setCompletedDate] = useState(
    new Date(currentCompletedDate).toISOString().split('T')[0]
  );
  const [pageCount, setPageCount] = useState(
    currentPageCount !== undefined ? currentPageCount.toString() : ''
  );
  const [own, setOwn] = useState(
    currentOwn === undefined ? '' : currentOwn ? 'yes' : 'no'
  );
```

- [ ] **Step 4: Include the new fields in `handleSubmit`**

Find:
```typescript
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: { own?: boolean; willPurchase?: string; link?: string; rating?: number | null } = {};

    if (own !== '') {
```

Replace the entire `handleSubmit` function with:
```typescript
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: { completedDate?: string; pageCount?: number | null; own?: boolean; willPurchase?: string; link?: string; rating?: number | null } = {};

    if (completedDate) {
      data.completedDate = completedDate;
    }

    if (pageCount.trim() !== '') {
      const parsed = parseInt(pageCount, 10);
      if (!isNaN(parsed) && parsed > 0) {
        data.pageCount = parsed;
      }
    } else if (currentPageCount !== undefined) {
      data.pageCount = null;
    }

    if (own !== '') {
      data.own = own === 'yes';
    }

    if (willPurchase !== '') {
      data.willPurchase = willPurchase;
    }

    if (link.trim()) {
      data.link = link.trim();
    } else if (currentLink) {
      data.link = '';
    }

    if (rating.trim()) {
      data.rating = Math.min(10, Math.max(0, parseFloat(rating)));
    } else if (currentRating !== undefined) {
      data.rating = null;
    }

    onConfirm(data);
  };
```

- [ ] **Step 5: Add the two new form fields at the top of the form (before the ownership field)**

Find the `<form onSubmit={handleSubmit}>` opening, then find the first `<label>` inside it (the ownership dropdown):
```tsx
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: '1rem' }}>
            <span
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
              }}
            >
              Do you own this book?
            </span>
```

Insert two new fields between `<form onSubmit={handleSubmit}>` and that first `<label>`:
```tsx
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: '1rem' }}>
            <span style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Finished Date
            </span>
            <input
              type="date"
              className="input"
              value={completedDate}
              onChange={(e) => setCompletedDate(e.target.value)}
              required
            />
          </label>

          <label style={{ display: 'block', marginBottom: '1rem' }}>
            <span style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Page Count
            </span>
            <input
              type="number"
              className="input"
              placeholder="e.g. 341"
              min="1"
              value={pageCount}
              onChange={(e) => setPageCount(e.target.value)}
            />
          </label>

          <label style={{ display: 'block', marginBottom: '1rem' }}>
            <span
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
              }}
            >
              Do you own this book?
            </span>
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/EditBookModal.tsx
git commit -m "feat: add completedDate and pageCount fields to EditBookModal"
```

---

## Task 6: Wire up `LibraryPage` to pass new props and handle updated state

**Files:**
- Modify: `frontend/src/pages/LibraryPage.tsx`

Update `handleConfirmEdit` to handle the new `completedDate` and `pageCount` fields in local state, and pass the two new required props to `<EditBookModal>`.

- [ ] **Step 1: Update the `handleConfirmEdit` type signature and state update logic**

Find:
```typescript
  const handleConfirmEdit = async (data: { own?: boolean; willPurchase?: string; link?: string; rating?: number | null }) => {
    if (!bookToEdit) return;

    try {
      await api.updateCompletedBook(bookToEdit.id, data);
      // Update the book in the local state
      setBooks(books.map(b =>
        b.id === bookToEdit.id
          ? { ...b, ...data }
          : b
      ));
      setAllBooks(allBooks.map(b =>
        b.id === bookToEdit.id
          ? { ...b, ...data }
          : b
      ));
      setBookToEdit(null);
    } catch (err) {
      setError('Failed to update book');
      console.error(err);
      setBookToEdit(null);
    }
  };
```

Replace with:
```typescript
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
```

- [ ] **Step 2: Pass the new props to `<EditBookModal>`**

Find the `<EditBookModal>` usage (around line 694):
```tsx
      {bookToEdit && (
        <EditBookModal
          bookTitle={bookToEdit.book.title}
          currentOwn={bookToEdit.own ?? undefined}
          currentWillPurchase={bookToEdit.willPurchase ?? undefined}
          currentLink={bookToEdit.link ?? undefined}
          currentRating={bookToEdit.rating ?? undefined}
          onConfirm={handleConfirmEdit}
          onDelete={handleDeleteFromEdit}
          onCancel={handleCancelEdit}
        />
      )}
```

Replace with:
```tsx
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
```

- [ ] **Step 3: Rebuild and verify end-to-end**

```bash
docker compose up --build -d
```

1. Open `localhost:4000` → go to a year's library
2. Click the ✏️ icon on any non-seeded book
3. Confirm the modal shows "Finished Date" (pre-filled) and "Page Count" (pre-filled) at the top
4. Change the date and page count, click Save
5. Confirm the library card updates immediately (new date, new page count)
6. Reload the page — confirm changes persisted
7. Go to the home screen — confirm "Last Book Added" page count matches the library

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/LibraryPage.tsx
git commit -m "feat: wire up completedDate and pageCount editing in LibraryPage"
```

---

## Self-Review

**Spec coverage:**
- Fix #2 (search bar): Covered in Task 2 ✓
- Fix #3 (edit completedDate + pageCount): Covered in Tasks 3, 4, 5, 6 ✓
- Fix #4/#5 (page count display mismatch): Covered in Task 1 ✓
- Fix #1 (publisher toggle): Deferred — not in this plan ✓

**Type consistency check:**
- `onConfirm` data type in `EditBookModalProps` matches the type used in `handleConfirmEdit` in `LibraryPage` ✓
- `api.updateCompletedBook` data type matches what `handleConfirmEdit` passes ✓
- `completedDate` state in modal is `string` (YYYY-MM-DD from date input), sent as string to API, backend parses to `Date` ✓
- `pageCount` state in modal is `string` (from number input), parsed to `int` before including in data ✓
