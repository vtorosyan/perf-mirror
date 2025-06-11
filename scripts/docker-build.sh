#!/bin/bash

echo "🐳 Building PerfMirror Docker image..."

# Build the production image
docker build -t perf-mirror:latest .

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully!"
    echo "🚀 To run the container, use:"
    echo "   docker run -p 3000:3000 perf-mirror:latest"
    echo "   or"
    echo "   docker-compose up"
else
    echo "❌ Docker build failed!"
    exit 1
fi 