# API Reference

## Overview

PerfMirror provides a RESTful API for managing categories, weekly logs, performance targets, and role weights. All endpoints return JSON and follow standard HTTP status codes.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://perf-mirror-rdbf.vercel.app/api`

## Authentication

Currently, the API does not require authentication. This is suitable for personal/team deployment but should be extended for multi-tenant usage.

## Categories

Manage work categories with IOOI dimensions.

### List Categories

```http
GET /api/categories
```

**Response:**
```json
[
  {
    "id": "clh7x2f9k0000u3h4tq5l8m9n",
    "name": "Code Reviews",
    "scorePerOccurrence": 5,
    "dimension": "input",
    "description": "Reviewing others' code, learning patterns",
    "createdAt": "2024-06-12T10:30:00.000Z",
    "updatedAt": "2024-06-12T10:30:00.000Z"
  }
]
```

### Create Category

```http
POST /api/categories
Content-Type: application/json

{
  "name": "Feature Development",
  "scorePerOccurrence": 10,
  "dimension": "output",
  "description": "Building new functionality"
}
```

**Response:**
```json
{
  "id": "clh7x3g8m0001u3h4vq2m9o7p",
  "name": "Feature Development",
  "scorePerOccurrence": 10,
  "dimension": "output",
  "description": "Building new functionality",
  "createdAt": "2024-06-12T10:35:00.000Z",
  "updatedAt": "2024-06-12T10:35:00.000Z"
}
```

**Validation:**
- `name`: Required, 1-100 characters
- `scorePerOccurrence`: Required, positive number
- `dimension`: Required, one of: `input`, `output`, `outcome`, `impact`
- `description`: Optional, max 500 characters

### Update Category

```http
PUT /api/categories/{id}
Content-Type: application/json

{
  "name": "Advanced Feature Development",
  "scorePerOccurrence": 15,
  "description": "Complex feature development requiring design"
}
```

### Delete Category

```http
DELETE /api/categories/{id}
```

## Weekly Logs

Track weekly activity counts and scores.

### Get Weekly Logs

```http
GET /api/weekly-logs?weeks=2024-W20,2024-W21,2024-W22
```

**Query Parameters:**
- `weeks`: Comma-separated list of ISO week strings (e.g., "2024-W20")

**Response:**
```json
[
  {
    "id": "clh7x4h9n0002u3h4wr3n8p6q",
    "categoryId": "clh7x2f9k0000u3h4tq5l8m9n",
    "week": "2024-W20",
    "count": 8,
    "overrideScore": null,
    "createdAt": "2024-06-12T10:40:00.000Z"
  }
]
```

### Create/Update Weekly Log

```http
POST /api/weekly-logs
Content-Type: application/json

{
  "logs": [
    {
      "categoryId": "clh7x2f9k0000u3h4tq5l8m9n",
      "week": "2024-W20",
      "count": 8,
      "overrideScore": null
    },
    {
      "categoryId": "clh7x3g8m0001u3h4vq2m9o7p",
      "week": "2024-W20",
      "count": 3,
      "overrideScore": 35
    }
  ]
}
```

