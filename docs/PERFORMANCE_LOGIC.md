# Performance Logic & IOOI Framework

## Overview

PerfMirror uses the **IOOI Framework** (Input, Output, Outcome, Impact) to provide a structured approach to performance tracking that goes beyond simple metrics. This framework helps engineers understand not just what they've done, but the value and influence of their work.

The system now features a comprehensive **5-band performance evaluation system** with **role-level performance targets** and **level expectations management** for precise, contextual performance assessment.

## The IOOI Framework Explained

### Input (I) - Activities You Consume

**Definition**: Work activities where you consume information, learn, or participate in collaborative processes.

**Characteristics**:
- **Receiving** information or knowledge
- **Participating** in discussions or meetings
- **Learning** new skills or technologies
- **Consuming** resources to build capability

**Examples**:
- **Code Reviews** (5 points) - Reviewing others' code, learning patterns
- **Meeting Participation** (3 points) - Attending standups, planning meetings
- **Training Sessions** (8 points) - Attending workshops, conferences
- **Documentation Reading** (2 points) - Studying technical specs, RFCs
- **Mentorship Received** (5 points) - One-on-one coaching sessions

**Why It Matters**: Input activities build your knowledge base and keep you connected to the team. While not directly producing value, they're essential for informed decision-making and continuous improvement.

### Output (O) - Work You Produce

**Definition**: Tangible deliverables and concrete work products that you create or complete.

**Characteristics**:
- **Creating** new features, fixes, or content
- **Completing** assigned tasks
- **Delivering** measurable work
- **Producing** artifacts

**Examples**:
- **Feature Development** (10 points) - Building new functionality
- **Bug Fixes** (3 points) - Resolving technical issues
- **Code Commits** (2 points) - Incremental development work
- **Test Coverage** (4 points) - Writing automated tests
- **Documentation Writing** (6 points) - Creating technical guides

**Why It Matters**: Output represents your direct productivity and execution capability. It's the most visible form of contribution but needs to be balanced with other dimensions for maximum impact.

### Outcome (O) - Results You Achieve

**Definition**: Strategic deliverables and decisions that shape direction, solve complex problems, or enable future work.

**Characteristics**:
- **Designing** solutions and architectures
- **Making** key technical decisions
- **Creating** strategic documents
- **Solving** complex problems

**Examples**:
- **Design Documents** (25 points) - Technical specifications, architecture
- **Technical Proposals** (20 points) - RFC documents, solution designs
- **Process Improvements** (15 points) - Workflow optimizations
- **Research & Analysis** (12 points) - Technical investigation, feasibility studies
- **Architecture Decisions** (30 points) - Major technical choices

**Why It Matters**: Outcomes demonstrate strategic thinking and problem-solving. They often have multiplier effects, enabling better outputs from the entire team.

### Impact (I) - Influence You Create

**Definition**: Activities that develop people, improve culture, or create lasting organizational value beyond immediate deliverables.

**Characteristics**:
- **Developing** other people
- **Influencing** team culture or practices
- **Building** organizational capability
- **Creating** lasting change

**Examples**:
- **Mentoring Sessions** (12 points) - Developing junior engineers
- **Hiring Interviews** (15 points) - Building the team
- **Tech Talks** (20 points) - Knowledge sharing, thought leadership
- **Open Source Contributions** (10 points) - Community building
- **Culture Building** (8 points) - Improving team dynamics

**Why It Matters**: Impact activities create multiplier effects that benefit the entire organization. They're often the difference between senior and staff+ level engineers.

## Role-Based Weighted Scoring

### Why Weighted Scoring?

Different roles require different balances of IOOI activities. A senior engineer should spend more time on Outcomes and Impact, while a junior engineer might focus more on Input and Output. The weighted scoring system reflects these expectations.

### Default Role Weights

#### Engineer (IC Focus)
- **Input**: 30% - High learning and collaboration
- **Output**: 40% - Primary focus on delivery
- **Outcome**: 20% - Some strategic work
- **Impact**: 10% - Limited mentoring/influence

*Rationale*: Early career focus on learning and delivery.

#### Manager (Team Focus)
- **Input**: 20% - Reduced individual learning
- **Output**: 40% - Still delivering, but through team
- **Outcome**: 30% - More strategic planning
- **Impact**: 10% - People development responsibility

*Rationale*: Balanced between delivery and strategy.

#### Senior Manager (Strategic Focus)
- **Input**: 15% - Less individual learning
- **Output**: 35% - Some direct output
- **Outcome**: 35% - Heavy strategic responsibility
- **Impact**: 15% - Significant people development

