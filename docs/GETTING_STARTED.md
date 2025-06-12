# Getting Started Guide

## Overview

This guide will walk you through setting up PerfMirror and logging your first week of performance data using the IOOI framework.

## Prerequisites

- **Node.js 18+** - For running the application
- **npm or yarn** - Package manager
- **Docker** (optional) - For containerized deployment

## Installation Options

### Option 1: Local Development (Recommended for first-time users)

```bash
# Clone the repository
git clone https://github.com/yourusername/perf-mirror.git
cd perf-mirror

# Install dependencies
npm install

# Set up the database
npm run db:push

# Start development server
npm run dev

# Open in browser
open http://localhost:3000
```

### Option 2: Docker Deployment

```bash
# Using Docker Compose
docker-compose up --build -d

# Or using Make
make quick-start
```

## First-Time Setup

### 1. Initialize Role Weights

When you first open the application, you'll need to set up role weights:

1. Navigate to the **Role Weights** tab
2. Click **Initialize Default Roles** if no roles exist
3. Select your current role (Engineer, Manager, Senior Manager, Director)
4. Click **Activate** next to your role

**Default Role Weights**:
- **Engineer**: Input 30%, Output 40%, Outcome 20%, Impact 10%
- **Manager**: Input 20%, Output 40%, Outcome 30%, Impact 10%
- **Senior Manager**: Input 15%, Output 35%, Outcome 35%, Impact 15%
- **Director**: Input 10%, Output 25%, Outcome 40%, Impact 25%

### 2. Create Work Categories

Navigate to the **Categories** tab and create categories for your typical work:

#### Input Categories (Activities you consume)
```
Name: Code Reviews
Dimension: input
Points per Occurrence: 5
Description: Reviewing others' code, learning patterns

Name: Meeting Participation  
Dimension: input
Points per Occurrence: 3
Description: Standups, planning meetings, discussions
```

#### Output Categories (Work you produce)
```
Name: Feature Development
Dimension: output
Points per Occurrence: 10
Description: Building new functionality

Name: Bug Fixes
Dimension: output
Points per Occurrence: 3
Description: Resolving technical issues
```

#### Outcome Categories (Results you achieve)
```
Name: Design Documents
Dimension: outcome
Points per Occurrence: 25
Description: Technical specifications and architecture

Name: Technical Proposals
Dimension: outcome
Points per Occurrence: 20
Description: RFC documents and solution designs
```

#### Impact Categories (Influence you create)
```
Name: Mentoring Sessions
Dimension: impact
Points per Occurrence: 12
Description: Developing junior engineers

Name: Hiring Interviews
Dimension: impact
Points per Occurrence: 15
Description: Building the team
```

### 3. Set Performance Targets

Go to the **Targets** tab and create your first performance target:

```
Name: Q1 2024 Performance Target
Excellent Threshold: 225
Good Threshold: 170
Needs Improvement Threshold: 120
Time Period: 12 weeks
Active: Yes
```

## Logging Your First Week

### Step 1: Navigate to Log Work

Click on the **Log Work** tab in the main navigation.

### Step 2: Select the Week

Use the week picker to select the current week or the week you want to log.

### Step 3: Log Activities by Dimension

The interface groups activities by IOOI dimension. For each category:

1. **Count**: Enter how many times you performed this activity
2. **Override** (optional): Adjust the score if the standard points don't reflect the actual value

**Example First Week**:

**Input Activities**:
- Code Reviews: 8 (8 × 5 = 40 points)
- Meeting Participation: 12 (12 × 3 = 36 points)
- *Total Input: 76 points*

**Output Activities**:
- Feature Development: 3 (3 × 10 = 30 points)
- Bug Fixes: 5 (5 × 3 = 15 points)
- *Total Output: 45 points*

**Outcome Activities**:
- Design Documents: 1 (1 × 25 = 25 points)
- *Total Outcome: 25 points*

