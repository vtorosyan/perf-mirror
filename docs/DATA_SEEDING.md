# Data Seeding Guide

## Overview

PerfMirror includes comprehensive data seeding scripts to populate your database with default category templates, level expectations, and role weights. This guide covers all available seeding options for both local development and production deployment.

## Available Seeding Scripts

### 1. Local Development Seeding (`seed-local-development.js`)

**Purpose**: Seeds basic data for local development with SQLite database.

**Usage**:
```bash
# Automatic during setup
make setup

# Manual seeding
npm run db:seed

# Or directly
node scripts/seed-local-development.js
```

**What it seeds**:
- 13 level expectations (IC levels 1-8, Manager levels 4-8)
- 12 category templates (IC levels 1-2 for starter set)
- 2 default role weights (IC General, Manager General)

### 2. Role-Level Data Seeding (`seed-role-level-data.js`)

**Purpose**: Seeds basic level expectations and category templates for production using hybrid client.

**Usage**:
```bash
# Local development (if hybrid client works)
node scripts/seed-role-level-data.js

# Production
TURSO_DATABASE_URL="your-url" TURSO_AUTH_TOKEN="your-token" node scripts/seed-role-level-data.js
```

**What it seeds**:
- 13 level expectations (IC levels 1-8, Manager levels 4-8)
- 12 category templates (IC levels 1-2 only)

### 3. Comprehensive Category Template Seeding (`seed-comprehensive-category-templates.js`)

**Purpose**: Seeds complete category templates for all role/level combinations.

**Usage**:
```bash
# Production seeding
TURSO_DATABASE_URL="your-url" TURSO_AUTH_TOKEN="your-token" node scripts/seed-comprehensive-category-templates.js

# Using Make
make seed-category-templates TURSO_DATABASE_URL="your-url" TURSO_AUTH_TOKEN="your-token"
```

**What it seeds**:
- **IC Levels 1-8**: 6 templates each = 48 templates
- **Manager Levels 4-8**: 6 templates each = 30 templates
- **Total**: 78 category templates

## Category Template Coverage

### IC (Individual Contributor) Levels

#### Level 1-2 (Entry Level)
- Code Reviews (input)
- Learning Activities (input)
- Feature Development (output)
- Bug Fixes (output)
- Project Completion (outcome)
- Team Participation (impact)

#### Level 3-4 (Mid-Level)
- Technical Research (input)
- Mentoring (input)
- Complex Features (output)
- Technical Leadership (output)
- Cross-team Collaboration (outcome)
- Process Improvement (impact)

#### Level 5-6 (Senior Level)
- System Architecture (input)
- Technical Strategy (input)
- Platform Development (output)
- Technical Mentorship (output)
- Initiative Leadership (outcome)
- Engineering Excellence (impact)

#### Level 7-8 (Staff/Principal)
- Technology Leadership (input)
- Industry Research (input)
- Innovation Leadership (output)
- Technical Standards (output)
- Industry Leadership (outcome)
- Technical Culture (impact)

### Manager Levels

#### Level 4-5 (Team Manager)
- Team Management (input)
- Strategic Planning (input)
- Team Delivery (output)
- Performance Management (output)
- Stakeholder Management (outcome)
- Team Culture (impact)

#### Level 6-8 (Senior Leadership)
- Organizational Strategy (input)
- Executive Leadership (input)
- Transformation Leadership (output)
- Leadership Development (output)
- Strategic Impact (outcome)
- Cultural Leadership (impact)

## Template Structure

Each category template includes:

```typescript
interface CategoryTemplate {
  id: string
  role: 'IC' | 'Manager' | 'Senior Manager' | 'Director'
  level: number
  categoryName: string
  dimension: 'input' | 'output' | 'outcome' | 'impact'
  scorePerOccurrence: number
  expectedWeeklyCount: number
  description: string
  createdAt: string
  updatedAt: string
}
```

