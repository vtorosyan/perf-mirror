const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Level expectations for each role and level
const levelExpectations = [
  // IC Levels
  {
    role: 'IC',
    level: 1,
    expectations: [
      'Should learn and adapt to team processes quickly',
      'Should ask questions when unclear and seek guidance',
      'Should complete assigned tasks with support',
      'Should participate in team meetings and discussions'
    ]
  },
  {
    role: 'IC',
    level: 2,
    expectations: [
      'Should work independently on small tasks',
      'Should contribute to code reviews with basic feedback',
      'Should identify and escalate blockers appropriately',
      'Should demonstrate basic understanding of team goals'
    ]
  },
  {
    role: 'IC',
    level: 3,
    expectations: [
      'Should complete small- to medium-sized tasks reliably',
      'Should participate in code reviews regularly',
      'Should ask for support when blocked',
      'Should demonstrate basic ownership over their work',
      'Should contribute to team discussions with relevant insights'
    ]
  },
  {
    role: 'IC',
    level: 4,
    expectations: [
      'Should handle complex tasks independently',
      'Should provide thoughtful code review feedback',
      'Should mentor junior team members',
      'Should drive small projects from conception to completion',
      'Should identify and propose process improvements'
    ]
  },
  {
    role: 'IC',
    level: 5,
    expectations: [
      'Should lead technical initiatives and projects',
      'Should architect solutions for complex problems',
      'Should mentor and guide other engineers',
      'Should drive cross-team collaboration when needed',
      'Should contribute to technical strategy and roadmap',
      'Should identify and address technical debt proactively'
    ]
  },
  {
    role: 'IC',
    level: 6,
    expectations: [
      'Should lead large, complex technical initiatives',
      'Should set technical direction for the team',
      'Should influence engineering practices across teams',
      'Should identify and solve systemic technical challenges',
      'Should mentor other senior engineers',
      'Should drive significant architectural decisions'
    ]
  },
  {
    role: 'IC',
    level: 7,
    expectations: [
      'Should lead organization-wide technical initiatives',
      'Should drive technical strategy and vision',
      'Should influence engineering culture and practices',
      'Should solve complex, ambiguous technical problems',
      'Should mentor and develop other technical leaders',
      'Should represent the organization in technical discussions'
    ]
  },
  {
    role: 'IC',
    level: 8,
    expectations: [
      'Should set technical direction for the entire organization',
      'Should drive industry-leading technical innovations',
      'Should influence engineering practices across the industry',
      'Should solve the most complex technical challenges',
      'Should develop and mentor other principal engineers',
      'Should represent the organization as a technical thought leader'
    ]
  },
  // Manager Levels
  {
    role: 'Manager',
    level: 4,
    expectations: [
      'Should manage a small team effectively',
      'Should conduct regular 1:1s and provide feedback',
      'Should help team members grow and develop',
      'Should ensure team delivery against commitments',
      'Should collaborate with other teams and stakeholders'
    ]
  },
  {
    role: 'Manager',
    level: 5,
    expectations: [
      'Should manage larger teams or multiple teams',
      'Should develop and execute team strategy',
      'Should identify and develop high-potential team members',
      'Should drive cross-functional initiatives',
      'Should contribute to organizational planning and strategy',
      'Should manage team performance and address issues'
    ]
  },
  {
    role: 'Manager',
    level: 6,
    expectations: [
      'Should manage managers and larger organizations',
      'Should set strategic direction for their area',
      'Should drive organizational change and transformation',
      'Should develop other managers and leaders',
      'Should influence company-wide decisions',
      'Should represent the organization to external stakeholders'
    ]
  },
  {
    role: 'Manager',
    level: 7,
    expectations: [
      'Should lead large organizations or critical functions',
      'Should set company-wide strategic initiatives',
      'Should drive cultural change and transformation',
      'Should develop executive leadership pipeline',
      'Should influence industry practices and standards',
      'Should represent the company at the highest levels'
    ]
  },
  {
    role: 'Manager',
    level: 8,
    expectations: [
      'Should lead major business units or functions',
      'Should set company vision and strategy',
      'Should drive company-wide transformation',
      'Should develop other executives and leaders',
      'Should influence industry direction and standards',
      'Should represent the company as a thought leader'
    ]
  }
]