**Impact Activities**:
- Mentoring Sessions: 2 (2 × 12 = 24 points)
- *Total Impact: 24 points*

### Step 4: Review Your Score

The interface shows:
- **Raw Total**: 170 points (76 + 45 + 25 + 24)
- **Weighted Score** (for Engineer role): 139 points
  - Input: 76 × 0.30 = 22.8
  - Output: 45 × 0.40 = 18.0
  - Outcome: 25 × 0.20 = 5.0
  - Impact: 24 × 0.10 = 2.4
  - **Total**: 48.2 weighted points

### Step 5: Save Your Log

Click **Save Weekly Log** to store your data.

## Understanding Your Dashboard

After logging a few weeks, visit the **Dashboard** to see:

### Current Week Summary
- Your weekly score and performance level
- Comparison to your active target
- IOOI breakdown percentages

### Smart Insights
The system analyzes patterns and provides recommendations:
- "High input, low output" → Focus more on delivery
- "Strong output, low outcome" → Contribute to technical direction
- "Low impact for senior role" → Consider mentoring opportunities

### Trend Charts
- Weekly performance over time
- Dimension breakdown trends
- Performance level consistency

## Best Practices for New Users

### Week 1-2: Establish Baseline
- Log everything, even small activities
- Don't worry about perfect categorization
- Focus on building the habit

### Week 3-4: Calibrate Categories
- Adjust point values based on actual effort/value
- Add missing categories you discover
- Start using score overrides for exceptional work

### Month 2: Optimize Performance
- Use insights to identify improvement areas
- Experiment with different activity distributions
- Set weekly goals based on your role weights

### Month 3+: Advanced Usage
- Create custom role weights if needed
- Use performance data for career conversations
- Share insights with your manager

## Common First-Week Questions

### Q: How granular should I be with activities?
**A**: Start simple. "Meetings" is fine initially; you can break into "standups," "planning," "1:1s" later.

### Q: What if I forgot to log something?
**A**: You can always go back and edit previous weeks. The system allows retroactive logging.

### Q: Should I aim for a certain score?
**A**: Focus on the right balance for your role rather than maximizing total points. A manager with too much "Output" might not be delegating enough.

### Q: When should I use score overrides?
**A**: Sparingly. Use when standard points don't reflect true value (e.g., a simple bug fix that prevents a major outage).

### Q: My weighted score seems low compared to raw score
**A**: This is normal! Your role weights emphasize certain dimensions. An Engineer's high Input/Output gets weighted higher than Outcome/Impact.

## Troubleshooting

### Application Won't Start
```bash
# Clear build cache
rm -rf .next

# Regenerate database
npm run db:push

# Restart
npm run dev
```

### Database Issues
```bash
# Reset database (WARNING: deletes all data)
rm prisma/dev.db
npm run db:push
```

### Categories Not Saving
- Check that all required fields are filled
- Ensure dimension is exactly "input", "output", "outcome", or "impact"
- Verify scorePerOccurrence is a positive number

## Next Steps

Once you're comfortable with basic logging:

1. **Read [Performance Logic](PERFORMANCE_LOGIC.md)** - Understand the IOOI framework deeply
2. **Explore [API Reference](API_REFERENCE.md)** - If you want to integrate with other tools
3. **Check [Customization Guide](CUSTOMIZATION.md)** - Adapt the system for your team
4. **Join [Community Discussions](https://github.com/yourusername/perf-mirror/discussions)** - Share experiences and get tips

## Getting Help

- **Documentation**: Start with this guide and [Performance Logic](PERFORMANCE_LOGIC.md)
- **Issues**: Report bugs on [GitHub Issues](https://github.com/yourusername/perf-mirror/issues)
- **Discussions**: Ask questions in [GitHub Discussions](https://github.com/yourusername/perf-mirror/discussions)
- **Blog Posts**: Read methodology explanations at [blog.vardan.dev](https://blog.vardan.dev) 