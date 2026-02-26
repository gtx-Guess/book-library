# Book Tracker Backend

Node.js/Express API with PostgreSQL database.

## Development Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL
   ```

3. **Set up database**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

Server runs on `http://localhost:3001`

## API Endpoints

### Books
- `GET /api/books/search?query=...` - Search Google Books API
- `POST /api/books/completed` - Add completed book
- `GET /api/books/completed/:year` - Get books for year
- `DELETE /api/books/completed/:id` - Delete completed book

### Goals
- `GET /api/goals/:year` - Get goal for year
- `POST /api/goals/:year` - Set/update goal for year

### Stats
- `GET /api/stats/:year` - Get stats for year
- `GET /api/stats/years` - Get all years with data

## Database Schema

- **Book** - Book information from Google Books
- **CompletedBook** - Books marked as finished with completion date
- **YearlyGoal** - Reading goals per year
