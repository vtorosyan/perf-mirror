#!/bin/bash

echo "🚀 Deploying PerfMirror with Docker Compose..."

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start the services
echo "🔨 Building and starting services..."
docker-compose up --build -d

if [ $? -eq 0 ]; then
    echo "✅ PerfMirror deployed successfully!"
    echo "🌐 Application is running at: http://localhost:3000"
    echo ""
    echo "📊 To view logs: docker-compose logs -f"
    echo "🛑 To stop: docker-compose down"
    echo "📋 To view running containers: docker-compose ps"
else
    echo "❌ Deployment failed!"
    exit 1
fi 