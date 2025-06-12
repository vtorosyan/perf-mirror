# Development Guide

This guide covers local development setup, workflows, and best practices for contributing to PerfMirror.

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+ (comes with Node.js)
- **Docker** (optional, for containerized development)
- **Make** (optional, for simplified commands)

## Quick Setup

### Option 1: Using Make (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/perf-mirror.git
cd perf-mirror

# Complete setup
make setup

# Start development
make dev
```

### Option 2: Manual Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Initialize database
npm run db:push

# Start development server
npm run dev
```

### Option 3: Docker Development

```bash
# Development with hot reload
docker-compose -f docker-compose.dev.yml up

# Or build and run production container
make docker-build
make docker-run
```

## Environment Configuration

### Required Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Database Configuration
DATABASE_URL="file:./dev.db"

# Turso Configuration (for production testing)
TURSO_DATABASE_URL="libsql://your-database.turso.io"
TURSO_AUTH_TOKEN="your-auth-token"

# Next.js Configuration
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### Environment Detection

The application automatically detects the environment:

- **Development**: Uses SQLite with Prisma
- **Production**: Uses Turso with hybrid client
- **Docker**: Configurable via environment variables

## Development Workflow

### 1. Database Changes

```bash
# Modify schema in prisma/schema.prisma
# Then push changes
make db-push

# Or manually
npx prisma db push

# View data in Prisma Studio
make db-studio
```

### 2. Code Changes

The development server supports hot reload for:
- React components
- API routes
- CSS changes
- TypeScript files

### 3. Testing Changes

```bash
# Run tests
make test

# Run linter
make lint

# Format code
make format
```

## Project Structure

```
perf-mirror/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   │   ├── categories/    # Category management
│   │   ├── weekly-logs/   # Activity logging
│   │   ├── targets/       # Performance targets
│   │   └── role-weights/  # Role weight management
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Main application
├── components/            # React components
│   ├── Dashboard.tsx      # Performance dashboard
│   ├── WeeklyLog.tsx     # Activity logging
│   ├── Categories.tsx     # Category management
│   ├── PerformanceTargets.tsx
│   ├── RoleWeights.tsx
│   └── Readme.tsx
├── lib/                   # Utility libraries
│   ├── prisma.ts         # Database client
│   ├── turso-client.ts   # Turso HTTP client
│   └── utils.ts          # Helper functions
├── prisma/               # Database schema
│   ├── schema.prisma     # Prisma schema
│   └── migrations/       # Database migrations
├── docs/                 # Documentation
├── docker-compose.yml    # Docker configuration
├── Dockerfile           # Production container
├── Dockerfile.dev       # Development container
├── Makefile            # Development commands
└── package.json        # Dependencies
```

## Key Components

### Database Layer

- **Prisma ORM**: Type-safe database access
- **SQLite**: Local development database
- **Turso**: Production cloud database
- **Hybrid Client**: Automatic switching between databases

### API Layer

- **Next.js API Routes**: RESTful endpoints
- **Data Transformation**: Handles Turso's wrapped data format
- **Error Handling**: Consistent error responses
- **Validation**: Input validation and sanitization

### Frontend Layer

- **React Components**: Modular UI components
- **TypeScript**: Type safety throughout
- **Tailwind CSS**: Utility-first styling
- **Recharts**: Interactive data visualization

## Development Commands

### Make Commands

```bash
# Development
make setup          # Complete project setup
make dev           # Start development server
make build         # Build for production
make start         # Start production server
make clean         # Clean build artifacts

# Database
make db-push       # Push schema changes
make db-studio     # Open Prisma Studio
make db-reset      # Reset database
make db-seed       # Seed with sample data

# Docker
make docker-build  # Build Docker image
make docker-run    # Run container
make docker-deploy # Deploy with compose
make docker-clean  # Clean Docker artifacts

# Testing & Quality
make test          # Run tests
make test-watch    # Run tests in watch mode
make lint          # Run ESLint
make lint-fix      # Fix linting issues
make format        # Format with Prettier
make type-check    # TypeScript type checking

# Utilities
make help          # Show all commands
make logs          # View application logs
make clean-all     # Clean everything
```

### NPM Scripts

```bash
# Development
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server

# Database
npm run db:push    # Push schema changes
npm run db:studio  # Open Prisma Studio
npm run db:reset   # Reset database

# Quality
npm run lint       # Run ESLint
npm run type-check # TypeScript checking
```

## Debugging

### Local Development

1. **Database Issues**:
   ```bash
   # Reset database
   make db-reset
   
   # Check schema
   make db-studio
   ```

2. **API Issues**:
   - Check browser Network tab
   - View server logs in terminal
   - Use API debugging endpoint: `/api/debug`

3. **Build Issues**:
   ```bash
   # Clean and rebuild
   make clean
   make build
   ```

### Production Issues

1. **Vercel Deployment**:
   - Check Vercel dashboard logs
   - Verify environment variables
   - Test API endpoints directly

2. **Database Connectivity**:
   - Verify Turso credentials
   - Check network connectivity
   - Test with debug endpoint

## Testing

### Running Tests

```bash
# Run all tests
make test

# Run specific test file
npm test -- components/Dashboard.test.tsx

# Run tests in watch mode
make test-watch
```

### Writing Tests

Create test files alongside components:

```typescript
// components/__tests__/Dashboard.test.tsx
import { render, screen } from '@testing-library/react'
import Dashboard from '../Dashboard'

describe('Dashboard', () => {
  it('renders performance metrics', () => {
    render(<Dashboard />)
    expect(screen.getByText('Performance Level')).toBeInTheDocument()
  })
})
```

## Code Style

### TypeScript

- Use strict TypeScript configuration
- Define interfaces for all data structures
- Avoid `any` types
- Use proper error handling

### React

- Use functional components with hooks
- Implement proper error boundaries
- Follow React best practices
- Use TypeScript for props

### CSS

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Maintain consistent spacing and colors
- Use semantic class names when needed

## Performance Optimization

### Frontend

- Use React.memo for expensive components
- Implement proper loading states
- Optimize bundle size with dynamic imports
- Use proper image optimization

### Backend

- Implement database query optimization
- Use proper caching strategies
- Minimize API response sizes
- Handle errors gracefully

### Database

- Use proper indexing
- Optimize query patterns
- Implement connection pooling
- Monitor query performance

## Deployment

### Local Testing

```bash
# Build and test production build
make build
make start

# Test with Docker
make docker-build
make docker-run
```

### Vercel Deployment

1. **Automatic Deployment**:
   - Push to main branch
   - Vercel automatically deploys

2. **Manual Deployment**:
   ```bash
   # Using Vercel CLI
   npx vercel --prod
   ```

### Docker Deployment

```bash
# Build production image
make docker-build

# Deploy with compose
make docker-deploy

# Or deploy to cloud provider
docker tag perf-mirror:latest your-registry/perf-mirror:latest
docker push your-registry/perf-mirror:latest
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**:
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **Database Lock**:
   ```bash
   # Reset database
   make db-reset
   ```

3. **Node Modules Issues**:
   ```bash
   # Clean install
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Docker Issues**:
   ```bash
   # Clean Docker
   make docker-clean
   docker system prune -a
   ```

### Getting Help

- Check the [Troubleshooting Guide](TROUBLESHOOTING.md)
- Review [GitHub Issues](https://github.com/yourusername/perf-mirror/issues)
- Join the [Discussions](https://github.com/yourusername/perf-mirror/discussions)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run quality checks
6. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines. 