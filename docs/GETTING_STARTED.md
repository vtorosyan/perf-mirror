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

# Complete setup (install + database + seeding)
make setup

# Start development server
npm run dev

# Open in browser
open http://localhost:3000
```

**What `make setup` does:**
- Installs dependencies (`npm install`)
- Sets up the database schema (`prisma db push`)
- Seeds default data (level expectations, category templates, role weights)

**Alternative manual setup:**
```bash
# Install dependencies
npm install

# Set up the database
npm run db:push

# Seed default data
npm run db:seed

# Start development server
npm run dev
```

### Option 2: Docker Deployment

```bash
# Using Docker Compose
docker-compose up --build -d

# Or using Make
make quick-start
```

## First-Time Setup

### 1. Activate Role Weights

When you first open the application, you'll see pre-seeded role weights:

1. Navigate to the **Role Weights** tab
2. You'll see default role weights already created:
   - **IC General Weights**: Input 30%, Output 40%, Outcome 20%, Impact 10%
   - **Manager General Weights**: Input 20%, Output 30%, Outcome 30%, Impact 20%
3. Click **Activate** next to the role that matches your current position

### 2. Use Pre-Seeded Category Templates

Navigate to the **Categories** tab and you'll find starter category templates already available:

> **💡 Pro Tip**: The local setup includes basic category templates for IC levels 1-2. If you're using the production version at https://perf-mirror-rdbf.vercel.app/, comprehensive category templates are pre-populated for all role/level combinations (IC L1-8, Manager L4-8).

#### Pre-Seeded Templates for IC Level 1:
- **Code Reviews** (input) - 3 pts each, ~5 per week
- **Bug Fixes** (output) - 5 pts each, ~4 per week  
- **Documentation Reading** (input) - 2 pts each, ~8 per week
- **Small Feature Implementation** (output) - 8 pts each, ~2 per week
- **Team Meetings** (outcome) - 3 pts each, ~6 per week
- **Learning Activities** (impact) - 4 pts each, ~3 per week

#### Pre-Seeded Templates for IC Level 2:
- **Code Reviews** (input) - 4 pts each, ~6 per week
- **Feature Development** (output) - 10 pts each, ~3 per week
- **Technical Research** (input) - 5 pts each, ~2 per week
- **Bug Resolution** (output) - 6 pts each, ~4 per week
- **Project Completion** (outcome) - 15 pts each, ~1 per week
- **Team Collaboration** (impact) - 6 pts each, ~4 per week

**You can:**
- Use these templates as-is
- Modify the point values or expected counts
- Add your own custom categories
- Create categories for higher levels as needed

### 3. Set Performance Targets (Optional)

Go to the **Targets** tab to create your first performance target if none exist:

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