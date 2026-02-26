# Development Notes

## Docker Setup

This project uses a **development-focused Docker setup** similar to the budget-app pattern:

### Key Features

1. **Volume Mounting** - Source code is mounted into containers for hot-reloading
   - Changes to code are immediately reflected (no rebuild needed)
   - Node modules are kept in container to avoid conflicts

2. **Dev Servers** - Running in development mode with hot-reload
   - Frontend: Vite dev server on port 3000
   - Backend: tsx watch mode on port 3001

3. **Database Tools** - pgAdmin included for easy database management
   - Access at `http://localhost:5050`
   - Default login: admin@booktracker.local / admin

4. **Health Checks** - Database has health check to ensure backend waits for it

5. **Restart Policy** - All services use `restart: unless-stopped`

## Making Changes

### Frontend Changes
- Edit files in `frontend/src/`
- Changes auto-reload in browser
- No rebuild needed

### Backend Changes
- Edit files in `backend/src/`
- Server auto-restarts on file changes
- No rebuild needed

### Database Schema Changes
1. Edit `backend/prisma/schema.prisma`
2. Create migration: `docker-compose exec backend npx prisma migrate dev --name your_change`
3. Backend will auto-reload with new schema

### Adding Dependencies

**Frontend:**
```bash
cd frontend
npm install package-name
docker-compose restart frontend
```

**Backend:**
```bash
cd backend
npm install package-name
docker-compose restart backend
```

## Container Management

**View logs:**
```bash
docker-compose logs -f [service_name]
```

**Restart a service:**
```bash
docker-compose restart [service_name]
```

**Rebuild after Dockerfile changes:**
```bash
docker-compose up -d --build [service_name]
```

**Stop everything:**
```bash
docker-compose down
```

**Clean start (removes volumes):**
```bash
docker-compose down -v
docker-compose up -d --build
```

## Database Access

### Via pgAdmin
1. Open `http://localhost:5050`
2. Login with admin@booktracker.local / admin
3. Add server:
   - Host: database
   - Port: 5432
   - Database: booktracker
   - Username: booktracker
   - Password: booktracker_password

### Via Command Line
```bash
docker-compose exec database psql -U booktracker -d booktracker
```

### Via Prisma Studio
```bash
docker-compose exec backend npx prisma studio
```

## Port Mapping

- `3000` - Frontend (Vite dev server)
- `3001` - Backend (Express API)
- `5432` - PostgreSQL database
- `5050` - pgAdmin (bound to 127.0.0.1 only)

## Environment Variables

Backend environment is configured in docker-compose.yml:
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Set to "development"
- `PORT` - Backend port (3001)
- `GOOGLE_BOOKS_API_KEY` - Optional, from .env file

## Architecture

This matches your existing apps (like budget-app):
- Development-focused with hot-reload
- Volume mounting for instant updates
- Single-stage Dockerfiles
- Health checks for dependencies
- Admin tools included (pgAdmin vs phpMyAdmin)
