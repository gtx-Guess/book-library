# Book Library — Backend

Node.js/Express API with PostgreSQL database.

## API Endpoints

### Auth
- `POST /api/auth/login` - Login (returns JWT)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Books (Completed)
- `GET /api/books/search?query=...` - Search Google Books API
- `POST /api/books/completed` - Add completed book
- `GET /api/books/completed/:year` - Get books for year
- `PUT /api/books/completed/:id` - Update completed book
- `DELETE /api/books/completed/:id` - Delete completed book

### DNF
- `POST /api/dnf` - Add DNF book
- `GET /api/dnf` - Get all DNF books
- `DELETE /api/dnf/:id` - Delete DNF book

### Want to Read
- `POST /api/want-to-read` - Add book
- `GET /api/want-to-read` - Get all books
- `DELETE /api/want-to-read/:id` - Delete book

### Goals
- `GET /api/goals/:year` - Get goal for year
- `POST /api/goals/:year` - Set/update goal for year

### Stats
- `GET /api/stats/:year` - Get stats for year
- `GET /api/stats/years` - Get all years with data

## Database Schema

- **User** - Owner and demo accounts with hashed passwords
- **CompletedBook** - Books marked as finished with date, rating, and notes
- **DNFBook** - Books that were not finished
- **WantToReadBook** - Reading queue
- **YearlyGoal** - Per-user reading goals per year

All book records are scoped to a user and support an `isSeeded` flag for demo read-only content.

## Development

The backend runs via Docker Compose with hot-reload (`tsx watch`). See the root `DEV_NOTES.md` for workflow details.

**Run migrations:**
```bash
docker compose exec backend npx prisma migrate dev --name your_change
```

**Seed database:**
```bash
docker compose exec backend npx ts-node prisma/seed.ts
```

**Prisma Studio:**
```bash
docker compose exec backend npx prisma studio
```

Server runs on `http://localhost:4001`
