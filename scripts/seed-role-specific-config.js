const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Default role weights for different roles and levels
const defaultRoleWeights = [
  // IC Role Weights
  {
    name: 'IC Junior (L1-L3) Weights',
    role: 'IC',
    level: null, // Applies to all IC levels
    inputWeight: 0.35,   // Higher input focus for learning
    outputWeight: 0.40,  // Strong output focus
    outcomeWeight: 0.20, // Some outcome responsibility
    impactWeight: 0.05,  // Limited impact scope
    isActive: false
  },
  {
    name: 'IC Senior (L5) Weights',
    role: 'IC',
    level: 5,
    inputWeight: 0.25,   // Balanced input
    outputWeight: 0.35,  // Strong output
    outcomeWeight: 0.25, // Outcome responsibility
    impactWeight: 0.15,  // Some impact activities
    isActive: false
  },
  {
    name: 'IC Principal (L7+) Weights',
    role: 'IC',
    level: 7,
    inputWeight: 0.20,   // Strategic input
    outputWeight: 0.25,  // Quality over quantity
    outcomeWeight: 0.25, // Strong outcome focus
    impactWeight: 0.30,  // High impact activities
    isActive: false
  },
  
  // Manager Role Weights
  {
    name: 'Manager Entry (L4-L5) Weights',
    role: 'Manager',
    level: null, // Applies to all Manager levels
    inputWeight: 0.40,   // High people/input focus
    outputWeight: 0.25,  // Team output management
    outcomeWeight: 0.25, // Team outcomes
    impactWeight: 0.10,  // Growing impact
    isActive: false
  },
  {
    name: 'Senior Manager (L6) Weights',
    role: 'Manager',
    level: 6,
    inputWeight: 0.35,   // People and strategic input
    outputWeight: 0.20,  // Less direct output
    outcomeWeight: 0.30, // Strong outcome responsibility
    impactWeight: 0.15,  // Organizational impact
    isActive: false
  },
  {
    name: 'Director+ (L8) Weights',
    role: 'Manager',
    level: 8,
    inputWeight: 0.30,   // Strategic and people input
    outputWeight: 0.15,  // Minimal direct output
    outcomeWeight: 0.25, // Team/org outcomes
    impactWeight: 0.30,  // High organizational impact
    isActive: false
  }
]

// Default performance targets for different roles
const defaultPerformanceTargets = [
  // IC Targets
  {
    name: 'IC Standard Performance Target',
    role: 'IC',
    level: null, // Applies to all IC levels
    excellentThreshold: 200,
    goodThreshold: 150,
    needsImprovementThreshold: 100,
    timePeriodWeeks: 4, // Monthly evaluation
    isActive: false
  },
  {
    name: 'IC Senior Performance Target',
    role: 'IC',
    level: 5,
    excellentThreshold: 250,
    goodThreshold: 190,
    needsImprovementThreshold: 130,
    timePeriodWeeks: 4,
    isActive: false
  },
  {
    name: 'IC Principal Performance Target',
    role: 'IC',
    level: 7,
    excellentThreshold: 300,
    goodThreshold: 230,
    needsImprovementThreshold: 160,
    timePeriodWeeks: 8, // Longer evaluation period for strategic work
    isActive: false
  },
  
  // Manager Targets
  {
    name: 'Manager Standard Performance Target',
    role: 'Manager',
    level: null, // Applies to all Manager levels
    excellentThreshold: 180,
    goodThreshold: 140,
    needsImprovementThreshold: 100,
    timePeriodWeeks: 4,
    isActive: false
  },
  {
    name: 'Senior Manager Performance Target',
    role: 'Manager',
    level: 6,
    excellentThreshold: 220,
    goodThreshold: 170,
    needsImprovementThreshold: 120,
    timePeriodWeeks: 6, // Bi-monthly for strategic oversight
    isActive: false
  },
  {
    name: 'Director Performance Target',
    role: 'Manager',
    level: 8,
    excellentThreshold: 250,
    goodThreshold: 190,
    needsImprovementThreshold: 130,
    timePeriodWeeks: 8, // Quarterly-ish for executive level
    isActive: false
  }
]

async function seedRoleSpecificConfig() {
  try {
    console.log('🌱 Seeding role-specific role weights and targets...')
    
    // Seed role weights
    console.log('⚖️ Seeding role weights...')
    for (const weightConfig of defaultRoleWeights) {
      try {
        const existing = await prisma.roleWeights.findFirst({
          where: {
            name: weightConfig.name,
            role: weightConfig.role,
            level: weightConfig.level
          }
        })
        
        if (!existing) {
          await prisma.roleWeights.create({
            data: weightConfig
          })
          console.log(`✅ Created: ${weightConfig.name}`)
        } else {
          console.log(`⏭️ Skipped: ${weightConfig.name} (already exists)`)
        }
      } catch (error) {
        console.log(`⚠️ Error creating ${weightConfig.name}:`, error.message)
      }
    }
    
    // Seed performance targets
    console.log('🎯 Seeding performance targets...')
    for (const targetConfig of defaultPerformanceTargets) {
      try {
        const existing = await prisma.performanceTarget.findFirst({
          where: {
            name: targetConfig.name,
            role: targetConfig.role,
            level: targetConfig.level
          }
        })
        
        if (!existing) {
          await prisma.performanceTarget.create({
            data: targetConfig
          })
          console.log(`✅ Created: ${targetConfig.name}`)
        } else {
          console.log(`⏭️ Skipped: ${targetConfig.name} (already exists)`)
        }
      } catch (error) {
        console.log(`⚠️ Error creating ${targetConfig.name}:`, error.message)
      }
    }
    
    console.log('✅ Role-specific configuration seeding completed!')
    console.log(`📊 Seeded ${defaultRoleWeights.length} role weight configurations`)
    console.log(`🎯 Seeded ${defaultPerformanceTargets.length} performance target configurations`)
    
  } catch (error) {
    console.error('❌ Error seeding role-specific config:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedRoleSpecificConfig()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  }) 