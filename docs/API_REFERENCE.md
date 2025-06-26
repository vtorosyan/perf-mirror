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

Manage role-level performance thresholds with 5-band evaluation system.

### List Targets

```http
GET /api/targets
```

**Response:**
```json
[
  {
    "id": "clh7x5i0o0003u3h4xs4o9q7r",
    "name": "Senior Engineer L4 Target",
    "role": "IC",
    "level": 4,
    "outstandingThreshold": 300,
    "strongThreshold": 230,
    "meetingThreshold": 170,
    "partialThreshold": 140,
    "underperformingThreshold": 120,
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
  "name": "Manager L2 Target",
  "role": "Manager",
  "level": 2,
  "outstandingThreshold": 320,
  "strongThreshold": 250,
  "meetingThreshold": 180,
  "partialThreshold": 150,
  "underperformingThreshold": 120,
  "timePeriodWeeks": 12,
  "isActive": false
}
```

**Validation:**
- `name`: Required, 1-100 characters
- `role`: Optional, one of: `IC`, `Manager`, `Senior Manager`, `Director`
- `level`: Optional, positive integer (1-6 for IC, 1-4 for Manager, etc.)
- `outstandingThreshold`: Required, positive number
- `strongThreshold`: Required, positive number, less than outstanding
- `meetingThreshold`: Required, positive number, less than strong
- `partialThreshold`: Required, positive number, less than meeting
- `underperformingThreshold`: Required, positive number, less than partial
- `timePeriodWeeks`: Required, positive integer (1-52)
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

## Level Expectations

Manage role and level specific expectations for performance evaluation.

### List Level Expectations

```http
GET /api/level-expectations?role=IC&level=4
```

**Query Parameters:**
- `role`: Optional, filter by role ("IC", "Manager", "Senior Manager", "Director")
- `level`: Optional, filter by level (positive integer)

**Response:**
```json
[
  {
    "id": "clh7x6j1p0004u3h4yt5p0r8s",
    "role": "IC",
    "level": 4,
    "expectation": "Leads technical design for medium to large complexity projects",
    "createdAt": "2024-06-12T10:50:00.000Z",
    "updatedAt": "2024-06-12T10:50:00.000Z"
  },
  {
    "id": "clh7x7k2q0005u3h4zu6q1s9t",
    "role": "IC",
    "level": 4,
    "expectation": "Mentors junior and mid-level engineers, providing technical guidance",
    "createdAt": "2024-06-12T10:51:00.000Z",
    "updatedAt": "2024-06-12T10:51:00.000Z"
  }
]
```

### Create Level Expectation

```http
POST /api/level-expectations
Content-Type: application/json

{
  "role": "IC",
  "level": 4,
  "expectation": "Contributes to architectural decisions within team and adjacent team scope"
}
```

**Validation:**
- `role`: Required, one of: `IC`, `Manager`, `Senior Manager`, `Director`
- `level`: Required, positive integer
- `expectation`: Required, 1-1000 characters

### Update Level Expectation

```http
PUT /api/level-expectations/{id}
Content-Type: application/json

{
  "expectation": "Leads architectural decisions for complex cross-team projects"
}
```

### Delete Level Expectation

```http
DELETE /api/level-expectations/{id}
```

## Role Weights