**Notes:**
- Uses upsert logic (creates if doesn't exist, updates if exists)
- `overrideScore` replaces calculated score when provided
- `count` of 0 removes the log entry

## Performance Targets

Manage performance thresholds and goals.

### List Targets

```http
GET /api/targets
```

**Response:**
```json
[
  {
    "id": "clh7x5i0o0003u3h4xs4o9q7r",
    "name": "Q1 2024 Performance Target",
    "excellentThreshold": 225,
    "goodThreshold": 170,
    "needsImprovementThreshold": 120,
    "timePeriodWeeks": 12,
    "isActive": true,
    "createdAt": "2024-06-12T10:45:00.000Z",
    "updatedAt": "2024-06-12T10:45:00.000Z"
  }
]
```

### Create Target

```http
POST /api/targets
Content-Type: application/json

{
  "name": "Q2 2024 Target",
  "excellentThreshold": 250,
  "goodThreshold": 180,
  "needsImprovementThreshold": 130,
  "timePeriodWeeks": 12,
  "isActive": false
}
```

**Validation:**
- `name`: Required, 1-100 characters
- `excellentThreshold`: Required, positive number
- `goodThreshold`: Required, positive number, less than excellent
- `needsImprovementThreshold`: Required, positive number, less than good
- `timePeriodWeeks`: Required, positive integer
- `isActive`: Boolean, defaults to false

### Update Target

```http
PUT /api/targets/{id}
Content-Type: application/json

{
  "isActive": true
}
```

### Delete Target

```http
DELETE /api/targets/{id}
```

## Role Weights

Manage IOOI dimension weights for different roles.

### List Role Weights

```http
GET /api/role-weights
```

**Response:**
```json
[
  {
    "id": "clh7x6j1p0004u3h4yt5p0r8s",
    "name": "Engineer",
    "inputWeight": 0.30,
    "outputWeight": 0.40,
    "outcomeWeight": 0.20,
    "impactWeight": 0.10,
    "isActive": true,
    "createdAt": "2024-06-12T10:50:00.000Z",
    "updatedAt": "2024-06-12T10:50:00.000Z"
  }
]
```

### Create Role Weights

```http
POST /api/role-weights
Content-Type: application/json

{
  "name": "Senior Engineer",
  "inputWeight": 0.25,
  "outputWeight": 0.35,
  "outcomeWeight": 0.25,
  "impactWeight": 0.15,
  "isActive": false
}
```

**Validation:**
- `name`: Required, 1-50 characters
- Weights must be decimal numbers between 0 and 1
- Weights must sum to 1.0 (100%)
- `isActive`: Boolean, defaults to false

### Update Role Weights

```http
PUT /api/role-weights/{id}
Content-Type: application/json

{
  "isActive": true
}
```

**Note:** Setting `isActive: true` automatically deactivates other role weights.

### Initialize Default Role Weights

```http
POST /api/role-weights/init
```

Creates the four default role configurations:
- Engineer (30%, 40%, 20%, 10%)
- Manager (20%, 40%, 30%, 10%)
- Senior Manager (15%, 35%, 35%, 15%)
- Director (10%, 25%, 40%, 25%)

### Delete Role Weights

```http
DELETE /api/role-weights/{id}
```

## Calculated Endpoints

### Get Dashboard Data

```http
GET /api/dashboard?weeks=12
```

Returns aggregated data for dashboard display including:
- Current week performance
- Trend data
- Performance insights
- IOOI breakdown

### Get Performance Insights

```http
GET /api/insights?weeks=2024-W18,2024-W19,2024-W20
```

Returns AI-generated insights based on activity patterns:
- Pattern detection (e.g., "High input, low output")
- Recommendations
- Trend analysis

## Error Responses

All endpoints return consistent error formats:

```json
{
  "error": "Validation failed",
  "details": {
    "field": "scorePerOccurrence",
    "message": "Must be a positive number"
  }
}
```

### HTTP Status Codes

- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Rate Limiting

Currently no rate limiting is implemented. For production deployment, consider implementing rate limiting based on your usage patterns.

## Data Types

### ISO Week Format

Weeks are represented as ISO 8601 week dates: `YYYY-WNN`
- `2024-W01`: First week of 2024
- `2024-W20`: Twentieth week of 2024

### Dimensions

Valid dimension values for categories:
- `input`: Activities you consume
- `output`: Work you produce  
- `outcome`: Results you achieve
- `impact`: Influence you create

## Integration Examples

### JavaScript/TypeScript

```typescript
// Fetch weekly data
const response = await fetch('/api/weekly-logs?weeks=2024-W20');
const logs = await response.json();

// Create category
const category = await fetch('/api/categories', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Code Reviews',
    scorePerOccurrence: 5,
    dimension: 'input',
    description: 'Reviewing others code'
  })
});

// Calculate weighted score
function calculateWeightedScore(scores, weights) {
  return (
    scores.input * weights.inputWeight +
    scores.output * weights.outputWeight +
    scores.outcome * weights.outcomeWeight +
    scores.impact * weights.impactWeight
  );
}
```

### cURL Examples

```bash
# Get categories
curl -X GET "http://localhost:3000/api/categories"

# Create category
curl -X POST "http://localhost:3000/api/categories" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bug Fixes",
    "scorePerOccurrence": 3,
    "dimension": "output",
    "description": "Resolving technical issues"
  }'

# Get weekly logs for multiple weeks
curl -X GET "http://localhost:3000/api/weekly-logs?weeks=2024-W18,2024-W19,2024-W20"

# Activate role weights
curl -X PUT "http://localhost:3000/api/role-weights/clh7x6j1p0004u3h4yt5p0r8s" \
  -H "Content-Type: application/json" \
  -d '{"isActive": true}'
```

### Python

```python
import requests

# Get categories
response = requests.get('http://localhost:3000/api/categories')
categories = response.json()

# Create weekly log
logs_data = {
    "logs": [
        {
            "categoryId": "clh7x2f9k0000u3h4tq5l8m9n",
            "week": "2024-W20",
            "count": 5,
            "overrideScore": None
        }
    ]
}

response = requests.post(
    'http://localhost:3000/api/weekly-logs',
    json=logs_data
)
```

## Database Schema

For reference, the key data models:

```typescript
// Category
{
  id: string;
  name: string;
  scorePerOccurrence: number;
  dimension: 'input' | 'output' | 'outcome' | 'impact';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// WeeklyLog
{
  id: string;
  categoryId: string;
  week: string; // ISO week format
  count: number;
  overrideScore?: number;
  createdAt: Date;
}

// PerformanceTarget
{
  id: string;
  name: string;
  excellentThreshold: number;
  goodThreshold: number;
  needsImprovementThreshold: number;
  timePeriodWeeks: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// RoleWeights  
{
  id: string;
  name: string;
  inputWeight: number;
  outputWeight: number;
  outcomeWeight: number;
  impactWeight: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
``` 