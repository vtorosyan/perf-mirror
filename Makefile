# PerfMirror - Performance Tracking Application
# Makefile for development and deployment

.PHONY: help install dev build start clean docker-build docker-run docker-deploy docker-dev docker-stop docker-logs docker-clean db-push db-studio db-reset lint check-docker export-image backup-data restore-data

# Default target
help: ## Show this help message
	@echo "PerfMirror - Performance Tracking Application"
	@echo "=============================================="
	@echo ""
	@echo "Available commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Examples:"
	@echo "  make install     # Install dependencies"
	@echo "  make dev         # Start development server"
	@echo "  make docker-deploy # Deploy with Docker"

# =============================================================================
# Local Development
# =============================================================================

install: ## Install dependencies
	@echo "📦 Installing dependencies..."
	npm install

dev: ## Start development server
	@echo "🚀 Starting development server..."
	npm run dev

build: ## Build the application for production
	@echo "🔨 Building application..."
	npm run build

start: ## Start production server (requires build first)
	@echo "▶️  Starting production server..."
	npm run start

lint: ## Run linter
	@echo "🔍 Running linter..."
	npm run lint

clean: ## Clean build artifacts and node_modules
	@echo "🧹 Cleaning build artifacts..."
	rm -rf .next
	rm -rf node_modules
	rm -rf dist

# =============================================================================
# Database Management
# =============================================================================

db-push: ## Push database schema changes
	@echo "📊 Pushing database schema..."
	npx prisma db push

db-studio: ## Open Prisma Studio (database GUI)
	@echo "🎨 Opening Prisma Studio..."
	npx prisma studio

db-generate: ## Generate Prisma client
	@echo "🔄 Generating Prisma client..."
	npx prisma generate

db-reset: ## Reset database (WARNING: This will delete all data!)
	@echo "⚠️  WARNING: This will delete all data!"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	@echo "🗑️  Resetting database..."
	rm -f prisma/dev.db
	npx prisma db push

db-update-production: ## Update production database schema (Turso)
	@echo "🔧 Updating production database schema..."
	node scripts/ensure-production-schema.js

db-seed: ## Seed local database with default data
	@echo "🌱 Seeding local database..."
	npm run db:seed

seed-category-templates: ## Seed comprehensive category templates in production
	@echo "🌱 Seeding comprehensive category templates..."
	@if [ -z "$(TURSO_DATABASE_URL)" ] || [ -z "$(TURSO_AUTH_TOKEN)" ]; then \
		echo "❌ Please set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables"; \
		echo "Example: make seed-category-templates TURSO_DATABASE_URL=your-url TURSO_AUTH_TOKEN=your-token"; \
		exit 1; \
	fi
	TURSO_DATABASE_URL="$(TURSO_DATABASE_URL)" TURSO_AUTH_TOKEN="$(TURSO_AUTH_TOKEN)" node scripts/seed-comprehensive-category-templates.js

# =============================================================================
# Docker Operations
# =============================================================================

check-docker: ## Check if Docker is properly set up
	@echo "🔍 Checking Docker setup..."
	@./scripts/check-docker.sh

docker-build: ## Build Docker image
	@echo "🐳 Building Docker image..."
	@./scripts/docker-build.sh

docker-run: ## Run Docker container (single container)
	@echo "🏃 Running Docker container..."
	docker run -d --name perf-mirror -p 3000:3000 -v perf_mirror_data:/app/prisma perf-mirror:latest

docker-deploy: ## Deploy with Docker Compose (recommended)
	@echo "🚀 Deploying with Docker Compose..."
	@./scripts/docker-deploy.sh

docker-seed: ## Seed Docker database with initial data
	@echo "🌱 Seeding Docker database..."
	docker-compose exec perf-mirror npm run db:seed

docker-dev: ## Start development environment with Docker
	@echo "🛠️  Starting development environment..."
	docker-compose -f docker-compose.dev.yml up --build

docker-stop: ## Stop all Docker containers
	@echo "🛑 Stopping Docker containers..."
	docker-compose down
	-docker stop perf-mirror 2>/dev/null || true
	-docker rm perf-mirror 2>/dev/null || true

docker-logs: ## View Docker container logs
	@echo "📋 Viewing Docker logs..."
	docker-compose logs -f

docker-clean: ## Clean Docker containers, images, and volumes
	@echo "🧹 Cleaning Docker resources..."
	docker-compose down -v
	-docker rmi perf-mirror:latest 2>/dev/null || true
	-docker volume rm perf-mirror_perf_mirror_data 2>/dev/null || true
	-docker system prune -f

docker-restart: ## Restart Docker containers
	@echo "🔄 Restarting Docker containers..."
	docker-compose down
	docker-compose up -d

# =============================================================================
# Data Management
# =============================================================================

backup-data: ## Backup database data
	@echo "💾 Creating database backup..."
	@if [ -f prisma/dev.db ]; then \
		cp prisma/dev.db backup-$$(date +%Y%m%d_%H%M%S).db; \
		echo "✅ Backup created: backup-$$(date +%Y%m%d_%H%M%S).db"; \
	else \
		echo "❌ No database file found"; \
	fi

