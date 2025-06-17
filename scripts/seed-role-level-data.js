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

// Category templates for specific levels
const categoryTemplates = [
  // IC L3 Templates
  {
    role: 'IC',
    level: 3,
    categoryName: 'Code Reviews',
    dimension: 'input',
    scorePerOccurrence: 5,
    expectedWeeklyCount: 8,
    description: 'Providing feedback on code changes'
  },
  {
    role: 'IC',
    level: 3,
    categoryName: 'Feature Development',
    dimension: 'output',
    scorePerOccurrence: 15,
    expectedWeeklyCount: 2,
    description: 'Completing feature development tasks'
  },
  {
    role: 'IC',
    level: 3,
    categoryName: 'Bug Fixes',
    dimension: 'output',
    scorePerOccurrence: 8,
    expectedWeeklyCount: 3,
    description: 'Resolving software defects'
  },
  {
    role: 'IC',
    level: 3,
    categoryName: 'Team Meetings',
    dimension: 'input',
    scorePerOccurrence: 3,
    expectedWeeklyCount: 5,
    description: 'Participating in team meetings and discussions'
  },
  {
    role: 'IC',
    level: 3,
    categoryName: 'User Story Completion',
    dimension: 'outcome',
    scorePerOccurrence: 20,
    expectedWeeklyCount: 2,
    description: 'Delivering completed user stories'
  },
  
  // IC L5 Templates
  {
    role: 'IC',
    level: 5,
    categoryName: 'Technical Design',
    dimension: 'output',
    scorePerOccurrence: 25,
    expectedWeeklyCount: 1,
    description: 'Creating technical designs and architecture'
  },
  {
    role: 'IC',
    level: 5,
    categoryName: 'Code Review Leadership',
    dimension: 'input',
    scorePerOccurrence: 8,
    expectedWeeklyCount: 10,
    description: 'Leading code review processes'
  },
  {
    role: 'IC',
    level: 5,
    categoryName: 'Mentoring Sessions',
    dimension: 'input',
    scorePerOccurrence: 10,
    expectedWeeklyCount: 3,
    description: 'Mentoring junior engineers'
  },
  {
    role: 'IC',
    level: 5,
    categoryName: 'Project Delivery',
    dimension: 'outcome',
    scorePerOccurrence: 40,
    expectedWeeklyCount: 0.5,
    description: 'Delivering complex projects'
  },
  {
    role: 'IC',
    level: 5,
    categoryName: 'Cross-team Collaboration',
    dimension: 'input',
    scorePerOccurrence: 15,
    expectedWeeklyCount: 2,
    description: 'Collaborating with other teams'
  },
  {
    role: 'IC',
    level: 5,
    categoryName: 'Technical Innovation',
    dimension: 'impact',
    scorePerOccurrence: 50,
    expectedWeeklyCount: 0.25,
    description: 'Driving technical innovation and improvements'
  },
  
  // IC L7 Templates
  {
    role: 'IC',
    level: 7,
    categoryName: 'Technical Strategy',
    dimension: 'impact',
    scorePerOccurrence: 75,
    expectedWeeklyCount: 0.5,
    description: 'Defining technical strategy and direction'
  },
  {
    role: 'IC',
    level: 7,
    categoryName: 'Architecture Reviews',
    dimension: 'input',
    scorePerOccurrence: 20,
    expectedWeeklyCount: 3,
    description: 'Reviewing and approving architectural decisions'
  },
  {
    role: 'IC',
    level: 7,
    categoryName: 'Senior Mentoring',
    dimension: 'input',
    scorePerOccurrence: 15,
    expectedWeeklyCount: 4,
    description: 'Mentoring senior engineers and tech leads'
  },
  {
    role: 'IC',
    level: 7,
    categoryName: 'Organizational Initiatives',
    dimension: 'impact',
    scorePerOccurrence: 100,
    expectedWeeklyCount: 0.25,
    description: 'Leading organization-wide technical initiatives'
  },
  {
    role: 'IC',
    level: 7,
    categoryName: 'External Representation',
    dimension: 'impact',
    scorePerOccurrence: 30,
    expectedWeeklyCount: 1,
    description: 'Representing the organization externally'
  },
  
  // Manager L4 Templates
  {
    role: 'Manager',
    level: 4,
    categoryName: 'One-on-Ones',
    dimension: 'input',
    scorePerOccurrence: 10,
    expectedWeeklyCount: 6,
    description: 'Conducting regular 1:1 meetings with team members'
  },
  {
    role: 'Manager',
    level: 4,
    categoryName: 'Team Planning',
    dimension: 'output',
    scorePerOccurrence: 15,
    expectedWeeklyCount: 2,
    description: 'Planning team work and priorities'
  },
  {
    role: 'Manager',
    level: 4,
    categoryName: 'Performance Reviews',
    dimension: 'input',
    scorePerOccurrence: 20,
    expectedWeeklyCount: 0.5,
    description: 'Conducting performance reviews and feedback'
  },
  {
    role: 'Manager',
    level: 4,
    categoryName: 'Team Deliverables',
    dimension: 'outcome',
    scorePerOccurrence: 30,
    expectedWeeklyCount: 1,
    description: 'Ensuring team meets delivery commitments'
  },
  {
    role: 'Manager',
    level: 4,
    categoryName: 'Stakeholder Meetings',
    dimension: 'input',
    scorePerOccurrence: 12,
    expectedWeeklyCount: 3,
    description: 'Meeting with stakeholders and partners'
  },
  
  // Manager L6 Templates
  {
    role: 'Manager',
    level: 6,
    categoryName: 'Strategic Planning',
    dimension: 'impact',
    scorePerOccurrence: 50,
    expectedWeeklyCount: 1,
    description: 'Developing strategic plans and initiatives'
  },
  {
    role: 'Manager',
    level: 6,
    categoryName: 'Manager Development',
    dimension: 'input',
    scorePerOccurrence: 25,
    expectedWeeklyCount: 2,
    description: 'Developing and mentoring other managers'
  },
  {
    role: 'Manager',
    level: 6,
    categoryName: 'Cross-functional Leadership',
    dimension: 'input',
    scorePerOccurrence: 20,
    expectedWeeklyCount: 4,
    description: 'Leading cross-functional initiatives'
  },
  {
    role: 'Manager',
    level: 6,
    categoryName: 'Organizational Change',
    dimension: 'impact',
    scorePerOccurrence: 75,
    expectedWeeklyCount: 0.5,
    description: 'Driving organizational change and transformation'
  },
  {
    role: 'Manager',
    level: 6,
    categoryName: 'Executive Reporting',
    dimension: 'output',
    scorePerOccurrence: 30,
    expectedWeeklyCount: 1,
    description: 'Reporting to executives and leadership'
  },
  
  // Manager L8 Templates
  {
    role: 'Manager',
    level: 8,
    categoryName: 'Company Vision',
    dimension: 'impact',
    scorePerOccurrence: 100,
    expectedWeeklyCount: 0.5,
    description: 'Setting and communicating company vision'
  },
  {
    role: 'Manager',
    level: 8,
    categoryName: 'Board Meetings',
    dimension: 'input',
    scorePerOccurrence: 50,
    expectedWeeklyCount: 0.25,
    description: 'Participating in board meetings and governance'
  },
  {
    role: 'Manager',
    level: 8,
    categoryName: 'Executive Team Leadership',
    dimension: 'input',
    scorePerOccurrence: 40,
    expectedWeeklyCount: 2,
    description: 'Leading executive team meetings and decisions'
  },
  {
    role: 'Manager',
    level: 8,
    categoryName: 'Industry Leadership',
    dimension: 'impact',
    scorePerOccurrence: 75,
    expectedWeeklyCount: 0.5,
    description: 'Representing company in industry forums'
  },
  {
    role: 'Manager',
    level: 8,
    categoryName: 'Company Transformation',
    dimension: 'impact',
    scorePerOccurrence: 150,
    expectedWeeklyCount: 0.25,
    description: 'Driving major company-wide transformations'
  }
]

