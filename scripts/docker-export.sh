#!/bin/bash

echo "📦 Exporting PerfMirror Docker image for sharing..."

# Build the image if it doesn't exist
if ! docker image inspect perf-mirror:latest &> /dev/null; then
    echo "🔨 Building image first..."
    docker build -t perf-mirror:latest .
fi

# Export the image
echo "💾 Exporting image to perf-mirror.tar..."
docker save -o perf-mirror.tar perf-mirror:latest

if [ $? -eq 0 ]; then
    echo "✅ Image exported successfully!"
    echo "📊 File size: $(du -h perf-mirror.tar | cut -f1)"
    echo ""
    echo "📤 To share this image:"
    echo "   1. Send the perf-mirror.tar file to your colleague"
    echo "   2. They can load it with: docker load -i perf-mirror.tar"
    echo "   3. Then run: docker run -p 3000:3000 perf-mirror:latest"
    echo ""
    echo "🗑️  To clean up: rm perf-mirror.tar"
else
    echo "❌ Export failed!"
    exit 1
fi 