*Rationale*: Strategy and people development become primary.

#### Director (Leadership Focus)
- **Input**: 10% - Minimal individual learning
- **Output**: 25% - Limited direct output
- **Outcome**: 40% - Primary strategic driver
- **Impact**: 25% - Major organizational influence

*Rationale*: Focus shifts to vision, strategy, and organizational impact.

## Calculation Logic

### Weekly Score Formula

```typescript
weeklyScore = (
  (inputPoints * inputWeight) +
  (outputPoints * outputWeight) +
  (outcomePoints * outcomeWeight) +
  (impactPoints * impactWeight)
)
```

### Example Calculation

For a **Manager** with activities:
- Input: 15 points (3 code reviews × 5)
- Output: 50 points (5 features × 10)
- Outcome: 40 points (2 design docs × 20)
- Impact: 24 points (2 mentoring sessions × 12)

**Calculation**:
```
weeklyScore = (15 × 0.20) + (50 × 0.40) + (40 × 0.30) + (24 × 0.10)
            = 3 + 20 + 12 + 2.4
            = 37.4 points
```

### Performance Level Mapping - Updated 5-Band System

PerfMirror now uses a comprehensive 5-band performance evaluation system that provides more nuanced feedback and aligns with modern performance management practices:

| Level | Score Range | Color | Description | Career Impact |
|-------|-------------|-------|-------------|---------------|
| **🌟 Outstanding** | 300+ | Green (Dark) | Exceptional performance exceeding all expectations | Promotion ready, top performer |
| **✅ Strong Performance** | 230+ | Green | Consistently exceeding expectations with high impact | Above expectations, growth trajectory |
| **📊 Meeting Expectations** | 170+ | Blue | Solid performance meeting all role requirements | Meets role requirements, stable performer |
| **⚠️ Partially Meeting Expectations** | 140+ | Yellow | Some gaps in performance, needs improvement | Development needed, coaching required |
| **❌ Underperforming** | <140 | Red | Significant performance concerns requiring immediate attention | Performance improvement plan needed |

### Role-Level Performance Targets

Performance targets are now **role and level specific**, allowing for more precise evaluation based on career progression and role expectations.

#### Target Structure
```typescript
interface PerformanceTarget {
  name: string
  role: 'IC' | 'Manager' | 'Senior Manager' | 'Director'
  level: number
  outstandingThreshold: number      // 300+ typically
  strongThreshold: number           // 230+ typically
  meetingThreshold: number          // 170+ typically
  partialThreshold: number          // 140+ typically
  underperformingThreshold: number  // 120+ typically
  timePeriodWeeks: number          // 1-52 weeks
  isActive: boolean
}
```

#### Role Categories and Levels

**Individual Contributor (IC)**
- **Level 1-2**: Junior/Mid-level engineers
- **Level 3-4**: Senior engineers
- **Level 5-6**: Staff/Principal engineers

**Manager**
- **Level 1-2**: Team leads, first-time managers
- **Level 3-4**: Experienced managers, senior managers

**Senior Manager**
- **Level 1-2**: Multi-team managers
- **Level 3**: Department heads

**Director**
- **Level 1-2**: Executive leadership

#### Example Targets by Role and Level

**IC Level 3 (Senior Engineer)**
```typescript
{
  name: "Senior Engineer L3 Target",
  role: "IC",
  level: 3,
  outstandingThreshold: 280,
  strongThreshold: 220,
  meetingThreshold: 160,
  partialThreshold: 130,
  underperformingThreshold: 110,
  timePeriodWeeks: 12
}
```

**Manager Level 2**
```typescript
{
  name: "Manager L2 Target", 
  role: "Manager",
  level: 2,
  outstandingThreshold: 320,
  strongThreshold: 250,
  meetingThreshold: 180,
  partialThreshold: 150,
  underperformingThreshold: 120,
  timePeriodWeeks: 12
}
```

### Level Expectations Management

Each role and level combination can have specific expectations defined and managed through the application.

#### Types of Expectations

**Behavioral Expectations**
- Communication and collaboration skills
- Leadership and influence
- Adaptability and learning mindset
- Cultural contribution

**Technical Expectations**
- Technical skills and knowledge depth
- Architectural thinking and design
- Code quality and best practices
- Problem-solving capabilities

**Impact Expectations**
- Scope of influence and responsibility
- Mentoring and knowledge sharing
- Strategic contribution
- Cross-functional collaboration

