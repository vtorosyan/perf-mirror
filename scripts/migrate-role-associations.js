const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function migrateRoleWeights() {
  console.log('🔄 Migrating existing RoleWeights to include role associations...')
  
  // Get all existing role weights
  const existingWeights = await prisma.$queryRaw`SELECT * FROM RoleWeights`
  console.log(`📊 Found ${existingWeights.length} existing role weight records`)
  
  // Check if already migrated
  if (existingWeights.length > 0 && existingWeights[0].role) {
    console.log('✅ RoleWeights already migrated, skipping...')
    return
  }
  
  // Mapping existing names to roles
  const roleMapping = {
    'Engineer': { role: 'IC', level: null, name: 'IC General Weights' },
    'Senior Engineer': { role: 'IC', level: 5, name: 'IC L5 Weights' },
    'Manager': { role: 'Manager', level: null, name: 'Manager General Weights' },
    'Senior Manager': { role: 'Manager', level: 6, name: 'Manager L6 Weights' },
    'Director': { role: 'Manager', level: 8, name: 'Manager L8 Weights' },
    'Custom': { role: 'IC', level: null, name: 'IC Custom Weights' }
  }
  
  // Add role and level columns if they don't exist
  try {
    await prisma.$executeRaw`ALTER TABLE RoleWeights ADD COLUMN role TEXT`
    await prisma.$executeRaw`ALTER TABLE RoleWeights ADD COLUMN level INTEGER`
  } catch (error) {
    console.log('⚠️ Columns may already exist:', error.message)
  }
  
  // Update each record
  for (const weight of existingWeights) {
    const mapping = roleMapping[weight.name] || { role: 'IC', level: null, name: weight.name }
    
    await prisma.$executeRaw`
      UPDATE RoleWeights 
      SET role = ${mapping.role}, 
          level = ${mapping.level}, 
          name = ${mapping.name}
      WHERE id = ${weight.id}
    `
    
    console.log(`✅ Updated ${weight.name} → ${mapping.role} L${mapping.level || 'All'}: ${mapping.name}`)
  }
}

async function migratePerformanceTargets() {
  console.log('🔄 Migrating existing PerformanceTargets to include role associations...')
  
  // Get all existing targets
  const existingTargets = await prisma.$queryRaw`SELECT * FROM PerformanceTarget`
  console.log(`📊 Found ${existingTargets.length} existing performance target records`)
  
  // Check if already migrated
  if (existingTargets.length > 0 && existingTargets[0].role) {
    console.log('✅ PerformanceTargets already migrated, skipping...')
    return
  }
  
  // Add role and level columns if they don't exist
  try {
    await prisma.$executeRaw`ALTER TABLE PerformanceTarget ADD COLUMN role TEXT`
    await prisma.$executeRaw`ALTER TABLE PerformanceTarget ADD COLUMN level INTEGER`
  } catch (error) {
    console.log('⚠️ Columns may already exist:', error.message)
  }
  
  // Update each record - assign first to IC, then duplicate for Manager
  for (let i = 0; i < existingTargets.length; i++) {
    const target = existingTargets[i]
    
    if (i === 0) {
      // Update first target for IC
      await prisma.$executeRaw`
        UPDATE PerformanceTarget 
        SET role = 'IC', 
            level = NULL,
            name = 'IC Performance Target'
        WHERE id = ${target.id}
      `
      console.log(`✅ Updated ${target.name} → IC Performance Target`)
      
      // Create Manager equivalent
      const managerId = `${target.id}_manager`
      const managerName = 'Manager Performance Target'
      const managerRole = 'Manager'
      const excellentThreshold = Math.round(target.excellentThreshold * 1.2)
      const goodThreshold = Math.round(target.goodThreshold * 1.2)
      const needsImprovementThreshold = Math.round(target.needsImprovementThreshold * 1.2)
      
      await prisma.$executeRaw`
        INSERT INTO PerformanceTarget (id, name, role, level, excellentThreshold, goodThreshold, needsImprovementThreshold, timePeriodWeeks, isActive, createdAt, updatedAt)
        VALUES (
          ${managerId},
          ${managerName},
          ${managerRole},
          NULL,
          ${excellentThreshold},
          ${goodThreshold},
          ${needsImprovementThreshold},
          ${target.timePeriodWeeks},
          false,
          datetime('now'),
          datetime('now')
        )
      `
      console.log(`✅ Created Manager Performance Target (scaled thresholds)`)
    } else {
      // Update other targets for Manager
      const newName = `Manager Performance Target ${i}`
      await prisma.$executeRaw`
        UPDATE PerformanceTarget 
        SET role = 'Manager', 
            level = NULL,
            name = ${newName}
        WHERE id = ${target.id}
      `
      console.log(`✅ Updated ${target.name} → Manager Performance Target ${i}`)
    }
  }
}

async function migrate() {
  try {
    console.log('🚀 Starting role association migration...')
    
    await migrateRoleWeights()
    await migratePerformanceTargets()
    
    console.log('✅ Migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

migrate()
  .catch((error) => {
    console.error('Fatal migration error:', error)
    process.exit(1)
  }) 