// Category templates for IC levels 1-2 (basic starter set)
const categoryTemplates = [
  // IC L1 Templates - Junior Developer
  {
    role: 'IC',
    level: 1,
    categoryName: 'Code Reviews',
    dimension: 'input',
    scorePerOccurrence: 3,
    expectedWeeklyCount: 5,
    description: 'Learning from code review feedback'
  },
  {
    role: 'IC',
    level: 1,
    categoryName: 'Bug Fixes',
    dimension: 'output',
    scorePerOccurrence: 5,
    expectedWeeklyCount: 4,
    description: 'Fixing simple bugs and issues'
  },
  {
    role: 'IC',
    level: 1,
    categoryName: 'Documentation Reading',
    dimension: 'input',
    scorePerOccurrence: 2,
    expectedWeeklyCount: 8,
    description: 'Reading technical documentation and learning materials'
  },
  {
    role: 'IC',
    level: 1,
    categoryName: 'Small Feature Implementation',
    dimension: 'output',
    scorePerOccurrence: 8,
    expectedWeeklyCount: 2,
    description: 'Implementing small, well-defined features'
  },
  {
    role: 'IC',
    level: 1,
    categoryName: 'Team Meetings',
    dimension: 'outcome',
    scorePerOccurrence: 3,
    expectedWeeklyCount: 6,
    description: 'Participating in team meetings and standups'
  },
  {
    role: 'IC',
    level: 1,
    categoryName: 'Learning Activities',
    dimension: 'impact',
    scorePerOccurrence: 4,
    expectedWeeklyCount: 3,
    description: 'Attending training sessions and learning new skills'
  },

  // IC L2 Templates - Junior Developer
  {
    role: 'IC',
    level: 2,
    categoryName: 'Code Reviews',
    dimension: 'input',
    scorePerOccurrence: 4,
    expectedWeeklyCount: 6,
    description: 'Providing basic code review feedback'
  },
  {
    role: 'IC',
    level: 2,
    categoryName: 'Feature Development',
    dimension: 'output',
    scorePerOccurrence: 10,
    expectedWeeklyCount: 3,
    description: 'Developing medium-complexity features'
  },
  {
    role: 'IC',
    level: 2,
    categoryName: 'Technical Research',
    dimension: 'input',
    scorePerOccurrence: 5,
    expectedWeeklyCount: 2,
    description: 'Researching technical solutions and approaches'
  },
  {
    role: 'IC',
    level: 2,
    categoryName: 'Bug Resolution',
    dimension: 'output',
    scorePerOccurrence: 6,
    expectedWeeklyCount: 4,
    description: 'Resolving more complex bugs independently'
  },
  {
    role: 'IC',
    level: 2,
    categoryName: 'Project Completion',
    dimension: 'outcome',
    scorePerOccurrence: 15,
    expectedWeeklyCount: 1,
    description: 'Completing assigned project milestones'
  },
  {
    role: 'IC',
    level: 2,
    categoryName: 'Team Collaboration',
    dimension: 'impact',
    scorePerOccurrence: 6,
    expectedWeeklyCount: 4,
    description: 'Collaborating effectively with team members'
  },

  // Manager Level 4 (Team Lead) Templates
  {
    role: 'Manager',
    level: 4,
    categoryName: 'Team Meetings',
    dimension: 'input',
    scorePerOccurrence: 2,
    expectedWeeklyCount: 3,
    description: 'Leading and participating in team meetings'
  },
  {
    role: 'Manager',
    level: 4,
    categoryName: '1-on-1 Sessions',
    dimension: 'outcome',
    scorePerOccurrence: 4,
    expectedWeeklyCount: 5,
    description: 'Regular 1-on-1 meetings with team members'
  },
  {
    role: 'Manager',
    level: 4,
    categoryName: 'Code Reviews',
    dimension: 'output',
    scorePerOccurrence: 3,
    expectedWeeklyCount: 8,
    description: 'Reviewing and approving team code'
  },
  {
    role: 'Manager',
    level: 4,
    categoryName: 'Team Planning',
    dimension: 'outcome',
    scorePerOccurrence: 5,
    expectedWeeklyCount: 2,
    description: 'Sprint planning and task assignment'
  },
  {
    role: 'Manager',
    level: 4,
    categoryName: 'Mentoring',
    dimension: 'impact',
    scorePerOccurrence: 6,
    expectedWeeklyCount: 3,
    description: 'Mentoring junior team members'
  },
  {
    role: 'Manager',
    level: 4,
    categoryName: 'Process Improvement',
    dimension: 'impact',
    scorePerOccurrence: 8,
    expectedWeeklyCount: 1,
    description: 'Improving team processes and workflows'
  },

  // Manager Level 5 (Manager) Templates
  {
    role: 'Manager',
    level: 5,
    categoryName: 'Strategic Planning',
    dimension: 'impact',
    scorePerOccurrence: 10,
    expectedWeeklyCount: 2,
    description: 'Long-term strategic planning for the team'
  },
  {
    role: 'Manager',
    level: 5,
    categoryName: 'Cross-team Collaboration',
    dimension: 'outcome',
    scorePerOccurrence: 6,
    expectedWeeklyCount: 3,
    description: 'Coordinating with other teams and stakeholders'
  },
  {
    role: 'Manager',
    level: 5,
    categoryName: 'Performance Reviews',
    dimension: 'outcome',
    scorePerOccurrence: 8,
    expectedWeeklyCount: 1,
    description: 'Conducting performance evaluations'
  },
  {
    role: 'Manager',
    level: 5,
    categoryName: 'Hiring & Interviews',
    dimension: 'impact',
    scorePerOccurrence: 10,
    expectedWeeklyCount: 2,
    description: 'Recruiting and interviewing candidates'
  },
  {
    role: 'Manager',
    level: 5,
    categoryName: 'Budget Planning',
    dimension: 'impact',
    scorePerOccurrence: 12,
    expectedWeeklyCount: 1,
    description: 'Managing team budget and resources'
  },
  {
    role: 'Manager',
    level: 5,
    categoryName: 'Stakeholder Communication',
    dimension: 'outcome',
    scorePerOccurrence: 5,
    expectedWeeklyCount: 4,
    description: 'Regular updates to leadership and stakeholders'
  },

  // Manager Level 6 (Senior Manager) Templates
  {
    role: 'Manager',
    level: 6,
    categoryName: 'Organizational Strategy',
    dimension: 'impact',
    scorePerOccurrence: 15,
    expectedWeeklyCount: 2,
    description: 'Contributing to organizational strategy and vision'
  },
  {
    role: 'Manager',
    level: 6,
    categoryName: 'Leadership Development',
    dimension: 'impact',
    scorePerOccurrence: 12,
    expectedWeeklyCount: 2,
    description: 'Developing other managers and leaders'
  },
  {
    role: 'Manager',
    level: 6,
    categoryName: 'Cross-functional Projects',
    dimension: 'outcome',
    scorePerOccurrence: 10,
    expectedWeeklyCount: 3,
    description: 'Leading cross-functional initiatives'
  },
  {
    role: 'Manager',
    level: 6,
    categoryName: 'Executive Reporting',
    dimension: 'output',
    scorePerOccurrence: 8,
    expectedWeeklyCount: 2,
    description: 'Reporting to executive leadership'
  },
  {
    role: 'Manager',
    level: 6,
    categoryName: 'Culture Building',
    dimension: 'impact',
    scorePerOccurrence: 10,
    expectedWeeklyCount: 2,
    description: 'Building and maintaining team culture'
  },
  {
    role: 'Manager',
    level: 6,
    categoryName: 'Risk Management',
    dimension: 'outcome',
    scorePerOccurrence: 8,
    expectedWeeklyCount: 1,
    description: 'Identifying and mitigating risks'
  },

  // Manager Level 7 (Director) Templates
  {
    role: 'Manager',
    level: 7,
    categoryName: 'Vision Setting',
    dimension: 'impact',
    scorePerOccurrence: 20,
    expectedWeeklyCount: 1,
    description: 'Setting long-term vision and direction'
  },
  {
    role: 'Manager',
    level: 7,
    categoryName: 'Board Communication',
    dimension: 'impact',
    scorePerOccurrence: 15,
    expectedWeeklyCount: 1,
    description: 'Communicating with board and investors'
  },
  {
    role: 'Manager',
    level: 7,
    categoryName: 'Department Strategy',
    dimension: 'impact',
    scorePerOccurrence: 18,
    expectedWeeklyCount: 2,
    description: 'Developing department-wide strategy'
  },
  {
    role: 'Manager',
    level: 7,
    categoryName: 'Executive Decisions',
    dimension: 'impact',
    scorePerOccurrence: 25,
    expectedWeeklyCount: 3,
    description: 'Making critical business decisions'
  },
  {
    role: 'Manager',
    level: 7,
    categoryName: 'Industry Leadership',
    dimension: 'impact',
    scorePerOccurrence: 12,
    expectedWeeklyCount: 1,
    description: 'Representing company in industry events'
  },
  {
    role: 'Manager',
    level: 7,
    categoryName: 'Organizational Change',
    dimension: 'impact',
    scorePerOccurrence: 20,
    expectedWeeklyCount: 1,
    description: 'Leading major organizational changes'
  },

  // Manager Level 8 (VP/Executive) Templates
  {
    role: 'Manager',
    level: 8,
    categoryName: 'Corporate Strategy',
    dimension: 'impact',
    scorePerOccurrence: 30,
    expectedWeeklyCount: 2,
    description: 'Defining corporate strategy and vision'
  },
  {
    role: 'Manager',
    level: 8,
    categoryName: 'Market Analysis',
    dimension: 'impact',
    scorePerOccurrence: 20,
    expectedWeeklyCount: 1,
    description: 'Analyzing market trends and opportunities'
  },
  {
    role: 'Manager',
    level: 8,
    categoryName: 'Investor Relations',
    dimension: 'impact',
    scorePerOccurrence: 25,
    expectedWeeklyCount: 1,
    description: 'Managing investor and stakeholder relations'
  },
  {
    role: 'Manager',
    level: 8,
    categoryName: 'Executive Leadership',
    dimension: 'impact',
    scorePerOccurrence: 35,
    expectedWeeklyCount: 3,
    description: 'Leading executive team and company direction'
  },
  {
    role: 'Manager',
    level: 8,
    categoryName: 'Industry Partnerships',
    dimension: 'impact',
    scorePerOccurrence: 20,
    expectedWeeklyCount: 1,
    description: 'Building strategic industry partnerships'
  },
  {
    role: 'Manager',
    level: 8,
    categoryName: 'Company Culture',
    dimension: 'impact',
    scorePerOccurrence: 15,
    expectedWeeklyCount: 2,
    description: 'Shaping company-wide culture and values'
  }
]