**Growth Expectations**
- Learning and development goals
- Career progression indicators
- Skill acquisition targets
- Leadership development

#### Example Level Expectations

**IC Level 4 (Senior Engineer) Expectations:**
- "Leads technical design for medium to large complexity projects"
- "Mentors junior and mid-level engineers, providing technical guidance"
- "Contributes to architectural decisions within team and adjacent team scope"
- "Demonstrates strong problem-solving and debugging skills across the stack"
- "Participates in hiring decisions and technical interviews"
- "Drives technical initiatives that improve team productivity"

**Manager Level 1 Expectations:**
- "Manages a team of 3-6 engineers effectively"
- "Conducts regular 1:1s and provides career development guidance"
- "Collaborates with product managers on roadmap planning"
- "Handles team conflict resolution and performance management"
- "Contributes to hiring and team building efforts"
- "Balances individual contribution with management responsibilities"

### Updated Performance Level Logic

```typescript
function getPerformanceLevel(score: number, target: PerformanceTarget): string {
  if (score >= target.outstandingThreshold) return 'Outstanding'
  if (score >= target.strongThreshold) return 'Strong Performance'
  if (score >= target.meetingThreshold) return 'Meeting Expectations'
  if (score >= target.partialThreshold) return 'Partially Meeting Expectations'
  return 'Underperforming'
}
```

### Updated Insight Generation

The system now provides more nuanced insights based on the 5-band system:

