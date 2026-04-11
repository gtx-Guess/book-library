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
    components/    # ProtectedRoute, BottomNav, QuickAddMenu, BookCover, ImportSummaryModal, ConfirmCurrentlyReadingModal, modals, etc.
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
- **Navigation:** Persistent `BottomNav` component rendered inside `ProtectedRoute` on all authenticated pages (Home, Quick Add +, Settings). The + button opens a `QuickAddMenu` radial burst overlay with `createPortal` for the close button (escapes stacking context for backdrop blur).
- **Theming:** Light/dark mode via CSS variables on `:root` / `:root[data-theme="dark"]`. Toggle in Settings, persisted in localStorage, initialized in `index.html` before React loads to prevent flash.

## Running Locally
```bash
make dev
```
Frontend: `localhost:4000` | Backend: `localhost:4001` | pgAdmin: `localhost:5050`

Use `make clean` to nuke Docker volumes and rebuild from scratch (fixes stale `node_modules` issues).

## Database
- `DATABASE_URL` is set in docker-compose.yml, not in `.env`
- To run Prisma commands locally: `DATABASE_URL="postgresql://booktracker:booktracker_password@localhost:5432/booktracker" npx prisma ...`
- Migrations auto-apply on container start

## UI Architecture
- **Login page** — hero bookshelf illustration (CSS book spines), form section below. Dark themed standalone page.
- **Dashboard (HomePage)** — consolidated stats card (pages read, last book finished, goal progress), 2x2 "Your Lists" grid with live counts, Reading History row. No action buttons — those moved to bottom nav and settings.
- **Bottom nav bar** — persistent on all authenticated pages: Home, Quick Add (+), Settings. The + opens a radial burst menu with 4 icon bubbles (Finished, Currently Reading, Want to Read, DNF) and backdrop blur scrim.
- **Settings page** — appearance toggle (light/dark), reading goal, Face ID/security, invite codes, GoodReads import, metadata sync, sign out.
- **Sub-pages** — back arrow for navigation, no home icon (home is in bottom nav).