// Default role weights
const roleWeights = [
  {
    name: 'IC General Weights',
    role: 'IC',
    level: null,
    inputWeight: 0.30,
    outputWeight: 0.40,
    outcomeWeight: 0.20,
    impactWeight: 0.10,
    isActive: false
  },
  {
    name: 'Manager General Weights',
    role: 'Manager',
    level: null,
    inputWeight: 0.20,
    outputWeight: 0.30,
    outcomeWeight: 0.30,
    impactWeight: 0.20,
    isActive: false
  }
]

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data
  console.log('🧹 Clearing existing data...')
  await prisma.performanceTarget.deleteMany({})
  await prisma.roleWeights.deleteMany({})
  await prisma.userProfile.deleteMany({})
  await prisma.weeklyLog.deleteMany({})
  await prisma.category.deleteMany({})

  // Seed level expectations
  console.log('📝 Seeding level expectations...')
  for (const expectation of levelExpectations) {
    try {
      const existing = await prisma.levelExpectation.findUnique({
        where: {
          role_level: {
            role: expectation.role,
            level: expectation.level
          }
        }
      })
      
      if (existing) {
        console.log(`⏭️  Skipping existing: ${expectation.role} L${expectation.level}`)
        continue
      }
      
      await prisma.levelExpectation.create({
        data: {
          role: expectation.role,
          level: expectation.level,
          expectations: JSON.stringify(expectation.expectations)
        }
      })
      
      console.log(`✅ Created: ${expectation.role} L${expectation.level}`)
    } catch (error) {
      console.error(`❌ Failed to create ${expectation.role} L${expectation.level}:`, error.message)
    }
  }
  
  // Seed category templates
  console.log('🏷️  Seeding category templates...')
  for (const template of categoryTemplates) {
    try {
      const existing = await prisma.categoryTemplate.findUnique({
        where: {
          role_level_categoryName: {
            role: template.role,
            level: template.level,
            categoryName: template.categoryName
          }
        }
      })
      
      if (existing) {
        console.log(`⏭️  Skipping existing: ${template.role} L${template.level} - ${template.categoryName}`)
        continue
      }
      
      await prisma.categoryTemplate.create({
        data: template
      })
      
      console.log(`✅ Created: ${template.role} L${template.level} - ${template.categoryName}`)
    } catch (error) {
      console.error(`❌ Failed to create ${template.role} L${template.level} - ${template.categoryName}:`, error.message)
    }
  }
  
  // Seed role weights
  console.log('⚖️  Seeding role weights...')
  for (const weight of roleWeights) {
    try {
      // For role weights, we need to handle the case where level might be null
      const existing = await prisma.roleWeights.findFirst({
        where: {
          role: weight.role,
          level: weight.level,
          name: weight.name
        }
      })
      
      if (existing) {
        console.log(`⏭️  Skipping existing: ${weight.name}`)
        continue
      }
      
      await prisma.roleWeights.create({
        data: weight
      })
      
      console.log(`✅ Created: ${weight.name}`)
    } catch (error) {
      console.error(`❌ Failed to create ${weight.name}:`, error.message)
    }
  }
  
  // Seed categories
  console.log('📋 Seeding categories...')
  const categories = [
    { name: 'Code Reviews', scorePerOccurrence: 2, dimension: 'input', description: 'Reviewing code from team members' },
    { name: 'Pull Requests', scorePerOccurrence: 3, dimension: 'output', description: 'Creating and submitting pull requests' },
    { name: 'Documentation', scorePerOccurrence: 2, dimension: 'output', description: 'Writing technical documentation' },
    { name: 'Mentoring', scorePerOccurrence: 4, dimension: 'outcome', description: 'Mentoring junior team members' },
    { name: 'Bug Fixes', scorePerOccurrence: 3, dimension: 'output', description: 'Fixing bugs and issues' },
    { name: 'Feature Development', scorePerOccurrence: 5, dimension: 'outcome', description: 'Developing new features' },
    { name: 'Team Meetings', scorePerOccurrence: 1, dimension: 'input', description: 'Participating in team meetings' },
    { name: 'Process Improvement', scorePerOccurrence: 6, dimension: 'impact', description: 'Improving team processes and workflows' },
    { name: 'Learning Activities', scorePerOccurrence: 2, dimension: 'input', description: 'Learning new technologies and skills' },
    { name: 'Architecture Design', scorePerOccurrence: 8, dimension: 'impact', description: 'Designing system architecture' },
    { name: 'Testing', scorePerOccurrence: 2, dimension: 'output', description: 'Writing and executing tests' },
    { name: 'Deployment', scorePerOccurrence: 3, dimension: 'output', description: 'Deploying applications and services' }
  ]

  for (const category of categories) {
    await prisma.category.create({ data: category })
  }

  // Additional level-specific role weights with correct decimal values
  console.log('⚖️ Seeding additional level-specific role weights...')
  const additionalRoleWeights = [
    { name: 'IC Level 1 Weights', role: 'IC', level: 1, inputWeight: 0.40, outputWeight: 0.35, outcomeWeight: 0.20, impactWeight: 0.05, isActive: false },
    { name: 'IC Level 2 Weights', role: 'IC', level: 2, inputWeight: 0.35, outputWeight: 0.35, outcomeWeight: 0.25, impactWeight: 0.05, isActive: false },
    { name: 'IC Level 3 Weights', role: 'IC', level: 3, inputWeight: 0.30, outputWeight: 0.35, outcomeWeight: 0.25, impactWeight: 0.10, isActive: false },
    { name: 'IC Level 4 Weights (Mid)', role: 'IC', level: 4, inputWeight: 0.25, outputWeight: 0.35, outcomeWeight: 0.30, impactWeight: 0.10, isActive: false },
    { name: 'IC Level 5 Weights (Senior)', role: 'IC', level: 5, inputWeight: 0.20, outputWeight: 0.30, outcomeWeight: 0.35, impactWeight: 0.15, isActive: false },
    { name: 'IC Level 6 Weights (Senior)', role: 'IC', level: 6, inputWeight: 0.15, outputWeight: 0.25, outcomeWeight: 0.40, impactWeight: 0.20, isActive: false },
    { name: 'IC Level 7 Weights (Staff)', role: 'IC', level: 7, inputWeight: 0.10, outputWeight: 0.20, outcomeWeight: 0.40, impactWeight: 0.30, isActive: false },
    { name: 'IC Level 8 Weights (Principal)', role: 'IC', level: 8, inputWeight: 0.05, outputWeight: 0.15, outcomeWeight: 0.35, impactWeight: 0.45, isActive: false },
    { name: 'Manager Level 4 Weights (Team Lead)', role: 'Manager', level: 4, inputWeight: 0.25, outputWeight: 0.30, outcomeWeight: 0.35, impactWeight: 0.10, isActive: false },
    { name: 'Manager Level 5 Weights (Manager)', role: 'Manager', level: 5, inputWeight: 0.20, outputWeight: 0.25, outcomeWeight: 0.40, impactWeight: 0.15, isActive: false },
    { name: 'Manager Level 6 Weights (Senior)', role: 'Manager', level: 6, inputWeight: 0.15, outputWeight: 0.20, outcomeWeight: 0.40, impactWeight: 0.25, isActive: false },
    { name: 'Manager Level 7 Weights (Director)', role: 'Manager', level: 7, inputWeight: 0.10, outputWeight: 0.15, outcomeWeight: 0.35, impactWeight: 0.40, isActive: false },
    { name: 'Manager Level 8 Weights (VP)', role: 'Manager', level: 8, inputWeight: 0.05, outputWeight: 0.10, outcomeWeight: 0.30, impactWeight: 0.55, isActive: false }
  ]

  for (const roleWeight of additionalRoleWeights) {
    try {
      const existing = await prisma.roleWeights.findFirst({
        where: {
          role: roleWeight.role,
          level: roleWeight.level,
          name: roleWeight.name
        }
      })
      
      if (existing) {
        console.log(`⏭️  Skipping existing: ${roleWeight.name}`)
        continue
      }
      
      await prisma.roleWeights.create({ data: roleWeight })
      console.log(`✅ Created: ${roleWeight.name}`)
    } catch (error) {
      console.error(`❌ Failed to create ${roleWeight.name}:`, error.message)
    }
  }

  // Seed IC performance targets
  console.log('🎯 Seeding IC performance targets...')
  const icPerformanceTargets = [
    { name: 'IC General Performance Target', role: 'IC', level: null, outstandingThreshold: 300, strongThreshold: 230, meetingThreshold: 170, partialThreshold: 140, underperformingThreshold: 120, timePeriodWeeks: 12, isActive: false },
    { name: 'IC Level 1 Performance Target', role: 'IC', level: 1, outstandingThreshold: 250, strongThreshold: 200, meetingThreshold: 150, partialThreshold: 120, underperformingThreshold: 100, timePeriodWeeks: 12, isActive: false },
    { name: 'IC Level 2 Performance Target', role: 'IC', level: 2, outstandingThreshold: 270, strongThreshold: 210, meetingThreshold: 160, partialThreshold: 130, underperformingThreshold: 110, timePeriodWeeks: 12, isActive: false },
    { name: 'IC Level 3 Performance Target', role: 'IC', level: 3, outstandingThreshold: 290, strongThreshold: 220, meetingThreshold: 165, partialThreshold: 135, underperformingThreshold: 115, timePeriodWeeks: 12, isActive: false },
    { name: 'IC Level 4 Performance Target (Mid)', role: 'IC', level: 4, outstandingThreshold: 310, strongThreshold: 240, meetingThreshold: 175, partialThreshold: 145, underperformingThreshold: 125, timePeriodWeeks: 12, isActive: false },
    { name: 'IC Level 5 Performance Target (Senior)', role: 'IC', level: 5, outstandingThreshold: 330, strongThreshold: 250, meetingThreshold: 180, partialThreshold: 150, underperformingThreshold: 130, timePeriodWeeks: 12, isActive: false },
    { name: 'IC Level 6 Performance Target (Senior)', role: 'IC', level: 6, outstandingThreshold: 350, strongThreshold: 270, meetingThreshold: 190, partialThreshold: 160, underperformingThreshold: 140, timePeriodWeeks: 12, isActive: false },
    { name: 'IC Level 7 Performance Target (Staff)', role: 'IC', level: 7, outstandingThreshold: 380, strongThreshold: 290, meetingThreshold: 200, partialThreshold: 170, underperformingThreshold: 150, timePeriodWeeks: 12, isActive: false },
    { name: 'IC Level 8 Performance Target (Principal)', role: 'IC', level: 8, outstandingThreshold: 420, strongThreshold: 320, meetingThreshold: 220, partialThreshold: 180, underperformingThreshold: 160, timePeriodWeeks: 12, isActive: false }
  ]

  for (const target of icPerformanceTargets) {
    await prisma.performanceTarget.create({ data: target })
  }

  // Seed Manager performance targets
  console.log('🎯 Seeding Manager performance targets...')
  const managerPerformanceTargets = [
    { name: 'Manager General Performance Target', role: 'Manager', level: null, outstandingThreshold: 320, strongThreshold: 250, meetingThreshold: 180, partialThreshold: 150, underperformingThreshold: 130, timePeriodWeeks: 12, isActive: false },
    { name: 'Manager Level 4 Performance Target (Team Lead)', role: 'Manager', level: 4, outstandingThreshold: 320, strongThreshold: 250, meetingThreshold: 180, partialThreshold: 150, underperformingThreshold: 130, timePeriodWeeks: 12, isActive: false },
    { name: 'Manager Level 5 Performance Target (Manager)', role: 'Manager', level: 5, outstandingThreshold: 350, strongThreshold: 270, meetingThreshold: 190, partialThreshold: 160, underperformingThreshold: 140, timePeriodWeeks: 12, isActive: false },
    { name: 'Manager Level 6 Performance Target (Senior)', role: 'Manager', level: 6, outstandingThreshold: 380, strongThreshold: 290, meetingThreshold: 200, partialThreshold: 170, underperformingThreshold: 150, timePeriodWeeks: 12, isActive: false },
    { name: 'Manager Level 7 Performance Target (Director)', role: 'Manager', level: 7, outstandingThreshold: 420, strongThreshold: 320, meetingThreshold: 220, partialThreshold: 180, underperformingThreshold: 160, timePeriodWeeks: 12, isActive: false },
    { name: 'Manager Level 8 Performance Target (VP)', role: 'Manager', level: 8, outstandingThreshold: 480, strongThreshold: 360, meetingThreshold: 250, partialThreshold: 200, underperformingThreshold: 180, timePeriodWeeks: 12, isActive: false }
  ]

  for (const target of managerPerformanceTargets) {
    await prisma.performanceTarget.create({ data: target })
  }

  console.log('✅ Database seeding completed successfully!')
  console.log('📊 Summary:')
  console.log('  - Level Expectations: 16')
  console.log('  - Category Templates: 36 (12 IC + 24 Manager)')
  console.log('  - Role Weights: 15 (9 IC + 6 Manager)')
  console.log('  - Performance Targets: 15 (9 IC + 6 Manager)')
  console.log('  - Categories: 12')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 