# Book App Fixes — Design Spec
**Date:** 2026-04-11  
**Status:** Approved

## Overview

Four fixes to the Book Library Tracker app, scoped from a user-submitted PDF of issues. Fix #1 (publisher toggle) is deferred pending clarification from the user on intended UX.

---

## Fix #2 — Title Search Bar

### Goal
Allow users to search their library by book title without opening the filter dropdowns.

### Design
- The filter card in `LibraryPage.tsx` is restructured so the header row is always visible and contains:
  - A text `<input>` on the left, placeholder "Search by title...", bound to a new `filterTitle` state string
  - The existing `+` toggle button on the right, which continues to expand/collapse the filter dropdowns (Author, Publisher, Rating, Ownership, Will Purchase)
- The `filteredBooks` computation adds a first check: if `filterTitle` is set, exclude books whose title does not case-insensitively include `filterTitle`
- `hasActiveFilters` and `clearFilters` both include `filterTitle`
- The `useEffect` that resets pagination to page 1 on filter change includes `filterTitle` in its dependency array

**Scope:** Frontend only — `LibraryPage.tsx`. No backend changes.

---

## Fix #3 — Edit Anything After Adding a Book

### Goal
Allow users to edit reading-specific fields after a book has been added: `completedDate`, `pageCount`, `rating`, `own`, `willPurchase`, and `link`. (Book metadata — title, authors, publisher — is on the shared `Book` entity and is out of scope.)

### Frontend — `EditBookModal.tsx`
- New props: `currentCompletedDate: string` and `currentPageCount?: number`
- Two new fields added at the top of the form (above ownership fields):
  - **Finished Date** — `<input type="date">` pre-filled with `currentCompletedDate`
  - **Page Count** — `<input type="number">` pre-filled with `currentPageCount`
- The `onConfirm` data type expands: `{ completedDate?: string; pageCount?: number | null; own?: boolean; willPurchase?: string; link?: string; rating?: number | null }`

### Frontend — `LibraryPage.tsx`
- `handleEditClick` passes `currentCompletedDate={completedBook.completedDate}` and `currentPageCount={completedBook.pageCount ?? completedBook.book.pageCount}` into `<EditBookModal>`
- `handleConfirmEdit` updates local `books` and `allBooks` state to reflect `completedDate`, `year` (derived from new date), and `pageCount` changes

### Backend — `booksController.ts` → `updateCompletedBook`
- Destructure `completedDate` and `pageCount` from `req.body` in addition to existing fields
- If `completedDate` provided: parse to `Date`, recalculate `year = new Date(completedDate).getFullYear()`, include both in `updateData`. Note: changing the date to a different year will move the book to that year's library — this is expected behavior.
- If `pageCount` provided: include in `updateData` (allow `null` to clear)

---

## Fixes #4 & #5 — Page Count Mismatch (Home vs. Library)

### Root Cause
`LibraryPage.tsx` renders `completedBook.book.pageCount` (the shared `Book` entity's page count), while `statsController.ts` uses `completedBook.pageCount ?? completedBook.book.pageCount` (the per-read `CompletedBook` override first). When the two values differ — e.g. because the `Book` entity has a corrupted or incorrect page count — the home screen and library show different numbers.

### Fix
- In `LibraryPage.tsx`, change the page count display from:
  ```tsx
  {completedBook.book.pageCount && (
    <p ...>{completedBook.book.pageCount} pages</p>
  )}
  ```
  to:
  ```tsx
  {(completedBook.pageCount ?? completedBook.book.pageCount) && (
    <p ...>{completedBook.pageCount ?? completedBook.book.pageCount} pages</p>
  )}
  ```
- Users with corrupted `Book.pageCount` values can then self-correct via the edit modal added in Fix #3 (which writes to `CompletedBook.pageCount`, the override field).

**Scope:** Frontend only — one display expression in `LibraryPage.tsx`. No backend changes, no migration.

---

## Deferred

- **Fix #1 — Publisher Toggle:** Design depends on clarification from end user. Possible interpretations: toggle chips vs. dropdown, or show/hide toggle for the publisher filter column. To be specced separately once intent is confirmed.

---

## Files Changed

| File | Change |
|------|--------|
| `frontend/src/pages/LibraryPage.tsx` | Search bar in filter header; pass new props to EditBookModal; fix pageCount display |
| `frontend/src/components/EditBookModal.tsx` | Add completedDate and pageCount fields + props |
| `backend/src/controllers/booksController.ts` | Accept completedDate and pageCount in updateCompletedBook |
