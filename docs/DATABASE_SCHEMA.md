# Database Schema

## Overview

PerfMirror uses a SQLite database (local development) or Turso cloud database (production) with Prisma as the ORM. The schema is designed around four core entities that support the IOOI performance tracking framework.

## Entity Relationship Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Category     │    │   WeeklyLog     │    │ PerformanceTarget│
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │◄───┤ categoryId (FK) │    │ id (PK)         │
│ name            │    │ week            │    │ name            │
│ scorePerOccurrence│  │ count           │    │ role            │
│ dimension       │    │ overrideScore   │    │ level           │
│ description     │    │ createdAt       │    │ outstandingThreshold│
│ createdAt       │    └─────────────────┘    │ strongThreshold │
│ updatedAt       │                           │ meetingThreshold│
└─────────────────┘                           │ partialThreshold│
                                              │ underperformingThreshold│
                                              │ timePeriodWeeks │
                                              │ isActive        │
                                              │ createdAt       │
                                              │ updatedAt       │
                                              └─────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   RoleWeights   │    │ LevelExpectation│    │ CategoryTemplate│
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ name            │    │ role            │    │ role            │
│ role            │    │ level           │    │ level           │
│ level           │    │ expectations    │    │ categoryName    │
│ inputWeight     │    │ createdAt       │    │ dimension       │
│ outputWeight    │    │ updatedAt       │    │ scorePerOccurrence│
│ outcomeWeight   │    └─────────────────┘    │ expectedWeeklyCount│
│ impactWeight    │                           │ description     │
│ isActive        │                           │ createdAt       │
│ createdAt       │                           │ updatedAt       │
│ updatedAt       │                           └─────────────────┘
└─────────────────┘
```

## Core Tables

### Category

Defines work categories with IOOI dimensions and point values.

```sql
CREATE TABLE Category (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    scorePerOccurrence INTEGER NOT NULL,
    dimension       TEXT NOT NULL CHECK (dimension IN ('input', 'output', 'outcome', 'impact')),
    description     TEXT,
    createdAt       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id`: Unique identifier (CUID)
- `name`: Category name (e.g., "Code Reviews", "Feature Development")
- `scorePerOccurrence`: Base points awarded per occurrence
- `dimension`: IOOI classification (input, output, outcome, impact)
- `description`: Optional detailed description
- `createdAt`: Record creation timestamp
- `updatedAt`: Last modification timestamp

**Business Rules:**
- `name` must be unique per dimension
- `scorePerOccurrence` must be positive
- `dimension` enforces IOOI framework compliance

**Example Data:**
```sql
INSERT INTO Category VALUES 
('clh7x2f9k0000u3h4tq5l8m9n', 'Code Reviews', 5, 'input', 'Reviewing others code', '2024-06-12 10:30:00', '2024-06-12 10:30:00'),
('clh7x3g8m0001u3h4vq2m9o7p', 'Feature Development', 10, 'output', 'Building new functionality', '2024-06-12 10:35:00', '2024-06-12 10:35:00'),
('clh7x4h7l0002u3h4wr3n8p6q', 'Design Documents', 25, 'outcome', 'Technical specifications', '2024-06-12 10:40:00', '2024-06-12 10:40:00'),
('clh7x5i8n0003u3h4xs4o9q7r', 'Mentoring Sessions', 12, 'impact', 'Developing junior engineers', '2024-06-12 10:45:00', '2024-06-12 10:45:00');
```

### WeeklyLog

Tracks weekly activity counts and overridden scores.

```sql
CREATE TABLE WeeklyLog (
    id              TEXT PRIMARY KEY,
    categoryId      TEXT NOT NULL REFERENCES Category(id) ON DELETE CASCADE,
    week            TEXT NOT NULL, -- ISO week format: YYYY-WNN
    count           INTEGER NOT NULL DEFAULT 0,
    overrideScore   INTEGER NULL,
    createdAt       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX WeeklyLog_categoryId_week_key ON WeeklyLog(categoryId, week);
```

**Fields:**
- `id`: Unique identifier (CUID)
- `categoryId`: Foreign key to Category
- `week`: ISO 8601 week string (e.g., "2024-W20")
- `count`: Number of occurrences in the week
- `overrideScore`: Manual score override (null = use calculated score)
- `createdAt`: Record creation timestamp

**Business Rules:**
- Unique constraint on (categoryId, week) prevents duplicate entries
- `count` of 0 effectively removes the log entry
- `overrideScore` takes precedence over calculated score when present
- Cascade delete when category is removed

**Score Calculation:**
```typescript
const effectiveScore = overrideScore ?? (count * category.scorePerOccurrence)
```

**Example Data:**
```sql
INSERT INTO WeeklyLog VALUES 
('clh7x6j1p0004u3h4yt5p0r8s', 'clh7x2f9k0000u3h4tq5l8m9n', '2024-W20', 8, NULL, '2024-06-12 10:50:00'),
('clh7x7k2q0005u3h4zu6q1s9t', 'clh7x3g8m0001u3h4vq2m9o7p', '2024-W20', 3, 35, '2024-06-12 10:55:00');
```

### PerformanceTarget

Defines role-level performance thresholds with 5-band evaluation system and evaluation periods.

```sql
CREATE TABLE PerformanceTarget (
    id                          TEXT PRIMARY KEY,
    name                        TEXT NOT NULL,
    role                        TEXT,
    level                       INTEGER,
    outstandingThreshold        INTEGER NOT NULL DEFAULT 300,
    strongThreshold            INTEGER NOT NULL DEFAULT 230,
    meetingThreshold           INTEGER NOT NULL DEFAULT 170,
    partialThreshold           INTEGER NOT NULL DEFAULT 140,
    underperformingThreshold   INTEGER NOT NULL DEFAULT 120,
    timePeriodWeeks            INTEGER NOT NULL DEFAULT 12,
    isActive                   BOOLEAN NOT NULL DEFAULT FALSE,
    createdAt                  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt                  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id`: Unique identifier (CUID)
- `name`: Target name (e.g., "Senior Engineer L4 Target")
- `role`: Role category ("IC", "Manager", "Senior Manager", "Director")
- `level`: Level within role (1-6 for IC, 1-4 for Manager, etc.)
- `outstandingThreshold`: Minimum score for "Outstanding" performance
- `strongThreshold`: Minimum score for "Strong Performance"
- `meetingThreshold`: Minimum score for "Meeting Expectations"
- `partialThreshold`: Minimum score for "Partially Meeting Expectations"
- `underperformingThreshold`: Minimum score for "Underperforming"
- `timePeriodWeeks`: Evaluation period length (1-52 weeks)
- `isActive`: Whether this target is currently active
- `createdAt`: Record creation timestamp
- `updatedAt`: Last modification timestamp

**Business Rules:**
- `outstandingThreshold > strongThreshold > meetingThreshold > partialThreshold > underperformingThreshold`
- Only one target should be active at a time
- Role and level combination should be unique for active targets
- Scores below `underperformingThreshold` indicate significant performance concerns

**5-Band Performance Level Logic:**
```typescript
function getPerformanceLevel(score: number, target: PerformanceTarget): string {
  if (score >= target.outstandingThreshold) return 'Outstanding'
  if (score >= target.strongThreshold) return 'Strong Performance'
  if (score >= target.meetingThreshold) return 'Meeting Expectations'
  if (score >= target.partialThreshold) return 'Partially Meeting Expectations'
  return 'Underperforming'
}
```

**Example Data:**
```sql
INSERT INTO PerformanceTarget VALUES 
('clh7x8l3r0006u3h41w7r2t0u', 'Senior Engineer L4 Target', 'IC', 4, 300, 230, 170, 140, 120, 12, TRUE, '2024-06-12 11:00:00', '2024-06-12 11:00:00'),
('clh7x9m4s0007u3h42x8s3u1v', 'Manager L2 Target', 'Manager', 2, 320, 250, 180, 150, 120, 12, FALSE, '2024-06-12 11:05:00', '2024-06-12 11:05:00');
```

### RoleWeights

Defines IOOI dimension weights for different roles.

```sql
CREATE TABLE RoleWeights (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL UNIQUE,
    inputWeight     REAL NOT NULL CHECK (inputWeight >= 0 AND inputWeight <= 1),
    outputWeight    REAL NOT NULL CHECK (outputWeight >= 0 AND outputWeight <= 1),
    outcomeWeight   REAL NOT NULL CHECK (outcomeWeight >= 0 AND outcomeWeight <= 1),
    impactWeight    REAL NOT NULL CHECK (impactWeight >= 0 AND impactWeight <= 1),
    isActive        BOOLEAN NOT NULL DEFAULT FALSE,
    createdAt       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT weights_sum_check CHECK (
        ABS((inputWeight + outputWeight + outcomeWeight + impactWeight) - 1.0) < 0.001
    )
);
```

**Fields:**
- `id`: Unique identifier (CUID)
- `name`: Role name (e.g., "Engineer", "Manager", "Senior Manager", "Director")
- `inputWeight`: Weight for Input dimension (0.0 - 1.0)
- `outputWeight`: Weight for Output dimension (0.0 - 1.0)
- `outcomeWeight`: Weight for Outcome dimension (0.0 - 1.0)
- `impactWeight`: Weight for Impact dimension (0.0 - 1.0)
- `isActive`: Whether this role weight set is currently active
- `createdAt`: Record creation timestamp
- `updatedAt`: Last modification timestamp

**Business Rules:**
- All weights must sum to 1.0 (100%)
- Each weight must be between 0.0 and 1.0
- Role names must be unique
- Only one role weight set should be active at a time

**Weighted Score Calculation:**
```typescript
function calculateWeightedScore(scores: IOOIScores, weights: RoleWeights) {
  return (
    scores.input * weights.inputWeight +
    scores.output * weights.outputWeight +
    scores.outcome * weights.outcomeWeight +
    scores.impact * weights.impactWeight
  )
}
```

**Default Role Data:**
```sql
INSERT INTO RoleWeights VALUES 
('clh7x9m4s0007u3h42x8s3u1v', 'IC General Weights', 'IC', NULL, 0.30, 0.40, 0.20, 0.10, FALSE, '2024-06-12 11:05:00', '2024-06-12 11:05:00'),
('clh7x0n5t0008u3h43y9t4v2w', 'Manager L2 Weights', 'Manager', 2, 0.20, 0.40, 0.30, 0.10, TRUE, '2024-06-12 11:10:00', '2024-06-12 11:10:00'),
('clh7x1o6u0009u3h44z0u5w3x', 'Senior Manager Weights', 'Senior Manager', NULL, 0.15, 0.35, 0.35, 0.15, FALSE, '2024-06-12 11:15:00', '2024-06-12 11:15:00'),
('clh7x2p7v0010u3h45a1v6x4y', 'Director Weights', 'Director', NULL, 0.10, 0.25, 0.40, 0.25, FALSE, '2024-06-12 11:20:00', '2024-06-12 11:20:00');
```

### LevelExpectation

Stores role and level specific expectations for performance evaluation and career development.

```sql
CREATE TABLE LevelExpectation (
    id              TEXT PRIMARY KEY,
    role            TEXT NOT NULL,
    level           INTEGER NOT NULL,
    expectation     TEXT NOT NULL,
    createdAt       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX LevelExpectation_role_level_idx ON LevelExpectation(role, level);
```

**Fields:**
- `id`: Unique identifier (CUID)
- `role`: Role category ("IC", "Manager", "Senior Manager", "Director")
- `level`: Level within role (1-6 for IC, 1-4 for Manager, etc.)
- `expectation`: Specific expectation text for this role and level
- `createdAt`: Record creation timestamp
- `updatedAt`: Last modification timestamp

**Business Rules:**
- Multiple expectations can exist for the same role-level combination
- Expectations should be specific and actionable
- Regular review and updates recommended

**Example Data:**
```sql
INSERT INTO LevelExpectation VALUES 
('clh7x4r9s000cu3h473x8z6a', 'IC', 4, 'Leads technical design for medium to large complexity projects', '2024-06-12 11:30:00', '2024-06-12 11:30:00'),
('clh7x5s0t000du3h484y9a7b', 'IC', 4, 'Mentors junior and mid-level engineers, providing technical guidance', '2024-06-12 11:31:00', '2024-06-12 11:31:00'),
('clh7x6t1u000eu3h495z0b8c', 'IC', 4, 'Contributes to architectural decisions within team and adjacent team scope', '2024-06-12 11:32:00', '2024-06-12 11:32:00'),
('clh7x7u2v000fu3h406a1c9d', 'Manager', 1, 'Manages a team of 3-6 engineers effectively', '2024-06-12 11:33:00', '2024-06-12 11:33:00'),
('clh7x8v3w000gu3h417b2d0e', 'Manager', 1, 'Conducts regular 1:1s and provides career development guidance', '2024-06-12 11:34:00', '2024-06-12 11:34:00');
```

### CategoryTemplate

Stores template information for creating new categories.

```sql
CREATE TABLE CategoryTemplate (
    id              TEXT PRIMARY KEY,
    role            TEXT NOT NULL,
    level           INTEGER NOT NULL,
    categoryName    TEXT NOT NULL,
    dimension       TEXT NOT NULL CHECK (dimension IN ('input', 'output', 'outcome', 'impact')),
    scorePerOccurrence INTEGER NOT NULL,
    expectedWeeklyCount INTEGER NOT NULL,
    description     TEXT,
    createdAt       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id`: Unique identifier (CUID)
- `role`: Role category ("IC", "Manager", "Senior Manager", "Director")
- `level`: Level within role (1-6 for IC, 1-4 for Manager, etc.)
- `categoryName`: Name of the category
- `dimension`: IOOI classification (input, output, outcome, impact)
- `scorePerOccurrence`: Base points awarded per occurrence
- `expectedWeeklyCount`: Expected number of occurrences per week
- `description`: Optional detailed description
- `createdAt`: Record creation timestamp
- `updatedAt`: Last modification timestamp

**Business Rules:**
- `role` and `level` combination should be unique
- `scorePerOccurrence` must be positive
- `dimension` enforces IOOI framework compliance
- `expectedWeeklyCount` must be positive

**Example Data:**
```sql
INSERT INTO CategoryTemplate VALUES 
('clh7x9n3x000hu3h43y9t4v2w', 'IC', 4, 'Code Reviews', 'input', 5, 8, 'Reviewing others code', '2024-06-12 11:10:00', '2024-06-12 11:10:00'),
('clh7xao4y000iu3h44z0u5w3x', 'Manager', 1, 'Feature Development', 'output', 10, 3, 'Building new functionality', '2024-06-12 11:15:00', '2024-06-12 11:15:00');
```

## Database Configuration

### Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Category {
  id                 String      @id @default(cuid())
  name               String
  scorePerOccurrence Int
  dimension          String      // 'input' | 'output' | 'outcome' | 'impact'
  description        String?
  createdAt          DateTime    @default(now())
  updatedAt          DateTime    @updatedAt
  
  weeklyLogs         WeeklyLog[]
}

model WeeklyLog {
  id            String   @id @default(cuid())
  categoryId    String
  week          String
  count         Int      @default(0)
  overrideScore Int?
  createdAt     DateTime @default(now())
  
  category      Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  
  @@unique([categoryId, week])
}

model PerformanceTarget {
  id                         String   @id @default(cuid())
  name                       String
  excellentThreshold         Int
  goodThreshold             Int
  needsImprovementThreshold Int
  timePeriodWeeks           Int      @default(12)
  isActive                  Boolean  @default(false)
  createdAt                 DateTime @default(now())
  updatedAt                 DateTime @updatedAt
}

model RoleWeights {
  id            String   @id @default(cuid())
  name          String   @unique
  inputWeight   Float
  outputWeight  Float
  outcomeWeight Float
  impactWeight  Float
  isActive      Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### Environment Configuration

**Development (.env.local):**
```env
DATABASE_URL="file:./dev.db"
```

**Production (Vercel):**
```env
DATABASE_URL="libsql://your-database.turso.io"
TURSO_AUTH_TOKEN="your-auth-token"
```

## Indexes and Performance

### Recommended Indexes

```sql
-- WeeklyLog performance
CREATE INDEX idx_weeklylog_week ON WeeklyLog(week);
CREATE INDEX idx_weeklylog_categoryid ON WeeklyLog(categoryId);

-- Category lookup
CREATE INDEX idx_category_dimension ON Category(dimension);

-- Performance queries
CREATE INDEX idx_performancetarget_active ON PerformanceTarget(isActive);
CREATE INDEX idx_roleweights_active ON RoleWeights(isActive);
```

### Query Patterns

**Get weekly performance data:**
```sql
SELECT 
  c.dimension,
  SUM(COALESCE(wl.overrideScore, wl.count * c.scorePerOccurrence)) as totalScore
FROM WeeklyLog wl
JOIN Category c ON c.id = wl.categoryId
WHERE wl.week = '2024-W20'
GROUP BY c.dimension;
```

**Calculate weighted score:**
```sql
WITH weekly_scores AS (
  SELECT 
    c.dimension,
    SUM(COALESCE(wl.overrideScore, wl.count * c.scorePerOccurrence)) as dimensionScore
  FROM WeeklyLog wl
  JOIN Category c ON c.id = wl.categoryId
  WHERE wl.week = '2024-W20'
  GROUP BY c.dimension
),
active_weights AS (
  SELECT * FROM RoleWeights WHERE isActive = TRUE LIMIT 1
)
SELECT 
  (
    COALESCE((SELECT dimensionScore FROM weekly_scores WHERE dimension = 'input'), 0) * aw.inputWeight +
    COALESCE((SELECT dimensionScore FROM weekly_scores WHERE dimension = 'output'), 0) * aw.outputWeight +
    COALESCE((SELECT dimensionScore FROM weekly_scores WHERE dimension = 'outcome'), 0) * aw.outcomeWeight +
    COALESCE((SELECT dimensionScore FROM weekly_scores WHERE dimension = 'impact'), 0) * aw.impactWeight
  ) as weightedScore
FROM active_weights aw;
```

## Data Migration and Seeding

### Initial Setup

```typescript
// Initialize default categories
const defaultCategories = [
  { name: 'Code Reviews', scorePerOccurrence: 5, dimension: 'input' },
  { name: 'Meeting Participation', scorePerOccurrence: 3, dimension: 'input' },
  { name: 'Feature Development', scorePerOccurrence: 10, dimension: 'output' },
  { name: 'Bug Fixes', scorePerOccurrence: 3, dimension: 'output' },
  { name: 'Design Documents', scorePerOccurrence: 25, dimension: 'outcome' },
  { name: 'Technical Proposals', scorePerOccurrence: 20, dimension: 'outcome' },
  { name: 'Mentoring Sessions', scorePerOccurrence: 12, dimension: 'impact' },
  { name: 'Hiring Interviews', scorePerOccurrence: 15, dimension: 'impact' },
]

// Initialize default role weights
const defaultRoles = [
  { name: 'Engineer', inputWeight: 0.30, outputWeight: 0.40, outcomeWeight: 0.20, impactWeight: 0.10 },
  { name: 'Manager', inputWeight: 0.20, outputWeight: 0.40, outcomeWeight: 0.30, impactWeight: 0.10 },
  { name: 'Senior Manager', inputWeight: 0.15, outputWeight: 0.35, outcomeWeight: 0.35, impactWeight: 0.15 },
  { name: 'Director', inputWeight: 0.10, outputWeight: 0.25, outcomeWeight: 0.40, impactWeight: 0.25 },
]
```

## Backup and Maintenance

### Database Backup

```bash
# Local SQLite backup
cp prisma/dev.db backups/backup-$(date +%Y%m%d_%H%M%S).db

# Turso backup (using Turso CLI)
turso db dump your-database > backup-$(date +%Y%m%d_%H%M%S).sql
```

### Data Cleanup

```sql
-- Remove empty weekly logs
DELETE FROM WeeklyLog WHERE count = 0 AND overrideScore IS NULL;

-- Archive old performance targets
UPDATE PerformanceTarget SET isActive = FALSE WHERE createdAt < date('now', '-1 year');
```

### Schema Migrations

```bash
# Generate migration
npx prisma migrate dev --name description_of_change

# Apply to production
npx prisma migrate deploy
``` 