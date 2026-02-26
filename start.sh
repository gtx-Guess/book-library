#!/bin/bash

echo "🚀 Starting Book Tracker..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. You can add your Google Books API key later."
    echo ""
fi

# Build and start containers
echo "🐳 Building and starting Docker containers..."
echo "⏳ First build may take a few minutes..."
docker-compose up -d --build

echo ""
echo "⏳ Waiting for services to start..."
sleep 10

# Check status
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ Book Tracker is running!"
echo ""
echo "📱 Access the app:"
echo "   App:      http://localhost:3000"
echo "   Network:  http://$(hostname -I | awk '{print $1}'):3000"
echo "   pgAdmin:  http://localhost:5050"
echo "   API:      http://localhost:3001/health"
echo ""
echo "🔑 pgAdmin credentials:"
echo "   Email:    admin@booktracker.local"
echo "   Password: admin"
echo ""
echo "📝 Useful commands:"
echo "   View logs:    docker-compose logs -f"
echo "   View backend: docker-compose logs -f backend"
echo "   Stop:         docker-compose down"
echo "   Restart:      docker-compose restart"
echo ""
