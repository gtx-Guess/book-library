# Book Library Tracker

## Overview
Full-stack book tracking app. Users track completed books, DNF (Did Not Finish), and Want to Read lists with yearly reading goals.

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
- `demo` — restricted: 10-book cap per list, no invite codes, no WebAuthn

## Project Structure
```
backend/
  src/
    controllers/   # authController, booksController, dnfController, goalsController, inviteController, statsController, wantToReadController, webAuthnController, adminController
    middleware/     # authenticate (JWT + isActive check), demoLimits, requireAdmin
    routes/        # auth, books, dnf, goals, stats, wantToRead, admin
    services/      # googleBooks
    types/         # express.d.ts (req.user typing)
  prisma/
    schema.prisma
    seed.ts
    migrations/

frontend/
  src/
    pages/         # HomePage, LoginPage, RegisterPage, AdminPage, LibraryPage, etc.
    components/    # ProtectedRoute, BookCover, modals, etc.
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
`feature/search-edit-page-count-fixes` — implements the following fixes:
- **Title search bar** — always-visible search input in the library filter card header; `+` button toggles the existing filter dropdowns
- **Full book editing** — `EditBookModal` now supports editing `completedDate` and `pageCount` in addition to existing fields (`own`, `willPurchase`, `rating`, `link`). Backend `updateCompletedBook` accepts and persists these fields, recalculating `year` when date changes.
- **Page count display fix** — LibraryPage now uses `completedBook.pageCount ?? book.pageCount` (consistent with home screen), resolving the mismatch between library and home screen page counts
- **"Last Book Finished" label** — home screen label corrected from "Last Book Added" to "Last Book Finished"

Deferred: publisher filter toggle (pending UX clarification from end user).
