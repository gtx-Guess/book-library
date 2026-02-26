# Deployment Guide

## Quick Start with Docker Compose

1. **Navigate to the book-tracker directory**
   ```bash
   cd /root/claude-development/book-tracker
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   nano .env
   ```

   Optional: Add your Google Books API key to `.env`:
   ```
   GOOGLE_BOOKS_API_KEY=your_key_here
   ```

   Note: The API works without a key but has rate limits. Get a free key at:
   https://developers.google.com/books/docs/v1/using#APIKey

3. **Build and start services**
   ```bash
   docker-compose up -d
   ```

   This will:
   - Create PostgreSQL database
   - Build and start backend API
   - Build and start frontend
   - Set up networking between containers

4. **Access the app**
   - Open browser to `http://localhost:3000`
   - Or use your server's IP: `http://192.168.x.x:3000`

## Database Management

**View logs:**
```bash
docker-compose logs -f
```

**Access database:**
```bash
docker exec -it book-tracker-db psql -U booktracker -d booktracker
```

**Backup database:**
```bash
docker exec book-tracker-db pg_dump -U booktracker booktracker > backup.sql
```

**Restore database:**
```bash
cat backup.sql | docker exec -i book-tracker-db psql -U booktracker -d booktracker
```

## Updating the App

```bash
git pull
docker-compose down
docker-compose up -d --build
```

## Troubleshooting

**Check service status:**
```bash
docker-compose ps
```

**View logs:**
```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

**Restart services:**
```bash
docker-compose restart
```

**Clean rebuild:**
```bash
docker-compose down -v
docker-compose up -d --build
```

## Network Access

To access from other devices on your network:
1. Find your server's local IP: `ip addr show`
2. Open `http://<server-ip>:3000` on any device

To change the port, edit `docker-compose.yml`:
```yaml
frontend:
  ports:
    - "8080:80"  # Change 8080 to your preferred port
```

## Security Notes

- This is designed for local network use only
- Database uses default credentials (change in production)
- No authentication system (single user assumed)
- Do NOT expose port 3000 to the internet without proper security

## Resource Usage

Approximate resource usage:
- PostgreSQL: ~50-100MB RAM
- Backend: ~50-100MB RAM
- Frontend (nginx): ~10-20MB RAM
- Total: ~150-250MB RAM
