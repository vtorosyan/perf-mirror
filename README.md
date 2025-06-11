# PerfMirror - Performance Tracking for Engineers

A web application for tracking engineering performance using a customizable point-based scoring system. Built with Next.js, TypeScript, Tailwind CSS, and SQLite.

## Features

- **Dimension-Based Categories**: Define work categories with IOOI dimensions (Input, Output, Outcome, Impact) and point values
- **Grouped Weekly Logging**: Log activities organized by dimension with count tracking and score override capability
- **Role-Based Weighted Scoring**: Apply customizable weights based on your role (Engineer, Manager, Senior Manager, Director, or Custom)
- **IOOI Breakdown**: View detailed dimension scores showing Input, Output, Outcome, and Impact contributions
- **Performance Targets**: Set and track against configurable performance thresholds
- **Enhanced Dashboard**: Interactive charts with weighted scores and dimension breakdowns
- **Smart Insights**: AI-powered analysis detecting patterns like "High input, low outcome" with actionable recommendations
- **Score Override**: Manually adjust individual category scores when needed before saving logs

## Performance Levels

The default target configuration includes:
- **Excellent**: 225+ points per week
- **Good**: 170+ points per week  
- **Needs Improvement**: 120+ points per week
- **Unsatisfactory**: Below 120 points per week

## Quick Start

### Option 1: Using Make (Recommended)

```bash
# See all available commands
make help

# Complete setup and start development
make setup
make dev

# Or quick start with Docker
make quick-start
```

### Option 2: Manual Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up the database**:
   ```bash
   npm run db:push
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open the application**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Docker Deployment

For easy sharing and deployment, you can run PerfMirror using Docker:

### Option 1: Docker Compose (Recommended)

1. **Quick deployment**:
   ```bash
   # Build and start the application
   docker-compose up --build -d
   
   # View logs
   docker-compose logs -f
   
   # Stop the application
   docker-compose down
   ```

2. **Using the deployment script**:
   ```bash
   ./scripts/docker-deploy.sh
   ```

### Option 2: Docker Build and Run

1. **Build the Docker image**:
   ```bash
   docker build -t perf-mirror:latest .
   ```

2. **Run the container**:
   ```bash
   docker run -p 3000:3000 -v perf_mirror_data:/app/prisma perf-mirror:latest
   ```

3. **Using the build script**:
   ```bash
   ./scripts/docker-build.sh
   ```

### Development with Docker

For development with hot reload:

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up --build

# Stop development environment
docker-compose -f docker-compose.dev.yml down
```

### Docker Features

- **Automatic Database Setup**: The container automatically initializes the SQLite database on first run
- **Data Persistence**: Database data is persisted using Docker volumes
- **Health Checks**: Built-in health monitoring for the application
- **Production Optimized**: Multi-stage build for minimal image size
- **Easy Sharing**: Share the built image or docker-compose files with your team

### Environment Variables

The following environment variables can be configured:

```bash
# Database URL (default for SQLite)
DATABASE_URL="file:./dev.db"

# Node Environment
NODE_ENV="production"

# Disable Next.js telemetry (optional)
NEXT_TELEMETRY_DISABLED=1

# Port (optional, defaults to 3000)
PORT=3000
```

### Accessing the Application

Once running with Docker, the application will be available at:
- **Application**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/categories

### Data Persistence

Your performance tracking data is automatically persisted:

**Docker Deployment:**
- Database data is stored in a Docker volume (`perf_mirror_data`)
- Data survives container restarts and updates
- Volume persists until explicitly removed

**Local Development:**
- Database stored as `prisma/dev.db` file
- Automatically backed up during migrations

### Troubleshooting

**Common Issues:**

- **Docker Check**: Run `./scripts/check-docker.sh` to verify your Docker setup
- **View Logs**: Use `docker-compose logs -f` to see application logs  
- **Reset Database**: Stop the container and remove the volume: `docker-compose down && docker volume rm perf-mirror_perf_mirror_data`
- **Check Status**: Run `make status` to see current application state

**Docker-Specific Troubleshooting:**

