# Book Library — Frontend

React + TypeScript + Vite mobile-first web app.

## Pages

- **Login** - User login and demo access
- **Home** - Reading progress, yearly goal, quick actions
- **Library** - All completed books for the current year
- **History** - Browse books by past year
- **Add Book** - Search and add a completed book
- **DNF** - Did Not Finish list
- **Add DNF** - Search and add a DNF book
- **Want to Read** - Reading queue
- **Add Want to Read** - Search and queue a book
- **Goal Settings** - Set annual reading goal
- **Stats** - Reading statistics across all years

## Features

- Mobile-first responsive design
- Google Books API search with cover art
- JWT auth with axios interceptor (auto-attaches token, redirects on 401)
- Demo mode badge and read-only seeded content
- Rating display for completed books

## Development

The frontend runs via Docker Compose as a Vite dev server with hot-reload. See root `DEV_NOTES.md` for workflow details.

App runs on `http://localhost:4000`

## Production

For public deployment, set `VITE_API_URL` in `.env` to your backend's public domain, then force-recreate the container:

```bash
docker compose up -d --force-recreate frontend
```
