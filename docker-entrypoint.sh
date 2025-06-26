#!/bin/sh

# Exit on any error
set -e

echo "🐳 Docker entrypoint script starting..."

# Function to check if database file exists and has tables
check_database() {
    if [ -f "/app/prisma/dev.db" ]; then
        echo "📁 Database file exists"
        # Check if tables exist by trying to query one of them
        if node -e "
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();
            prisma.category.findFirst().then(() => {
                console.log('✅ Database tables exist');
                process.exit(0);
            }).catch((e) => {
                console.log('❌ Database tables do not exist or are corrupted');
                process.exit(1);
            }).finally(() => prisma.\$disconnect());
        " 2>/dev/null; then
            echo "✅ Database is ready"
            return 0
        else
            echo "⚠️  Database file exists but tables are missing"
            return 1
        fi
    else
        echo "📝 Database file does not exist"
        return 1
    fi
}

# Initialize database if needed
if ! check_database; then
    echo "🔧 Initializing database..."
    
    # Push database schema (creates database and tables)
    echo "📊 Creating database schema..."
    npx prisma db push --accept-data-loss
    
    # Seed the database with initial data
    echo "🌱 Seeding database with initial data..."
    if [ -f "/app/scripts/seed-local-development.js" ]; then
        node /app/scripts/seed-local-development.js
    else
        echo "⚠️  Seeding script not found, skipping..."
    fi
    
    echo "✅ Database initialized and seeded successfully"
else
    echo "✅ Database already exists and is ready"
fi

echo "🚀 Starting the application..."

# Execute the command passed to the container
exec "$@" 