### Example Templates

**IC Level 4 - Architecture Design**:
```json
{
  "role": "IC",
  "level": 4,
  "categoryName": "Architecture Design",
  "dimension": "input",
  "scorePerOccurrence": 12,
  "expectedWeeklyCount": 2,
  "description": "Contributing to system architecture decisions"
}
```

**Manager Level 5 - Strategic Planning**:
```json
{
  "role": "Manager",
  "level": 5,
  "categoryName": "Strategic Planning",
  "dimension": "input",
  "scorePerOccurrence": 25,
  "expectedWeeklyCount": 2,
  "description": "Developing team and project strategy"
}
```

## Production Seeding Workflow

### Step 1: Get Turso Credentials
1. Log into your Turso dashboard
2. Copy your database URL (format: `libsql://database-name.turso.io`)
3. Generate an auth token

### Step 2: Run Seeding Scripts
```bash
# Set environment variables
export TURSO_DATABASE_URL="libsql://your-database.turso.io"
export TURSO_AUTH_TOKEN="your-auth-token"

# Seed basic data (if not already done)
node scripts/seed-role-level-data.js

# Seed comprehensive category templates
node scripts/seed-comprehensive-category-templates.js
```

### Step 3: Verify Seeding
Check the results via API:
```bash
# Check category template coverage
curl "https://your-app.vercel.app/api/category-templates" | jq 'group_by(.role, .level) | map({role: .[0].role, level: .[0].level, count: length})'

# Check level expectations
curl "https://your-app.vercel.app/api/level-expectations" | jq 'length'
```

## Local Development Seeding

For local development, the database is **automatically seeded** when you run:

```bash
# Complete setup with automatic seeding
make setup

# Manual database setup + seeding
npm install
npm run db:push
npm run db:seed
```

**What gets seeded locally:**
- **13 Level Expectations**: All role/level combinations (IC 1-8, Manager 4-8)
- **12 Category Templates**: Starter set for IC levels 1-2
- **2 Role Weights**: Default weights for IC and Manager roles

**Local Seeding Features:**
- ✅ **Automatic**: Runs during `make setup`
- ✅ **Idempotent**: Safe to run multiple times
- ✅ **SQLite Compatible**: Works with local development database
- ✅ **Fast**: Completes in seconds
- ✅ **Minimal**: Includes essential starter data without overwhelming new users

## Troubleshooting

### Common Issues

**1. Missing Environment Variables**
```
❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN environment variables
```
**Solution**: Set both environment variables before running the script.

**2. Network Connection Issues**
```
❌ Request failed: getaddrinfo ENOTFOUND
```
**Solution**: Check your internet connection and Turso URL format.

**3. Authentication Errors**
```
❌ SQL execution failed (401): Unauthorized
```
**Solution**: Verify your auth token is valid and has write permissions.

### Verification Commands

```bash
# Count total templates by role/level
curl -s "https://your-app.vercel.app/api/category-templates" | jq 'group_by(.role, .level) | length'

# Check specific role/level templates
curl -s "https://your-app.vercel.app/api/category-templates?role=IC&level=4" | jq 'length'

# Verify level expectations
curl -s "https://your-app.vercel.app/api/level-expectations?role=IC&level=1" | jq '.expectations'
```

## Best Practices

1. **Always backup** your database before running seeding scripts in production
2. **Test seeding** in a development environment first
3. **Verify results** using the API endpoints after seeding
4. **Run scripts incrementally** - basic seeding first, then comprehensive
5. **Monitor logs** during seeding for any errors or warnings

## Script Maintenance

The seeding scripts are designed to be:
- **Idempotent**: Safe to run multiple times
- **Incremental**: Only adds missing data
- **Logged**: Provides detailed output of operations
- **Error-resistant**: Continues processing even if individual items fail

For updates to templates or expectations, modify the data arrays in the respective scripts and re-run them. 