backup-docker-data: ## Backup Docker volume data
	@echo "💾 Creating Docker volume backup..."
	@mkdir -p backups
	docker run --rm -v perf_mirror_data:/data -v $(PWD)/backups:/backup alpine tar czf /backup/perf-mirror-backup-$$(date +%Y%m%d_%H%M%S).tar.gz -C /data .
	@echo "✅ Docker volume backup created in backups/ directory"

restore-data: ## Restore database from backup (specify BACKUP_FILE=filename)
	@if [ -z "$(BACKUP_FILE)" ]; then \
		echo "❌ Please specify BACKUP_FILE=filename"; \
		echo "Example: make restore-data BACKUP_FILE=backup-20241211_143000.db"; \
		exit 1; \
	fi
	@if [ -f "$(BACKUP_FILE)" ]; then \
		cp "$(BACKUP_FILE)" prisma/dev.db; \
		echo "✅ Database restored from $(BACKUP_FILE)"; \
	else \
		echo "❌ Backup file $(BACKUP_FILE) not found"; \
	fi

# =============================================================================
# Sharing and Export
# =============================================================================

export-image: ## Export Docker image for sharing
	@echo "📦 Exporting Docker image..."
	@./scripts/docker-export.sh

share-setup: ## Create a complete setup package for sharing
	@echo "📋 Creating setup package..."
	@mkdir -p perf-mirror-setup
	@cp docker-compose.yml perf-mirror-setup/
	@cp README.md perf-mirror-setup/
	@cp -r scripts perf-mirror-setup/
	@echo "✅ Setup package created in perf-mirror-setup/"
	@echo "📤 Share the perf-mirror-setup/ folder with colleagues"

# =============================================================================
# Health and Monitoring
# =============================================================================

health-check: ## Check application health
	@echo "🔍 Checking application health..."
	@curl -f http://localhost:3000/api/categories > /dev/null 2>&1 && \
		echo "✅ Application is healthy" || \
		echo "❌ Application is not responding"

status: ## Show application status
	@echo "📊 Application Status:"
	@echo "====================="
	@if pgrep -f "next dev" > /dev/null; then \
		echo "🟢 Development server: Running"; \
	else \
		echo "🔴 Development server: Stopped"; \
	fi
	@if docker ps | grep -q perf-mirror; then \
		echo "🟢 Docker container: Running"; \
	else \
		echo "🔴 Docker container: Stopped"; \
	fi
	@if [ -f prisma/dev.db ]; then \
		echo "🟢 Database: Present"; \
	else \
		echo "🔴 Database: Missing"; \
	fi

logs: ## Show development server logs (last 50 lines)
	@echo "📋 Recent logs:"
	@tail -n 50 ~/.npm/_logs/*.log 2>/dev/null | head -50 || echo "No logs found"

# =============================================================================
# Quick Setup Commands
# =============================================================================

setup: ## Complete setup (install + db + seed + ready to dev)
	@echo "⚡ Running complete setup..."
	make install
	make db-push
	@echo "🌱 Seeding local database with default data..."
	npm run db:seed
	@echo "✅ Setup complete! Run 'make dev' to start developing"

quick-start: ## Quick start with Docker (includes seeding)
	@echo "⚡ Quick start with Docker..."
	make check-docker
	make docker-deploy
	@echo "✅ Application started! Visit http://localhost:3000"
	@echo "🌱 Database will be automatically seeded on first run"

docker-fresh-start: ## Clean start with Docker (rebuild + seed)
	@echo "🔄 Fresh Docker start with seeding..."
	make docker-clean
	make docker-deploy
	@echo "✅ Fresh application started with seeded data! Visit http://localhost:3000"

reset-all: ## Reset everything (database + docker + builds)
	@echo "⚠️  WARNING: This will delete ALL data and containers!"
	@read -p "Are you sure? Type 'RESET' to confirm: " confirm && [ "$$confirm" = "RESET" ] || exit 1
	make docker-clean
	make db-reset
	make clean
	@echo "✅ Everything has been reset"

# =============================================================================
# Development Helpers
# =============================================================================

watch-logs: ## Watch logs in real-time
	@echo "👀 Watching logs..."
	@if docker-compose ps | grep -q perf-mirror; then \
		docker-compose logs -f; \
	else \
		echo "No Docker containers running. Start with 'make docker-deploy'"; \
	fi

debug-db: ## Show database contents
	@echo "🔍 Database contents:"
	@if [ -f prisma/dev.db ]; then \
		sqlite3 prisma/dev.db ".tables"; \
	else \
		echo "No database file found"; \
	fi

update-deps: ## Update all dependencies
	@echo "📦 Updating dependencies..."
	npm update
	npm audit fix

version: ## Show versions of key tools
	@echo "📋 Tool Versions:"
	@echo "================="
	@echo "Node.js: $$(node --version)"
	@echo "NPM: $$(npm --version)"
	@echo "Docker: $$(docker --version | cut -d' ' -f3 | cut -d',' -f1)"
	@echo "Docker Compose: $$(docker-compose --version | cut -d' ' -f4 | cut -d',' -f1)" 