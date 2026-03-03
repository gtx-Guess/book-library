# Deployment Guide

## Quick Start with Docker Compose

1. **Set up environment variables**
   ```bash
   cp .env.example .env
   nano .env
   ```

   Fill in the required values:
   ```env
   GOOGLE_BOOKS_API_KEY=your_key_here
   JWT_SECRET=your_long_random_secret   # openssl rand -base64 48
   ADMIN_PASSWORD=your_password
   ```

2. **Build and start services**
   ```bash
   docker compose up -d --build
   ```

3. **Seed the database (first run only)**
   ```bash
   docker compose exec backend npx ts-node prisma/seed.ts
   ```

4. **Access the app**
   - Open browser to `http://localhost:4000`
   - Or use your server's IP: `http://192.168.x.x:4000`
   - Log in with username `admin` and your `ADMIN_PASSWORD`

## Database Management

**View logs:**
```bash
docker compose logs -f
```

**Access database:**
```bash
docker compose exec database psql -U booktracker -d booktracker
```

**Backup database:**
```bash
docker compose exec database pg_dump -U booktracker booktracker > backup.sql
```

**Restore database:**
```bash
cat backup.sql | docker compose exec -T database psql -U booktracker -d booktracker
```

## Updating the App

```bash
git pull
docker compose down
docker compose up -d --build
```

## Troubleshooting

**Check service status:**
```bash
docker compose ps
```

**View logs:**
```bash
docker compose logs backend
docker compose logs frontend
docker compose logs database
```

**Env vars not applying:**

`docker compose restart` does NOT reload env vars. Use:
```bash
docker compose up -d --force-recreate backend
```

**Clean rebuild:**
```bash
docker compose down -v
docker compose up -d --build
```

## Network Access

To access from other devices on your network:
1. Find your server's local IP: `ip addr show`
2. Open `http://<server-ip>:4000` on any device

## Public / Production Deployment

The app supports a two-domain setup for public exposure:

- `book.yourdomain.com` → frontend (port 4000)
- `book-api.yourdomain.com` → backend (port 4001)

Set `VITE_API_URL=https://book-api.yourdomain.com` in `.env`, then recreate the frontend:

```bash
docker compose up -d --force-recreate frontend
```

Use Nginx Proxy Manager with Let's Encrypt for SSL on both domains.

## Security Notes

- JWT tokens expire after 7 days
- Passwords are hashed with bcrypt
- API rate limiting is enabled (auth: 10/15min, search: 30/min, general: 200/min)
- CORS is restricted to configured origins only
- Use a strong, randomly generated `JWT_SECRET`

## Resource Usage

Approximate resource usage:
- PostgreSQL: ~50-100MB RAM
- Backend: ~50-100MB RAM
- Frontend (Vite dev): ~100-150MB RAM
- Total: ~200-350MB RAM