```typescript
function generateInsight(score: number, target: PerformanceTarget, level: string): string {
  switch (level) {
    case 'Outstanding':
      return `Exceptional work! You're performing at an outstanding level with ${score} points.`
    
    case 'Strong Performance':
      const pointsToOutstanding = target.outstandingThreshold - score
      return `Great performance! You need ${pointsToOutstanding} more points to reach Outstanding level.`
    
    case 'Meeting Expectations':
      const pointsToStrong = target.strongThreshold - score
      return `You're meeting expectations. ${pointsToStrong} more points to reach Strong Performance level.`
    
    case 'Partially Meeting Expectations':
      const pointsToMeeting = target.meetingThreshold - score
      return `You need ${pointsToMeeting} more points to fully meet expectations.`
    
    case 'Underperforming':
      const pointsNeeded = target.partialThreshold - score
      return `Focus up! You need ${pointsNeeded} more points to start meeting expectations.`
  }
}
```

## Smart Insights & Pattern Detection

### Pattern Recognition

The system analyzes your IOOI distribution to identify patterns:

#### High Input, Low Output
- **Pattern**: Lots of meetings/learning, few deliverables
- **Insight**: "You're consuming a lot of information but may need to focus more on execution"
- **Recommendation**: "Try time-boxing learning activities and setting daily output goals"

#### High Output, Low Outcome
- **Pattern**: Many features/fixes, few strategic deliverables
- **Insight**: "Strong execution but consider contributing more to technical direction"
- **Recommendation**: "Volunteer for design docs or technical proposals"

#### Low Impact (Senior+ Roles)
- **Pattern**: Good delivery but minimal mentoring/influence
- **Insight**: "Consider increasing your organizational impact through mentoring"
- **Recommendation**: "Take on a junior mentee or contribute to hiring"

### Trend Analysis

- **Weekly Trends**: Identify consistency issues
- **Monthly Patterns**: Spot seasonal variations
- **Role Progression**: Track growth in strategic activities

## Score Override Logic

### When to Use Overrides

1. **Exceptional Quality**: A simple bug fix that prevents a major outage
2. **Context Matters**: A 1-hour design doc that unlocks months of work
3. **Complexity Adjustment**: A technically challenging feature worth more than the base points
4. **Time Sensitivity**: Work done under tight deadlines

### Override Guidelines

- **Conservative Use**: Don't override more than 20% of activities
- **Document Reasoning**: Always include why the override is justified
- **Team Calibration**: Discuss patterns with your manager
- **Historical Context**: Consider how similar work was scored before

## Advanced Scoring Strategies - Updated for 5-Band System

### For Individual Contributors (All Levels)

**Level 1-2 (Junior/Mid-level)**
1. **Focus on Output and Input**: Build execution skills and learn from others
2. **Gradual Outcome Building**: Start taking on small design tasks
3. **Limited Impact Expected**: Focus on individual growth
4. **Target Range**: Meeting Expectations (170+) is excellent for early career

**Level 3-4 (Senior)**
1. **Balance Output and Outcome**: Strong execution plus strategic thinking
2. **Increase Impact**: Begin mentoring and technical leadership
3. **Quality Over Quantity**: Fewer, higher-impact deliverables
4. **Target Range**: Strong Performance (230+) expected, Outstanding (300+) for promotion

**Level 5-6 (Staff/Principal)**
1. **Outcome and Impact Focus**: Strategic technical leadership
2. **Multiply Team Effectiveness**: Enable others rather than doing yourself
3. **Organization-wide Influence**: Cross-team technical decisions
4. **Target Range**: Outstanding (300+) expected, with exceptional impact

### For Managers (All Levels)

**Level 1-2 (New/Experienced Managers)**
1. **Delegate Output**: Enable team execution rather than doing yourself
2. **Maximize Outcome**: Focus on decisions that unblock multiple people
3. **Build Impact**: Develop team members and improve processes
4. **Target Range**: Strong Performance (250+) with focus on team development

**Level 3-4 (Senior Managers)**
1. **Strategic Outcomes**: Multi-team coordination and planning
2. **Organizational Impact**: Culture building and process improvement
3. **People Development**: Building the next generation of leaders
4. **Target Range**: Outstanding (320+) with significant organizational impact

### Updated Performance Calibration

#### Quarterly Review Process
1. **Individual Assessment**: Self-evaluation against level expectations
2. **Manager Review**: Assessment of performance against role-level targets
3. **Peer Feedback**: 360-degree input on collaboration and impact
4. **Calibration Session**: Cross-team consistency in evaluation standards

#### Career Progression Indicators
- **Promotion Readiness**: Consistently Outstanding performance at current level
- **Lateral Movement**: Strong Performance with different skill emphasis
- **Development Needed**: Partially Meeting Expectations with coaching plan
- **Performance Improvement**: Underperforming with structured improvement plan

## Implementation Tips - Updated for New System

### Setting Up Role-Level Targets

1. **Define Role Categories**: Establish clear IC/Manager/Senior Manager/Director tracks
2. **Set Level Expectations**: Document specific expectations for each role-level combination
3. **Calibrate Thresholds**: Ensure thresholds are appropriate for each level's scope
4. **Regular Review**: Update targets and expectations as organization evolves

### Managing Level Expectations

1. **Collaborative Definition**: Work with team leads to define realistic expectations
2. **Regular Updates**: Review and update expectations quarterly
3. **Clear Communication**: Ensure all team members understand their level expectations
4. **Career Pathing**: Use expectations to guide promotion and development discussions

### Using the 5-Band System

1. **Avoid Grade Inflation**: Outstanding should be truly exceptional (top 10-15%)
2. **Normalize Meeting Expectations**: This should be the majority of performers (60-70%)
3. **Support Development**: Use Partially Meeting as coaching opportunity, not punishment
4. **Address Underperformance**: Create clear improvement plans for lowest band

## Common Misconceptions

### "Higher Points = Better Performance"
**Reality**: It's about the right balance for your role. A director spending 50% time on output might be optimizing for the wrong things.

### "I Should Maximize Every Category"
**Reality**: Focus on your role's weight distribution. It's okay to have low scores in areas that aren't your focus.

### "Output is Most Important"
**Reality**: Output without strategic direction (Outcome) or people development (Impact) limits long-term effectiveness.

### "I Need to Hit Every Weekly Target"
**Reality**: Look at trends over time. Some weeks will be lower due to vacation, illness, or project phases.

## Implementation Tips

### Getting Started

1. **Start Simple**: Begin with basic categories, add complexity over time
2. **Calibrate Weekly**: Review patterns and adjust categories as needed
3. **Team Alignment**: Discuss scoring approaches with peers and managers
4. **Regular Reviews**: Monthly retrospectives on scoring patterns

### Avoiding Gaming

1. **Focus on Value**: Points should reflect actual value, not gaming opportunities
2. **Quality Over Quantity**: Better to do fewer high-impact activities
3. **Honest Assessment**: Use overrides sparingly and honestly
4. **External Validation**: Regular calibration with managers and peers

### Cultural Integration

1. **Team Adoption**: Encourage (don't mandate) team-wide usage
2. **Manager Support**: Train managers on interpreting and coaching with IOOI data
3. **Career Development**: Use patterns to identify growth opportunities
4. **Performance Reviews**: Integrate IOOI insights into formal reviews

## Related Resources

- **[IOOI Framework Deep Dive](https://vtorosyan.github.io/performance-reviews-quantification/)
- **[IOOI Framework for Managers](https://vtorosyan.github.io/engineering-manager-performance/)**