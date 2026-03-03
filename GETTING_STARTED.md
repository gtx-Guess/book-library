# Getting Started with Book Library

## What You Have

A full-stack book tracking web application with:

- **Backend API** (Node.js/Express/PostgreSQL)
  - Google Books API integration
  - JWT authentication
  - Book management (completed, DNF, want to read)
  - Goal tracking and statistics

- **Frontend** (React/TypeScript/Vite)
  - Mobile-first responsive design
  - Book search interface
  - Progress tracking and yearly stats
  - Login page with admin and demo accounts

- **Docker Setup**
  - Full Docker Compose configuration
  - PostgreSQL database with pgAdmin
  - Hot-reload development servers

## Quick Start

```bash
cp .env.example .env
# Edit .env — set JWT_SECRET, ADMIN_PASSWORD, and GOOGLE_BOOKS_API_KEY
docker compose up -d --build
docker compose exec backend npx ts-node prisma/seed.ts
```

Then open `http://localhost:4000` and log in with username `admin`.

## First Time Setup

1. **Log in**
   - Go to `http://localhost:4000`
   - Enter username `admin` and your `ADMIN_PASSWORD`

2. **Set Your Reading Goal**
   - Click "Set Goal" on the home page
   - Enter how many books you want to read this year

3. **Add Your First Book**
   - Click "Add Book"
   - Search for a book by title or author
   - Select it to add to your library

4. **Explore Other Lists**
   - Use the DNF list for books you didn't finish
   - Use Want to Read to queue up upcoming books

## Accounts

| Account | Username | Password |
|---------|----------|----------|
| Admin   | `admin`  | Your `ADMIN_PASSWORD` from `.env` |
| Demo    | `demo`   | `demo` |

Users can be invited via invite codes. The demo account has a pre-seeded read-only library and a 10-book cap per list.

## Access from Other Devices

1. Find your server's IP address: `ip addr show`
2. On your phone/tablet, browse to: `http://192.168.x.x:4000`
3. Add to home screen for an app-like experience

## Project Structure

```
book-library/
├── backend/              # Node.js API
│   ├── src/
│   │   ├── controllers/  # Business logic
│   │   ├── middleware/   # Auth, rate limiting
│   │   ├── routes/       # API endpoints
│   │   └── services/     # External APIs
│   └── prisma/           # Database schema & migrations
├── frontend/             # React app
│   └── src/
│       ├── pages/        # Main views
│       ├── contexts/     # Auth context
│       ├── services/     # API client
│       └── components/   # Reusable components
└── docker-compose.yml    # Container orchestration
```

## Common Tasks

**View logs:**
```bash
docker compose logs -f
```

**Restart a service:**
```bash
docker compose up -d --force-recreate backend
```

**Stop everything:**
```bash
docker compose down
```

**Backup database:**
```bash
docker compose exec database pg_dump -U booktracker booktracker > backup.sql
```

## Troubleshooting

**App won't start?**
- Check if ports 4000 and 4001 are available
- View logs: `docker compose logs`

**Can't connect from phone?**
- Ensure phone and server are on same network
- Check firewall settings on server

**Env var changes not taking effect?**
- Use `docker compose up -d --force-recreate <service>` instead of `restart`

**Database errors?**
- Reset: `docker compose down -v && docker compose up -d --build`