Manage IOOI dimension weights for different roles and levels.

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
  role?: string;
  level?: number;
  outstandingThreshold: number;
  strongThreshold: number;
  meetingThreshold: number;
  partialThreshold: number;
  underperformingThreshold: number;
  timePeriodWeeks: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// RoleWeights  
{
  id: string;
  name: string;
  role?: string;
  level?: number;
  inputWeight: number;
  outputWeight: number;
  outcomeWeight: number;
  impactWeight: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// LevelExpectation
{
  id: string;
  role: string;
  level: number;
  expectation: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Smart Insights Integration

The Dashboard component integrates with multiple APIs to provide Enhanced Smart Insights functionality:

### Smart Insights Data Flow

```typescript
// 1. Fetch user profile
const userProfile = await fetch('/api/user-profile')

// 2. Fetch current and next level expectations
const currentExpectations = await fetch(`/api/level-expectations?role=${role}&level=${level}`)
const nextExpectations = await fetch(`/api/level-expectations?role=${role}&level=${level + 1}`)

// 3. Fetch category templates for both levels
const currentTemplates = await fetch(`/api/category-templates?role=${role}&level=${level}`)
const nextTemplates = await fetch(`/api/category-templates?role=${role}&level=${level + 1}`)

// 4. Analyze recent activity logs
const weeklyLogs = await fetch(`/api/weekly-logs?weeks=${recentWeeks.join(',')}`)
```

### Smart Insights Interfaces

#### ExpectationAnalysis
```typescript
interface ExpectationAnalysis {
  expectation: string                    // Natural language expectation text
  status: 'evidenced' | 'consistent' | 'not_evidenced'  // Evidence level
  matchingCategories: string[]          // Categories that match this expectation
  weeksCovered: number                  // Number of weeks with activity
}
```

#### GrowthSuggestion
```typescript
interface GrowthSuggestion {
  expectation: string                   // Next level expectation
  status: 'emerging' | 'missing'       // Current evidence status
  suggestion: string                    // Actionable advice text
  recommendedCategories: string[]       // Categories to focus on
}
```

#### Smart Insights Response Example
```json
{
  "currentLevelAnalysis": [
    {
      "expectation": "Should participate in architecture reviews",
      "status": "evidenced",
      "matchingCategories": ["Architecture Reviews", "Technical Design"],
      "weeksCovered": 2
    },
    {
      "expectation": "Must complete features independently",
      "status": "consistent", 
      "matchingCategories": ["Feature Development", "Independent Work"],
      "weeksCovered": 4
    },
    {
      "expectation": "Should mentor junior developers",
      "status": "not_evidenced",
      "matchingCategories": ["Mentoring", "Knowledge Transfer"],
      "weeksCovered": 0
    }
  ],
  "growthSuggestions": [
    {
      "expectation": "Should lead technical initiatives",
      "status": "emerging",
      "suggestion": "Great start! Keep building on your technical leadership work to strengthen this area.",
      "recommendedCategories": ["Technical Leadership", "Project Management"]
    },
    {
      "expectation": "Must contribute to technical strategy",
      "status": "missing",
      "suggestion": "Engage in strategic planning sessions or contribute to technical roadmap discussions.",
      "recommendedCategories": ["Technical Strategy", "Architecture Planning"]
    }
  ]
}
```

### Smart Insights Algorithm Parameters

#### Keyword Extraction Rules
- **Minimum Word Length**: 3 characters
- **Stop Words**: Common words like "should", "must", "the", "and" are filtered out
- **Maximum Keywords**: Limited to 5 most relevant keywords per expectation
- **Word Processing**: Punctuation removed, case-insensitive matching

#### Evidence Classification Thresholds
- **Consistent Evidence**: 3+ weeks of activity in matching categories
- **Basic Evidence**: 1+ weeks of activity in matching categories  
- **No Evidence**: 0 weeks of activity in matching categories

#### Matching Algorithm
- **Exact Match**: Category name contains expectation keyword
- **Description Match**: Category description contains expectation keyword
- **Partial Match**: Keyword contains first word of category name
- **Case Insensitive**: All matching is case-insensitive

#### Suggestion Generation Rules

##### Role-Specific Strategies
```typescript
const roleStrategies = {
  'IC': {
    'mentor': 'Start by mentoring junior developers or helping with onboarding',
    'design': 'Propose design improvements or write technical RFCs',
    'strategy': 'Contribute to technical roadmap discussions'
  },
  'Manager': {
    'mentor': 'Develop formal mentoring programs and career development plans',
    'design': 'Lead architectural decision-making and system design',
    'strategy': 'Drive technical strategy alignment across teams'
  }
}
```

##### Dimension-Based Fallbacks
```typescript
const dimensionStrategies = {
  'input': 'Seek out more learning opportunities and knowledge sharing',
  'output': 'Focus on delivering concrete results and measurable outcomes', 
  'outcome': 'Work on initiatives that drive team or product success metrics',
  'impact': 'Look for opportunities to influence broader organizational goals'
}
```

### Performance Considerations

#### Caching Strategy
- **User Profile**: Cached for session duration
- **Level Expectations**: Cached until role/level changes
- **Category Templates**: Cached until role/level changes
- **Weekly Logs**: Real-time, no caching

#### Error Handling
- **Missing Expectations**: Graceful degradation with empty analysis
- **Invalid JSON**: Falls back to empty expectations array
- **API Failures**: Shows cached data or helpful error messages
- **Malformed Data**: Filters out invalid entries automatically

#### Scalability
- **Time Complexity**: O(e × (m × k + w × c)) where:
  - e = number of expectations
  - m = number of category templates  
  - k = number of keywords per expectation
  - w = number of weeks analyzed
  - c = number of categories with activity
- **Memory Usage**: Linear with input data size
- **Network Requests**: Batched and parallelized where possible

### Integration Examples

#### Frontend Component Usage
```typescript
// In Dashboard component
const analyzeCurrentLevelExpectations = (): ExpectationAnalysis[] => {
  if (!currentLevelExpectations || !currentLevelTemplates.length) return []
  
  const evaluationPeriod = getEvaluationPeriod()
  const periodLogs = weeklyLogs.filter(log => evaluationPeriod.weeks.includes(log.week))
  
  return JSON.parse(currentLevelExpectations.expectations).map(expectation => {
    const matchingCategories = findMatchingCategories(expectation, currentLevelTemplates)
    const evidence = classifyEvidence(matchingCategories, periodLogs)
    
    return {
      expectation,
      status: evidence.status,
      matchingCategories: matchingCategories.map(t => t.categoryName),
      weeksCovered: evidence.weeksCovered
    }
  })
}
```

#### API Response Validation
```typescript
// Validate Smart Insights data
function validateSmartInsightsData(data: any): boolean {
  return (
    Array.isArray(data.currentLevelAnalysis) &&
    Array.isArray(data.growthSuggestions) &&
    data.currentLevelAnalysis.every(isValidExpectationAnalysis) &&
    data.growthSuggestions.every(isValidGrowthSuggestion)
  )
}

function isValidExpectationAnalysis(analysis: any): boolean {
  return (
    typeof analysis.expectation === 'string' &&
    ['evidenced', 'consistent', 'not_evidenced'].includes(analysis.status) &&
    Array.isArray(analysis.matchingCategories) &&
    typeof analysis.weeksCovered === 'number'
  )
}
```

This Smart Insights system provides actionable, role-specific career guidance while maintaining transparency and deterministic behavior. 