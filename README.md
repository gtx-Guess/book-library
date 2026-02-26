# Book Tracker

A mobile-first web application for tracking books read throughout the year.

## Features

- 📚 Search and add books via Google Books API
- ✅ Mark books as finished with completion date
- 🎯 Set annual reading goals
- 📊 Track progress toward yearly goals
- 📱 Mobile-first responsive design
- 🏠 Self-hosted with Docker

## Quick Start

1. **Navigate to the project**
   ```bash
   cd /root/claude-development/book-tracker
   ```

2. **Set up environment variables (optional)**
   ```bash
   cp .env.example .env
   # Edit .env and add your Google Books API key (optional)
   ```

3. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d --build
   ```

4. **Access the app**
   - App: `http://localhost:3000` or `http://192.168.x.x:3000`
   - pgAdmin: `http://localhost:5050` (Email: admin@booktracker.local, Password: admin)
   - API: `http://localhost:3001/health` (health check)

## Architecture

- **Frontend**: React with Vite, mobile-first design
- **Backend**: Node.js/Express REST API
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Docker Compose

## Development

See individual README files in `/backend` and `/frontend` directories for development setup.

## Data Management

Books are organized by year. Each year has:
- Separate reading goal
- Separate library of completed books
- Previous years are archived and remain accessible