async function seedData() {
  try {
    console.log('🌱 Starting to seed role-level data...')
    
    // Seed level expectations
    console.log('📝 Seeding level expectations...')
    for (const expectation of levelExpectations) {
      await prisma.levelExpectation.upsert({
        where: {
          role_level: {
            role: expectation.role,
            level: expectation.level
          }
        },
        update: {
          expectations: JSON.stringify(expectation.expectations)
        },
        create: {
          role: expectation.role,
          level: expectation.level,
          expectations: JSON.stringify(expectation.expectations)
        }
      })
    }
    
    // Seed category templates
    console.log('📋 Seeding category templates...')
    for (const template of categoryTemplates) {
      await prisma.categoryTemplate.upsert({
        where: {
          role_level_categoryName: {
            role: template.role,
            level: template.level,
            categoryName: template.categoryName
          }
        },
        update: {
          dimension: template.dimension,
          scorePerOccurrence: template.scorePerOccurrence,
          expectedWeeklyCount: template.expectedWeeklyCount,
          description: template.description
        },
        create: {
          role: template.role,
          level: template.level,
          categoryName: template.categoryName,
          dimension: template.dimension,
          scorePerOccurrence: template.scorePerOccurrence,
          expectedWeeklyCount: template.expectedWeeklyCount,
          description: template.description
        }
      })
    }
    
    console.log('✅ Successfully seeded role-level data!')
    console.log(`📊 Seeded ${levelExpectations.length} level expectations`)
    console.log(`📋 Seeded ${categoryTemplates.length} category templates`)
    
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedData()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  }) 