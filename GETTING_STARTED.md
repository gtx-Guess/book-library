# Getting Started with Book Tracker

## What You Have

A complete, production-ready book tracking web application with:

✅ **Backend API** (Node.js/Express/PostgreSQL)
- Google Books API integration
- Book management endpoints
- Goal tracking
- Statistics calculation

✅ **Frontend** (React/TypeScript/Vite)
- Mobile-first responsive design
- Book search interface
- Progress tracking
- Library view

✅ **Docker Setup**
- Complete Docker Compose configuration
- PostgreSQL database
- Automated deployments
- Network configuration

## Quick Start

### Option 1: Easy Start (Recommended)

```bash
cd /root/claude-development/book-tracker
./start.sh
```

Then open `http://localhost:3000` in your browser!

### Option 2: Manual Start

```bash
cd /root/claude-development/book-tracker
cp .env.example .env
docker-compose up -d --build
```

Note: The first build will take a few minutes as it downloads images and installs dependencies.

## First Time Setup

1. **Set Your Reading Goal**
   - Open the app
   - Click "Set Goal"
   - Enter how many books you want to read this year

2. **Add Your First Book**
   - Click "Add Book"
   - Search for a book by title or author
   - Click "Mark as Finished" to add it

3. **Track Progress**
   - Return to home page to see your progress
   - View your library to see all completed books

## Configuration

### Google Books API Key (Optional)

The app works without an API key but has lower rate limits. To add a key:

1. Get a free API key: https://developers.google.com/books/docs/v1/using#APIKey
2. Edit `.env` file
3. Add: `GOOGLE_BOOKS_API_KEY=your_key_here`
4. Restart: `docker-compose restart`

### Change Port

Edit `docker-compose.yml` to change from port 3000:

```yaml
frontend:
  ports:
    - "8080:80"  # Change to your preferred port
```

## Development Mode

Want to modify the code?

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
npx prisma generate
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Access from Other Devices

1. Find your server's IP address: `ip addr show`
2. On your phone/tablet, browse to: `http://192.168.x.x:3000`
3. Add to home screen for app-like experience!

## Project Structure

```
book-tracker/
├── backend/              # Node.js API
│   ├── src/
│   │   ├── controllers/  # Business logic
│   │   ├── routes/       # API endpoints
│   │   └── services/     # External APIs
│   └── prisma/           # Database schema
├── frontend/             # React app
│   └── src/
│       ├── pages/        # Main views
│       ├── services/     # API client
│       └── components/   # Reusable components
└── docker-compose.yml    # Container orchestration
```

## Common Tasks

**View logs:**
```bash
docker-compose logs -f
```

**Restart services:**
```bash
docker-compose restart
```

**Stop everything:**
```bash
docker-compose down
```

**Update after code changes:**
```bash
docker-compose up -d --build
```

**Backup database:**
```bash
docker exec book-tracker-db pg_dump -U booktracker booktracker > backup.sql
```

## Troubleshooting

**App won't start?**
- Check if ports 3000 and 3001 are available
- View logs: `docker-compose logs`

**Can't connect from phone?**
- Ensure phone and server are on same network
- Check firewall settings on server

**Database errors?**
- Reset database: `docker-compose down -v && docker-compose up -d`

## Next Steps

1. ✅ Get the app running
2. ✅ Set your first reading goal
3. ✅ Add some books
4. 🎯 Share the URL with your wife!

## Support

For issues or questions, check:
- `README.md` - Project overview
- `DEPLOYMENT.md` - Detailed deployment guide
- `backend/README.md` - API documentation
- `frontend/README.md` - Frontend details

Enjoy tracking your reading! 📚
