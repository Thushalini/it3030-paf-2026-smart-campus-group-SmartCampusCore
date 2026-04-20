#!/bin/bash

# Smart Campus Operations Hub - Setup Script
# This script sets up the development environment

echo "🚀 Setting up Smart Campus Operations Hub..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs data postgres

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start the services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check service health
echo "🔍 Checking service health..."
for i in {1..10}; do
    if curl -f http://localhost:8080/actuator/health &> /dev/null; then
        echo "✅ Backend is healthy!"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "❌ Backend failed to start properly"
        docker-compose logs backend
        exit 1
    fi
    echo "⏳ Waiting for backend... ($i/10)"
    sleep 10
done

for i in {1..10}; do
    if curl -f http://localhost:3000 &> /dev/null; then
        echo "✅ Frontend is healthy!"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "❌ Frontend failed to start properly"
        docker-compose logs frontend
        exit 1
    fi
    echo "⏳ Waiting for frontend... ($i/10)"
    sleep 10
done

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📱 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8080"
echo "   Database: localhost:5432"
echo ""
echo "👤 Demo Accounts:"
echo "   User: user@campus.com / Demo User button"
echo "   Admin: admin@campus.com / Demo Admin button"
echo ""
echo "🔧 Useful Commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo "   Access database: docker exec -it campus-postgres psql -U postgres -d campus_operations"
echo ""
echo "📚 Documentation: See README.md for more information"
