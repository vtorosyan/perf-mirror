# Performance Logic & IOOI Framework

## Overview

PerfMirror uses the **IOOI Framework** (Input, Output, Outcome, Impact) to provide a structured approach to performance tracking that goes beyond simple metrics. This framework helps engineers understand not just what they've done, but the value and influence of their work.

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

### Performance Level Mapping

| Level | Weekly Points | Quarterly Goal |
|-------|---------------|----------------|
| **Excellent** | 225+ | 2,700+ |
| **Good** | 170+ | 2,040+ |
| **Needs Improvement** | 120+ | 1,440+ |
| **Unsatisfactory** | <120 | <1,440 |

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

## Advanced Scoring Strategies

### For Individual Contributors

1. **Build Outcome Muscle**: Volunteer for design work even if not required
2. **Invest in Impact**: Find mentoring opportunities
3. **Balance Input**: Don't over-optimize meetings and learning
4. **Quality Over Quantity**: Better to do fewer things well

### For Managers

1. **Delegate Output**: Enable others rather than doing yourself
2. **Maximize Outcome**: Focus on decisions that unblock multiple people
3. **Amplify Impact**: Scale your influence through others
4. **Strategic Input**: Choose learning that benefits the team

### For Senior Leaders

1. **Systems Thinking**: Focus on organizational outcomes
2. **Culture Building**: Invest heavily in impact activities
3. **Vision Setting**: Strategic outcomes that guide months of work
4. **People Development**: Build the next generation of leaders

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