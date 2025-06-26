const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixNullRoles() {
  try {
    console.log('🔍 Checking for NULL role values...')
    
    // Check RoleWeights
    const nullRoleWeights = await prisma.$queryRaw`SELECT * FROM RoleWeights WHERE role IS NULL`
    console.log(`Found ${nullRoleWeights.length} RoleWeights with NULL roles`)
    
    for (const weight of nullRoleWeights) {
      await prisma.$executeRaw`UPDATE RoleWeights SET role = 'IC' WHERE id = ${weight.id}`
      console.log(`✅ Fixed RoleWeights ${weight.id}`)
    }
    
    // Check PerformanceTargets
    const nullRoleTargets = await prisma.$queryRaw`SELECT * FROM PerformanceTarget WHERE role IS NULL`
    console.log(`Found ${nullRoleTargets.length} PerformanceTargets with NULL roles`)
    
    for (const target of nullRoleTargets) {
      await prisma.$executeRaw`UPDATE PerformanceTarget SET role = 'IC' WHERE id = ${target.id}`
      console.log(`✅ Fixed PerformanceTarget ${target.id}`)
    }
    
    console.log('✅ All NULL roles fixed!')
    
  } catch (error) {
    console.error('❌ Error fixing NULL roles:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixNullRoles() 