# Docker Deployment Guide

This guide covers containerization and deployment options for PerfMirror using Docker and Docker Compose.

## Overview

PerfMirror supports multiple Docker deployment strategies:

- **Development**: Hot reload with volume mounting
- **Production**: Optimized multi-stage builds
- **Hybrid**: Local development with production database

## Quick Start

### Using Make Commands (Recommended)

```bash
# Build Docker image
make docker-build

# Run container
make docker-run

# Deploy with Docker Compose
make docker-deploy

# View logs
make docker-logs

# Stop and clean up
make docker-clean
```

### Manual Docker Commands

```bash
# Build production image
docker build -t perf-mirror:latest .

# Run container
docker run -p 3000:3000 perf-mirror:latest

# Deploy with compose
docker-compose up --build
```

## Docker Configurations

### Production Dockerfile

The main `Dockerfile` uses a multi-stage build for optimal production deployment:

```dockerfile
# Stage 1: Dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh
USER nextjs
EXPOSE 3000
ENV PORT 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
```

### Development Dockerfile

The `Dockerfile.dev` is optimized for development with hot reload:

```dockerfile
FROM node:18-alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY . .
EXPOSE 3000 5555
ENV NODE_ENV=development
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN chown -R nextjs:nodejs /app
USER nextjs
CMD ["npm", "run", "dev"]
```

## Docker Compose Configurations

### Production Deployment

`docker-compose.yml` for production deployment:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: runner
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - TURSO_DATABASE_URL=${TURSO_DATABASE_URL}
      - TURSO_AUTH_TOKEN=${TURSO_AUTH_TOKEN}
    env_file:
      - .env
    volumes:
      - ./dev.db:/app/dev.db
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/debug"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Development Deployment

`docker-compose.dev.yml` for development with hot reload:

```yaml
version: '3.8'

services:
  dev:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
      - "5555:5555"  # Prisma Studio
    environment:
      - NODE_ENV=development
      - DATABASE_URL=file:./dev.db
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    restart: unless-stopped
```

## Environment Configuration

### Environment Variables

Create a `.env` file for Docker deployment:

```bash
# Database Configuration
DATABASE_URL="file:./dev.db"

# Turso Configuration (Production)
TURSO_DATABASE_URL="libsql://your-database.turso.io"
TURSO_AUTH_TOKEN="your-auth-token"

# Next.js Configuration
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Docker Configuration
NODE_ENV="production"
PORT="3000"
```

### Docker Environment Variables

Additional variables for Docker containers:

```bash
# Container Configuration
DOCKER_BUILDKIT=1
COMPOSE_DOCKER_CLI_BUILD=1

# Health Check Configuration
HEALTHCHECK_INTERVAL=30s
HEALTHCHECK_TIMEOUT=10s
HEALTHCHECK_RETRIES=3
```

## Deployment Strategies

### 1. Local Development

For local development with hot reload:

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Or using Make
make docker-dev
```

**Features**:
- Hot reload for code changes
- Volume mounting for live updates
- Prisma Studio access on port 5555
- SQLite database persistence

### 2. Production Deployment

For production deployment:

```bash
# Build and deploy
docker-compose up --build -d

# Or using Make
make docker-deploy
```

**Features**:
- Optimized multi-stage build
- Health checks
- Automatic restarts
- Environment-based configuration

### 3. Hybrid Development

For testing production features locally:

```bash
# Build production image
make docker-build

# Run with production database
docker run -p 3000:3000 \
  -e TURSO_DATABASE_URL="your-turso-url" \
  -e TURSO_AUTH_TOKEN="your-token" \
  perf-mirror:latest
```

## Database Configuration

### SQLite (Development)

For local development with SQLite:

```yaml
services:
  app:
    volumes:
      - ./dev.db:/app/dev.db
    environment:
      - DATABASE_URL=file:./dev.db
```

### Turso (Production)

For production with Turso cloud database:

```yaml
services:
  app:
    environment:
      - TURSO_DATABASE_URL=${TURSO_DATABASE_URL}
      - TURSO_AUTH_TOKEN=${TURSO_AUTH_TOKEN}
      - DATABASE_URL=${TURSO_DATABASE_URL}
```

### Hybrid Configuration

The application automatically detects the environment and switches between databases:

```typescript
// lib/prisma.ts
const isDevelopment = process.env.NODE_ENV === 'development'
const isVercel = process.env.VERCEL === '1'

