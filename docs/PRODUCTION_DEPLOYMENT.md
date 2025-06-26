# Production Deployment Checklist

This document provides a checklist for deploying PerfMirror v3.0.0 to production, ensuring all database schema updates and Turso client compatibility.

## Pre-Deployment Checklist

### 1. Environment Variables
Ensure these environment variables are set in production:

```bash
# Database Configuration
TURSO_DATABASE_URL=libsql://your-database-url
TURSO_AUTH_TOKEN=your-auth-token

# Application Configuration
NODE_ENV=production
```

### 2. Database Schema Updates
The application has been updated with significant schema changes. Run the schema update script:

```bash
# Update production database schema
make db-update-production

# Or run directly:
node scripts/ensure-production-schema.js
```

This script will:
- ✅ Add `reference` field to WeeklyLog table
- ✅ Migrate PerformanceTarget from 3-band to 5-band system
- ✅ Add `role` and `level` fields to PerformanceTarget
- ✅ Add `role` and `level` fields to RoleWeights
- ✅ Create CategoryTemplate table
- ✅ Create LevelExpectation table
- ✅ Create UserProfile table

### 3. Seed Data
After schema updates, populate the database with seed data:

```bash
# Seed role-level data and category templates
node scripts/seed-role-level-data.js
```

## Post-Deployment Verification

### 1. API Endpoints Testing

Test all critical API endpoints:

```bash
# Test category templates (suggested categories)
curl "https://your-domain.com/api/category-templates?role=IC&level=1"

# Test weekly logs with reference field
curl "https://your-domain.com/api/weekly-logs?weeks=2025-W26"

# Test performance targets with 5-band system
curl "https://your-domain.com/api/targets"

# Test role weights with role/level fields
curl "https://your-domain.com/api/role-weights"

# Test level expectations
curl "https://your-domain.com/api/level-expectations"

# Test user profile
curl "https://your-domain.com/api/user-profile"
```

### 2. Expected API Response Structure

#### Category Templates
```json
[
  {
    "id": "...",
    "role": "IC",
    "level": 1,
    "categoryName": "Code Reviews",
    "dimension": "input",
    "scorePerOccurrence": 3,
    "expectedWeeklyCount": 5,
    "description": "Learning from code review feedback"
  }
]
```

#### Weekly Logs
```json
[
  {
    "id": "...",
    "categoryId": "...",
    "week": "2025-W26",
    "count": 5,
    "overrideScore": null,
    "reference": "https://github.com/org/repo/pull/123",
    "category": { ... }
  }
]
```

#### Performance Targets (5-Band System)
```json
[
  {
    "id": "...",
    "name": "IC L3 Target",
    "role": "IC",
    "level": 3,
    "outstandingThreshold": 280,
    "strongThreshold": 220,
    "meetingThreshold": 170,
    "partialThreshold": 140,
    "underperformingThreshold": 120,
    "timePeriodWeeks": 12,
    "isActive": true
  }
]
```

#### Role Weights
```json
[
  {
    "id": "...",
    "name": "IC L3 Weights",
    "role": "IC",
    "level": 3,
    "inputWeight": 0.25,
    "outputWeight": 0.35,
    "outcomeWeight": 0.25,
    "impactWeight": 0.15,
    "isActive": true
  }
]
```

### 3. Feature Testing

#### Suggested Categories
1. Navigate to Role Setup page
2. Select a role (IC, Manager, Senior Manager, Director)
3. Select a level (1-8 for IC, 4-8 for Manager, etc.)
4. Verify that suggested categories appear
5. Verify categories are appropriate for the role/level

#### Reference Field in Work Logs
1. Navigate to Weekly Log page
2. Enter work activities
3. Add reference URLs/ticket numbers in reference fields
4. Save and verify references are preserved

#### Enhanced Smart Insights
1. Navigate to Dashboard
2. Verify "Smart Insights & Growth Suggestions" section appears
3. Check that insights are role-level specific
4. Verify growth suggestions are relevant

#### 5-Band Performance System
1. Navigate to Performance Targets page
2. Verify 5 performance bands are displayed:
   - Outstanding
   - Strong Performance
   - Meeting Expectations
   - Partially Meeting Expectations
   - Underperforming

## Troubleshooting

### Common Issues

#### 1. "Column does not exist" errors
**Symptom**: API returns 500 errors with column-related messages
**Solution**: Run the schema update script:
```bash
node scripts/ensure-production-schema.js
```

#### 2. Empty suggested categories
**Symptom**: Role setup shows no suggested categories
**Solution**: Run the seeding script:
```bash
node scripts/seed-role-level-data.js
```

#### 3. Missing Smart Insights
**Symptom**: Dashboard doesn't show insights section
**Solution**: Ensure user profile and level expectations are set up:
```bash
# Check if user profile exists
curl "https://your-domain.com/api/user-profile"

# Check if level expectations exist
curl "https://your-domain.com/api/level-expectations"
```

### Database Connection Issues

If you encounter Turso connection issues:

1. Verify environment variables are set correctly
2. Check Turso database URL format: `libsql://your-database.turso.io`
3. Ensure auth token has proper permissions
4. Test connection manually:
```bash
curl -X POST "https://your-database.turso.io/v2/pipeline" \
  -H "Authorization: Bearer $TURSO_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"requests":[{"type":"execute","stmt":{"sql":"SELECT 1"}}]}'
```

## Performance Considerations

### 1. Database Queries
The updated Turso client includes optimized queries:
- Category templates are filtered by role/level
- Weekly logs include category data in single query
- Performance targets ordered by role/level

### 2. Caching
Consider implementing caching for:
- Category templates (rarely change)
- Level expectations (static data)
- Performance targets (change infrequently)

### 3. Monitoring
Monitor these metrics:
- API response times for category templates
- Database query performance for weekly logs
- Smart insights calculation time

## Rollback Plan

If issues occur during deployment:

1. **Database Issues**: The schema update script is idempotent and safe
2. **Application Issues**: Previous version can be deployed (schema is backward compatible)
3. **Data Issues**: Database backups should be restored from pre-deployment state

## Version Compatibility

- **v2.x to v3.0.0**: Requires schema migration (handled by update script)
- **v3.0.0+**: Schema is forward compatible
- **Downgrade**: v3.0.0 to v2.x requires manual schema rollback (not recommended)

## Support

For deployment issues:
1. Check application logs for specific error messages
2. Verify database schema using the troubleshooting queries above
3. Test individual API endpoints to isolate issues
4. Review Turso client logs for database connectivity problems 