- **Prisma Engine Issues**: If you see OpenSSL compatibility errors, the Dockerfile has been updated to include OpenSSL libraries for Alpine Linux. Rebuild the image with `make docker-build`
- **Binary Target Errors**: The Prisma schema includes binary targets for Alpine Linux (`linux-musl-openssl-3.0.x`). This fixes "engine not compatible" errors
- **Container Unhealthy**: If the container shows as unhealthy, check logs with `docker-compose logs` for Prisma client generation issues
- **Database Initialization**: The container automatically sets up the database on first run. If this fails, remove the volume and restart: `docker volume rm perf-mirror_perf_mirror_data && make docker-deploy`
- **Port Conflicts**: If port 3000 is busy, modify the `docker-compose.yml` ports mapping (e.g., `"3001:3000"`)

**Development Mode Issues:**

- **CSS Compilation Errors**: If you see `border-border` class errors, clear the build cache: `rm -rf .next && npm run dev`
- **Prisma Client Errors**: Regenerate the client: `npx prisma generate && npm run dev`
- **Database Connection**: Ensure the database exists: `npx prisma db push`

## Getting Started Guide

### 1. Create Work Categories

Start by defining your work categories in the **Categories** tab with IOOI dimensions:

**Input Activities:**
- **Code Reviews** (5 points each, Input)
- **Meeting Participation** (3 points each, Input)

**Output Activities:**
- **Feature Development** (10 points each, Output)
- **Bug Fixes** (3 points each, Output)

**Outcome Activities:**
- **Design Documents** (25 points each, Outcome)
- **Technical Proposals** (20 points each, Outcome)

**Impact Activities:**
- **Hiring Interviews** (15 points each, Impact)
- **Mentoring Sessions** (12 points each, Impact)

### 2. Configure Role Weights

Go to the **Role Weights** tab to set up dimension weights:

- **Engineer**: Input 30%, Output 40%, Outcome 20%, Impact 10%
- **Manager**: Input 20%, Output 40%, Outcome 30%, Impact 10%
- **Senior Manager**: Input 15%, Output 35%, Outcome 35%, Impact 15%
- **Director**: Input 10%, Output 25%, Outcome 40%, Impact 25%
- **Custom**: Define your own weights that sum to 100%

### 3. Set Performance Targets

Go to the **Targets** tab and create a performance target:

- Set your thresholds for different performance levels
- Activate your target to start getting insights
- Adjust time periods as needed (default: 12 weeks)

### 4. Log Weekly Activities

Use the **Log Work** tab to track your weekly activities:

- Select the week you want to log
- Activities are grouped by dimension (Input, Output, Outcome, Impact)
- Enter counts for each activity
- Override individual scores if needed (e.g., for exceptional work)
- View real-time IOOI breakdown and weighted score
- Save to update your performance data

### 5. Monitor Your Performance

The **Dashboard** provides:

- **Current Week Summary**: Raw and weighted scores with performance level
- **IOOI Breakdown**: Detailed view of Input, Output, Outcome, and Impact scores
- **Smart Insights**: AI-powered pattern detection and recommendations
- **Trend Charts**: Visual representation of performance over time
- **Recent Activity**: Activity log with override indicators

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **Charts**: Recharts
- **Icons**: Lucide React

## Project Structure

```
├── app/
│   ├── api/          # API routes
│   ├── globals.css   # Global styles
│   ├── layout.tsx    # Root layout
│   └── page.tsx      # Main application
├── components/       # React components
├── lib/             # Utility functions
├── prisma/          # Database schema
└── README.md        # This file
```

## API Endpoints

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create new category
- `PUT /api/categories/[id]` - Update category
- `DELETE /api/categories/[id]` - Delete category

### Weekly Logs
- `GET /api/weekly-logs?weeks=2024-W01,2024-W02` - Get logs for specific weeks
- `POST /api/weekly-logs` - Create/update weekly log

### Performance Targets
- `GET /api/targets` - List all targets
- `POST /api/targets` - Create new target
- `PUT /api/targets/[id]` - Update target
- `DELETE /api/targets/[id]` - Delete target