if (isDevelopment && !isVercel) {
  // Use SQLite for local development
  client = new PrismaClient()
} else {
  // Use Turso for production
  client = createTursoClient()
}
```

## Health Checks

### Application Health Check

The Docker configuration includes health checks:

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/debug || exit 1
```

### Custom Health Check Endpoint

The application provides a debug endpoint for health monitoring:

```typescript
// app/api/debug/route.ts
export async function GET() {
  try {
    // Test database connectivity
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error.message
    }, { status: 500 })
  }
}
```

## Performance Optimization

### Multi-Stage Builds

The production Dockerfile uses multi-stage builds to minimize image size:

1. **deps**: Install only production dependencies
2. **builder**: Build the application
3. **runner**: Create minimal runtime image

### Image Size Optimization

- Use Alpine Linux base images
- Remove development dependencies
- Optimize layer caching
- Use `.dockerignore` to exclude unnecessary files

### Runtime Optimization

- Run as non-root user
- Use proper signal handling
- Implement graceful shutdowns
- Configure resource limits

## Monitoring and Logging

### Container Logs

View application logs:

```bash
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f app

# Using Make
make docker-logs
```

### Log Configuration

Configure logging in `docker-compose.yml`:

```yaml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Monitoring

Add monitoring services to your compose file:

```yaml
services:
  app:
    # ... app configuration
  
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
  
  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

## Cloud Deployment

### AWS ECS

Deploy to AWS ECS:

```bash
# Build and tag image
docker build -t perf-mirror:latest .
docker tag perf-mirror:latest your-account.dkr.ecr.region.amazonaws.com/perf-mirror:latest

# Push to ECR
aws ecr get-login-password --region region | docker login --username AWS --password-stdin your-account.dkr.ecr.region.amazonaws.com
docker push your-account.dkr.ecr.region.amazonaws.com/perf-mirror:latest
```

### Google Cloud Run

Deploy to Google Cloud Run:

```bash
# Build and push to Google Container Registry
docker build -t gcr.io/your-project/perf-mirror:latest .
docker push gcr.io/your-project/perf-mirror:latest

# Deploy to Cloud Run
gcloud run deploy perf-mirror \
  --image gcr.io/your-project/perf-mirror:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Azure Container Instances

Deploy to Azure:

```bash
# Build and push to Azure Container Registry
docker build -t your-registry.azurecr.io/perf-mirror:latest .
docker push your-registry.azurecr.io/perf-mirror:latest

# Deploy to Container Instances
az container create \
  --resource-group myResourceGroup \
  --name perf-mirror \
  --image your-registry.azurecr.io/perf-mirror:latest \
  --ports 3000
```

## Troubleshooting

### Common Issues

1. **Build Failures**:
   ```bash
   # Clean Docker cache
   docker builder prune -a
   
   # Rebuild without cache
   docker build --no-cache -t perf-mirror:latest .
   ```

2. **Database Connection Issues**:
   ```bash
   # Check environment variables
   docker run --rm perf-mirror:latest env | grep DATABASE
   
   # Test database connectivity
   docker run --rm perf-mirror:latest wget -qO- http://localhost:3000/api/debug
   ```

3. **Permission Issues**:
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   
   # Check container user
   docker run --rm perf-mirror:latest id
   ```

4. **Port Conflicts**:
   ```bash
   # Check port usage
   lsof -i :3000
   
   # Use different port
   docker run -p 3001:3000 perf-mirror:latest
   ```

### Debug Mode

Run container in debug mode:

```bash
# Interactive shell
docker run -it --entrypoint /bin/sh perf-mirror:latest

# Debug with logs
docker run --rm -e DEBUG=* perf-mirror:latest
```

### Performance Issues

Monitor container performance:

```bash
# Container stats
docker stats

# Resource usage
docker run --rm perf-mirror:latest top

# Memory usage
docker run --rm perf-mirror:latest free -h
```

## Security Considerations

### Container Security

- Run as non-root user
- Use minimal base images
- Scan images for vulnerabilities
- Keep dependencies updated

### Network Security

- Use internal networks for multi-container setups
- Implement proper firewall rules
- Use HTTPS in production
- Secure environment variables

### Data Security

- Encrypt data at rest
- Use secure database connections
- Implement proper backup strategies
- Monitor access logs

## Best Practices

### Development

- Use volume mounts for development
- Implement hot reload
- Use development-specific configurations
- Include debugging tools

### Production

- Use multi-stage builds
- Implement health checks
- Configure proper logging
- Use orchestration tools

### Maintenance

- Regular security updates
- Monitor resource usage
- Implement backup strategies
- Document deployment procedures

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [Prisma Docker Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker) 