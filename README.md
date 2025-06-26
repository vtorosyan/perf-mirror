# PerfMirror - Performance Tracking for Engineers

A modern web application for tracking engineering performance using the **IOOI Framework** (Input, Output, Outcome, Impact) with role-based weighted scoring and comprehensive performance evaluation.

[![Production](https://img.shields.io/badge/Production-Live-brightgreen)](https://perf-mirror-rdbf.vercel.app/)
[![Local Development](https://img.shields.io/badge/Development-Ready-blue)](#quick-start)

## ✨ Features

### Core Performance Tracking
- **📊 IOOI Framework**: Structured tracking across Input, Output, Outcome, and Impact dimensions
- **⚖️ Role-Based Scoring**: Customizable weights for different roles and levels
- **🎯 5-Band Performance Evaluation**: Outstanding, Strong Performance, Meeting Expectations, Partially Meeting, Underperforming
- **📋 Role-Level Targets**: Configurable performance targets for each role/level combination
- **📝 Level Expectations**: Define and manage expectations for career progression

### Smart Features
- **🧭 Smart Insights**: AI-powered pattern detection with actionable recommendations
- **🏷️ Category Templates**: Pre-built work categories for all role/level combinations (IC L1-8, Manager L4-8)
- **🔄 Real-Time Updates**: Seamless data refresh and live calculations
- **📱 Modern UI**: Responsive design with interactive charts

### Technical Excellence
- **🌐 Hybrid Database**: Automatic switching between SQLite (local) and Turso (production)
- **🐳 Docker Ready**: Complete containerization with Make commands
- **🚀 Production Ready**: Deployed on Vercel with health monitoring
- **🌱 Easy Seeding**: Comprehensive data population scripts

## 🚀 Quick Start

### Option 1: Make Commands (Recommended)
```bash
# Complete setup and start development
make setup
make dev

# View all available commands
make help
```

### Option 2: Manual Setup
```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

### Option 3: Docker
```bash
# Development with hot reload
docker-compose -f docker-compose.dev.yml up

# Production deployment
docker-compose up --build
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🎯 Performance System

### 5-Band Evaluation Levels

| Level | Description | Typical Score Range |
|-------|-------------|-------------------|
| **🌟 Outstanding** | Exceptional performance exceeding all expectations | 300+ |
| **✅ Strong Performance** | Consistently exceeding expectations | 230+ |
| **📊 Meeting Expectations** | Solid performance meeting role requirements | 170+ |
| **⚠️ Partially Meeting** | Some performance gaps, needs improvement | 140+ |
| **❌ Underperforming** | Significant concerns requiring attention | <140 |

### Role-Level Structure

Performance targets are **role and level specific**:

- **IC (Individual Contributor)**: Levels 1-8
- **Manager**: Levels 4-8
- **Senior Manager**: Levels 6-8
- **Director**: Levels 7-8

### IOOI Framework

| Dimension | Description | Examples |
|-----------|-------------|----------|
| **Input (I)** | Activities you consume | Code reviews, meetings, training |
| **Output (O)** | Work you produce | Features, bug fixes, documentation |
| **Outcome (O)** | Results you achieve | Designs, proposals, decisions |
| **Impact (I)** | Influence you create | Mentoring, hiring, culture building |

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Database**: SQLite (local) + Turso (production)
- **ORM**: Prisma with hybrid client
- **Charts**: Recharts for data visualization
- **Deployment**: Vercel + Docker
- **Build Tools**: Make for simplified commands

## 📊 Usage Example

```typescript
// Define role-level performance target
const target = {
  name: "Senior Engineer L4",
  role: "IC",
  level: 4,
  outstandingThreshold: 300,
  strongThreshold: 230,
  meetingThreshold: 170,
  timePeriodWeeks: 12
}

// Calculate weighted score
const weeklyScore = calculateWeightedScore({
  input: 45,      // Code reviews, meetings
  output: 85,     // Features, bug fixes  
  outcome: 60,    // Design docs, proposals
  impact: 30      // Mentoring, hiring
}, roleWeights); // Role-specific weights

// Result: Performance level assessment
```

## 🔧 Development

### Make Commands
```bash
make setup          # Complete project setup
make dev           # Start development server
make build         # Build for production
make db-push       # Push schema changes
make db-studio     # Open Prisma Studio
make docker-deploy # Deploy with Docker
make clean         # Clean artifacts
```

### Database Management
```bash
make db-seed                    # Seed local database
make seed-category-templates    # Seed production templates
make db-reset                   # Reset database (WARNING: deletes data)
```

## 🧠 Smart Insights

PerfMirror analyzes your performance data to provide intelligent feedback:

### Expectation Coverage Analysis
- **🌟 Consistently Evidenced**: Activity in 3+ recent weeks
- **✅ Evidenced**: Some matching activity logged
- **⚠️ Not Yet Evidenced**: No related activity found

### Growth Suggestions
- **🌟 Emerging Strength**: Already showing next-level capabilities
- **⚠️ Growth Area**: Opportunities for development

The system matches your logged work against role-level expectations using keyword analysis and provides actionable recommendations for career progression.

## 📚 Documentation

### Getting Started
- **[Getting Started Guide](docs/GETTING_STARTED.md)** - Setup and first-time usage
- **[Data Seeding Guide](docs/DATA_SEEDING.md)** - Populating your database

### Core Concepts
- **[Performance Logic](docs/PERFORMANCE_LOGIC.md)** - IOOI framework and scoring
- **[Database Schema](docs/DATABASE_SCHEMA.md)** - Data models and relationships
- **[API Reference](docs/API_REFERENCE.md)** - Complete API documentation

### Deployment
- **[Development Guide](docs/DEVELOPMENT.md)** - Local development workflows
- **[Docker Guide](docs/DOCKER.md)** - Containerization options
- **[Production Deployment](docs/PRODUCTION_DEPLOYMENT.md)** - Production setup

## 🆕 Recent Updates

### v3.0.0 - Role-Level Performance System
- 🎯 5-band performance evaluation with color-coded levels
- 📋 Role-specific performance targets and expectations
- 🧭 Enhanced Smart Insights with expectation coverage analysis
- 🏷️ Comprehensive category templates for all role/level combinations
- 📊 Improved dashboard with performance band visualization

### v2.1.0 - Dynamic Evaluation Periods
- 🎯 Configurable time periods (1-52 weeks)
- 📊 Dynamic dashboard adjustments
- 📅 Clear period indicators

### v2.0.0 - Production Ready
- 🌐 Hybrid database architecture
- 🐳 Complete Docker support
- ⚡ Performance optimizations

## 🔗 Resources

- **[IOOI Framework Blog Post](https://vtorosyan.github.io/performance-reviews-quantification/)** - Methodology deep dive
- **[Engineering Manager Performance](https://vtorosyan.github.io/engineering-manager-performance/)** - Manager-specific guidance
- **[GitHub Repository](https://github.com/yourusername/perf-mirror)** - Source code and issues

## 🤝 Contributing

Contributions welcome! See our [Contributing Guide](docs/CONTRIBUTING.md) for development setup, coding standards, and pull request process.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**Built with ❤️ for engineering teams who believe in data-driven performance tracking.**

## 🧠 Enhanced Smart Insights & Growth Suggestions

PerfMirror v3.0 introduces intelligent role-level performance insights that help users understand how their work aligns with expectations and identify growth opportunities.

### Smart Insights Algorithm

The Enhanced Smart Insights system analyzes your performance data across multiple dimensions:

#### 1. **Expectation Coverage Analysis (Current Level)**
- **Data Source**: Matches your logged work activities against role-level expectations defined in the system
- **Analysis Period**: Last 4 weeks of activity data
- **Matching Logic**: 
  - Extracts keywords from expectation text (removes common words like "should", "must", "the")
  - Matches expectations to work categories using category names and descriptions
  - Supports partial matching and semantic similarity

#### 2. **Evidence Classification**
Your current level expectations are classified as:
- **🌟 Consistently Evidenced**: Activity logged in 3+ recent weeks
- **✅ Evidenced**: Some activity logged in matching categories
- **⚠️ Not Yet Evidenced**: No related activity found

#### 3. **Growth Suggestions (Next Level)**
- **Forward-Looking Analysis**: Examines expectations for your next career level
- **Gap Identification**: Compares current activity patterns against next-level requirements
- **Status Classification**:
  - **🌟 Emerging Strength**: Already showing some activity in next-level areas
  - **⚠️ Growth Area**: No current evidence of next-level capabilities

#### 4. **Actionable Recommendations**
The system generates contextual suggestions based on:
- **Role-Specific Guidance**: Tailored advice for IC, Manager, Senior Manager, Director roles
- **Category-Based Actions**: Specific work types to focus on (mentoring, architecture, strategy)
- **Dimension Alignment**: Recommendations aligned with IOOI framework (Input, Output, Outcome, Impact)

### Example Smart Insights Output

```
🧭 Expectation Coverage (IC L4):
• ✅ Participates in architecture reviews → Active in 1 week recently
• 🌟 Completes features independently → Active in 4 weeks recently  
• ⚠️ Leads design discussions → Try logging work in: Technical Leadership, Design Reviews

🚀 Growth Suggestions (Next Level: IC L5):
• 🌟 Mentoring junior developers — Great start! Keep building on your mentoring work.
• ⚠️ Technical strategy contribution → Engage in strategic planning sessions or contribute to technical roadmap discussions
• ⚠️ Cross-team coordination → Take on cross-team projects or coordinate with other engineering teams
```

### Algorithm Benefits

- **No AI/NLP Dependency**: Uses deterministic keyword matching and category alignment
- **Transparent Logic**: Clear, explainable matching rules
- **Real-Time Feedback**: Updates automatically as you log work
- **Career Guidance**: Provides specific, actionable advice for career progression
- **Role Awareness**: Understands different expectations across roles and levels

### Configuration

Smart Insights requires:
1. **User Profile**: Active role and level configuration
2. **Level Expectations**: Defined expectations for current and next levels
3. **Category Templates**: Work categories mapped to role levels and IOOI dimensions
4. **Activity Data**: Recent work logs to analyze against expectations

The system gracefully handles missing data and provides helpful fallback suggestions when specific matching rules don't apply.

## 🎯 Performance Evaluation System 