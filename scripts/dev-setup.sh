#!/bin/bash

# Pastebin-Lite Local Development Startup Script

set -e

echo "🚀 Starting Pastebin-Lite development environment..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if docker compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please update Docker Desktop or install Docker Compose."
    exit 1
fi

# Start Redis
echo "📦 Starting Redis container..."
docker compose up -d

# Wait for Redis to be healthy
echo "⏳ Waiting for Redis to be healthy..."
for i in {1..30}; do
    if docker exec pastebin_redis redis-cli ping &> /dev/null; then
        echo "✅ Redis is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Redis failed to start"
        exit 1
    fi
    sleep 1
done

echo ""
echo "✅ Development environment is ready!"
echo ""
echo "📝 To start the Next.js development server, run:"
echo "   pnpm dev"
echo ""
echo "🛑 To stop Redis, run:"
echo "   docker compose down"
echo ""