### Role Weights
- `GET /api/role-weights` - List all role weights
- `POST /api/role-weights` - Create new role weights
- `PUT /api/role-weights/[id]` - Update role weights
- `DELETE /api/role-weights/[id]` - Delete role weights
- `POST /api/role-weights/init` - Initialize default role weights

## Database Schema

The application uses four main models:

- **Category**: Work categories with names, dimensions (IOOI), and point values
- **WeeklyLog**: Weekly activity counts with optional score overrides for each category
- **PerformanceTarget**: Configurable performance thresholds for different levels
- **RoleWeights**: Dimension weights configuration for different roles (Engineer, Manager, Senior Manager, Director)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Prisma Studio (database GUI)

## Makefile Commands

This project includes a comprehensive Makefile for easy development and deployment:

### Quick Commands
```bash
make help          # Show all available commands
make setup         # Complete setup (install + db + dev)
make quick-start   # Quick start with Docker
make status        # Show application status
```

### Development
```bash
make install       # Install dependencies
make dev           # Start development server
make build         # Build for production
make start         # Start production server
make lint          # Run linter
make clean         # Clean build artifacts
```

### Docker Operations
```bash
make check-docker    # Check Docker setup
make docker-build    # Build Docker image  
make docker-deploy   # Deploy with Docker Compose
make docker-dev      # Start development with Docker
make docker-stop     # Stop containers
make docker-logs     # View container logs
make docker-clean    # Clean Docker resources
make docker-restart  # Restart containers
```

### Database Management
```bash
make db-push       # Push schema changes
make db-studio     # Open Prisma Studio
make db-generate   # Generate Prisma client
make db-reset      # Reset database (WARNING: deletes data)
```

### Data Backup & Restore
```bash
make backup-data         # Backup local database
make backup-docker-data  # Backup Docker volume
make restore-data BACKUP_FILE=filename  # Restore from backup
```

### Monitoring & Health
```bash
make health-check  # Check application health
make watch-logs    # Watch logs in real-time
make debug-db      # Show database contents
make version       # Show tool versions
```

### Utility Commands
```bash
make export-image    # Export Docker image for sharing
make share-setup     # Create setup package for colleagues
make update-deps     # Update all dependencies
make reset-all       # Reset everything (DANGEROUS)
```

### Data Migration & Backup Utility

For advanced backup and restore operations, use the dedicated script:

```bash
# Backup operations
./scripts/backup-restore.sh backup-local     # Backup local database
./scripts/backup-restore.sh backup-docker    # Backup Docker volume
./scripts/backup-restore.sh list-backups     # List all backups

# Restore operations  
./scripts/backup-restore.sh restore-local --file backup-local-20241211_143000.db
./scripts/backup-restore.sh restore-docker --file backups/perf-mirror-docker-20241211_143000.tar.gz

# Data migration
./scripts/backup-restore.sh migrate-data     # Interactive migration tool
```

## Customization

### Adding New Categories

Categories can represent any measurable work activity:
- Code commits
- Pull requests reviewed
- Meetings attended
- Documentation written
- Bugs resolved

### Adjusting Point Values

Point values should reflect the relative importance and effort of activities:
- Simple tasks: 1-5 points
- Medium complexity: 6-15 points
- High-impact work: 16+ points

### Setting Targets

Consider your role and expectations when setting targets:
- **Individual Contributors**: Focus on coding and technical activities
- **Tech Leads**: Balance coding with mentoring and reviews
- **Engineering Managers**: Emphasize people management and strategic work

## Tips for Success

1. **Be Consistent**: Log your activities regularly for accurate tracking
2. **Set Realistic Targets**: Base thresholds on historical performance
3. **Review Regularly**: Check your dashboard weekly to stay on track
4. **Adjust as Needed**: Update categories and targets as your role evolves
5. **Use Insights**: Pay attention to the personalized recommendations

## Contributing

This application is designed to be easily customizable for different teams and organizations. Feel free to modify the categories, scoring system, and targets to match your specific needs.

## License

MIT License - feel free to use and modify for your team's needs. 