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
- `admin` — full access, admin dashboard (stats, users, invite codes, friendship management), created via seed with `ADMIN_PASSWORD` env var
- `user` — standard user, registered via invite codes
- `demo` — restricted: 10-book cap per list, no invite codes, no WebAuthn, no import/sync, no social features

## Project Structure
```
backend/
  src/
    controllers/   # authController, booksController, dnfController, goalsController, inviteController, statsController, wantToReadController, currentlyReadingController, importController, webAuthnController, adminController, profileController, friendsController
    middleware/     # authenticate (JWT + isActive check), demoLimits, requireAdmin, requireNonDemo
    routes/        # auth, books, dnf, goals, stats, wantToRead, currentlyReading, import, admin, profile, friends
    services/      # googleBooks
    types/         # express.d.ts (req.user typing)
  prisma/
    schema.prisma
    seed.ts
    migrations/

frontend/
  src/
    pages/         # HomePage, LoginPage, RegisterPage, AdminPage, LibraryPage, SettingsPage, CurrentlyReadingPage, AddCurrentlyReadingPage, SocialPage, FriendProfilePage, FriendLibraryPage, ProfileEditPage, etc.
    components/    # ProtectedRoute, BookCover, ImportSummaryModal, ConfirmCurrentlyReadingModal, AddFriendModal, modals, etc.
    contexts/      # AuthContext (user state, login/logout/register)
    services/      # api.ts (axios instance, all API calls), openLibrary.ts
```

## Key Patterns
- All API calls go through `frontend/src/services/api.ts` via a centralized axios instance
- Auth token stored in localStorage, auto-attached to requests via interceptor
- 401 responses auto-redirect to `/login`
- Routes use `authenticate` middleware; demo limits use `demoLimitCheck` middleware
- Admin routes use `authenticate` + `requireAdmin` middleware chain
- Social routes use `authenticate` + `requireNonDemo` middleware chain
- Backend `CMD` in Dockerfile runs `prisma migrate deploy` + `prisma db seed` on every container start
- **Social/Friends:** User profiles (bio, friend code, favorites, share library toggle). Friend connections via friend codes or admin panel. Auto-friend on invite-code registration. Friends can browse each other's libraries (read-only). Privacy toggle hides library, showing only goal + last book. Admin can manage friendships (create/remove) for any users via the Friends tab in admin dashboard.

## Running Locally
```bash
docker compose up --build -d
```
Frontend: `localhost:4000` | Backend: `localhost:4001` | pgAdmin: `localhost:5050`

## Database
- `DATABASE_URL` is set in docker-compose.yml, not in `.env`
- To run Prisma commands locally: `DATABASE_URL="postgresql://booktracker:booktracker_password@localhost:5432/booktracker" npx prisma ...`
- Migrations auto-apply on container start

## Navigation
- **Bottom nav bar** — persistent on all authenticated pages: Home, Quick Add (+), Settings. The + opens a radial burst menu with 4 icon bubbles (Finished, Currently Reading, Want to Read, DNF) and backdrop blur scrim.
- **Dashboard (HomePage)** — consolidated stats card, 2x2 "Your Lists" grid (year-specific library, Currently Reading, Want to Read, DNF), divider, then Reading History + Friends tiles side by side. Admin Dashboard button for admins.
- **Settings page** — appearance toggle, reading goal, edit profile, friend code, share library toggle, security, invite codes, GoodReads import, metadata sync, sign out.
- **Social pages** — `/social` (friend list + requests), `/friends/:friendId` (profile), `/friends/:friendId/:listType` (read-only library), `/profile/edit` (edit own profile + favorites).
