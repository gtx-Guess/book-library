# Book Library Tracker

## Overview
Full-stack book tracking app. Users track completed books, Currently Reading, DNF (Did Not Finish), and Want to Read lists with yearly reading goals. Supports GoodReads CSV import.

## Tech Stack
- **Backend:** Node.js + Express + TypeScript + Prisma ORM + PostgreSQL
- **Frontend:** React + TypeScript + Vite + React Router
- **Auth:** JWT + WebAuthn (Face ID/passkeys) + invite-code registration
- **Deployment:** Docker Compose (frontend, backend, postgres, pgadmin)

## Environments
- **Prod:** `book.tdnet.xyz`
- **Dev:** `dev.book.tdnet.xyz` (runs locally via Docker)
- Dev `.env` is at project root (`/.env`), not in `/backend`

## Roles
Three roles: `admin`, `user`, `demo`
- `admin` — full access, admin dashboard, created via seed with `ADMIN_PASSWORD` env var
- `user` — standard user, registered via invite codes
- `demo` — restricted: 10-book cap per list, no invite codes, no WebAuthn, no import/sync

## Project Structure
```
backend/
  src/
    controllers/   # authController, booksController, dnfController, goalsController, inviteController, statsController, wantToReadController, currentlyReadingController, importController, webAuthnController, adminController
    middleware/     # authenticate (JWT + isActive check), demoLimits, requireAdmin
    routes/        # auth, books, dnf, goals, stats, wantToRead, currentlyReading, import, admin
    services/      # googleBooks
    types/         # express.d.ts (req.user typing)
  prisma/
    schema.prisma
    seed.ts
    migrations/

frontend/
  src/
    pages/         # HomePage, LoginPage, RegisterPage, AdminPage, LibraryPage, SettingsPage, CurrentlyReadingPage, AddCurrentlyReadingPage, etc.
    components/    # ProtectedRoute, BookCover, ImportSummaryModal, ConfirmCurrentlyReadingModal, modals, etc.
    contexts/      # AuthContext (user state, login/logout/register)
    services/      # api.ts (axios instance, all API calls), openLibrary.ts
```

## Key Patterns
- All API calls go through `frontend/src/services/api.ts` via a centralized axios instance
- Auth token stored in localStorage, auto-attached to requests via interceptor
- 401 responses auto-redirect to `/login`
- Routes use `authenticate` middleware; demo limits use `demoLimitCheck` middleware
- Admin routes use `authenticate` + `requireAdmin` middleware chain
- Backend `CMD` in Dockerfile runs `prisma migrate deploy` + `prisma db seed` on every container start

## Running Locally
```bash
docker compose up --build -d
```
Frontend: `localhost:4000` | Backend: `localhost:4001` | pgAdmin: `localhost:5050`

## Database
- `DATABASE_URL` is set in docker-compose.yml, not in `.env`
- To run Prisma commands locally: `DATABASE_URL="postgresql://booktracker:booktracker_password@localhost:5432/booktracker" npx prisma ...`
- Migrations auto-apply on container start

## Current Branch
`feature/currently-reading-and-import` — adds two features:
- **Currently Reading list** — new `CurrentlyReadingBook` model with `startedDate` and `currentPage` fields. Full CRUD (controller, routes, frontend pages). Cross-list removal: adding to completed/DNF removes from currently reading; adding to currently reading removes from want-to-read. Demo limit support.
- **GoodReads CSV Import** — on Settings page (`/settings`). Parses GoodReads export CSV, maps `Exclusive Shelf` to lists (read→completed, did-not-finish→DNF, currently-reading→CurrentlyReading, to-read→WantToRead). Custom shelves reported in summary as not imported. Duplicate detection on re-import. Background metadata sync enriches imported books via Google Books API (covers, descriptions). Standalone "Sync Metadata" button also available on Settings page.
- **Settings page** — new `/settings` route, first feature is import + sync. Import disabled for demo users (frontend + backend).
