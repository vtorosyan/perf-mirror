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

async function seedData() {
  try {
    console.log('🌱 Starting local database seeding...')
    
    let successCount = 0
    let skipCount = 0
    
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
          skipCount++
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
        successCount++
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
          skipCount++
          continue
        }
        
        await prisma.categoryTemplate.create({
          data: template
        })
        
        console.log(`✅ Created: ${template.role} L${template.level} - ${template.categoryName}`)
        successCount++
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
          skipCount++
          continue
        }
        
        await prisma.roleWeights.create({
          data: weight
        })
        
        console.log(`✅ Created: ${weight.name}`)
        successCount++
      } catch (error) {
        console.error(`❌ Failed to create ${weight.name}:`, error.message)
      }
    }
    
    console.log('\n🎉 Local database seeding completed!')
    console.log(`📊 Summary:`)
    console.log(`   ✅ Created: ${successCount} records`)
    console.log(`   ⏭️  Skipped: ${skipCount} existing records`)
    console.log(`   📝 Total processed: ${successCount + skipCount}`)
    
    console.log('\n💡 Next steps:')
    console.log('   1. Run "npm run dev" to start the development server')
    console.log('   2. Visit http://localhost:3000 to use the application')
    console.log('   3. Check the Role Setup tab to activate role weights')
    console.log('   4. Use the pre-seeded category templates or create your own')
    
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seedData() 