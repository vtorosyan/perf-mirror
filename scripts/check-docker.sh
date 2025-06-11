#!/bin/bash

echo "🔍 Checking Docker setup for PerfMirror..."

# Check if Docker is installed
if command -v docker &> /dev/null; then
    echo "✅ Docker is installed: $(docker --version)"
else
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if command -v docker-compose &> /dev/null; then
    echo "✅ Docker Compose is installed: $(docker-compose --version)"
else
    echo "❌ Docker Compose is not installed."
    exit 1
fi

# Check if Docker daemon is running
if docker info &> /dev/null; then
    echo "✅ Docker daemon is running"
else
    echo "⚠️  Docker daemon is not running. Please start Docker Desktop or the Docker daemon."
    echo "   On macOS: Start Docker Desktop"
    echo "   On Linux: sudo systemctl start docker"
    exit 1
fi

# Check if required files exist
required_files=("Dockerfile" "docker-compose.yml" "docker-entrypoint.sh" "package.json")
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file is missing"
        exit 1
    fi
done

echo ""
echo "🎉 All checks passed! You're ready to deploy PerfMirror with Docker."
echo ""
echo "🚀 Quick deployment commands:"
echo "   docker-compose up --build -d    # Start the application"
echo "   docker-compose logs -f          # View logs"
echo "   docker-compose down             # Stop the application"
echo ""
echo "🛠️  Or use the convenience scripts:"
echo "   ./scripts/docker-deploy.sh      # Full deployment"
echo "   ./scripts/docker-build.sh       # Build only" 