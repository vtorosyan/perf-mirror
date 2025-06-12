import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TursoHttpClient } from '@/lib/turso-client'

export async function GET() {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
      hasTursoToken: !!process.env.TURSO_AUTH_TOKEN,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      tursoUrlPrefix: process.env.TURSO_DATABASE_URL ? 
        process.env.TURSO_DATABASE_URL.substring(0, 30) + '...' : 'none',
      databaseUrlPrefix: process.env.DATABASE_URL ? 
        process.env.DATABASE_URL.substring(0, 30) + '...' : 'none',
    },
    clientTypes: {
      prismaType: typeof prisma,
      prismaRoleWeights: typeof prisma.roleWeights,
      prismaRoleWeightsFindMany: typeof prisma.roleWeights?.findMany,
      prismaPerformanceTarget: typeof prisma.performanceTarget,
      prismaCategory: typeof prisma.category,
      prismaWeeklyLog: typeof prisma.weeklyLog,
    },
    connectivity: {}
  }

  // Test Turso HTTP client directly
  if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
    try {
      console.log('🧪 Testing direct Turso HTTP client...')
      const tursoClient = new TursoHttpClient(
        process.env.TURSO_DATABASE_URL,
        process.env.TURSO_AUTH_TOKEN
      )
      
      const roleWeights = await tursoClient.findManyRoleWeights()
      debugInfo.connectivity.tursoHttpClient = {
        success: true,
        roleWeightsCount: roleWeights.length,
        sampleRecord: roleWeights[0] || null
      }
      console.log('✅ Direct Turso HTTP client test successful')
    } catch (error) {
      console.error('❌ Direct Turso HTTP client test failed:', error)
      debugInfo.connectivity.tursoHttpClient = {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  } else {
    debugInfo.connectivity.tursoHttpClient = {
      success: false,
      error: 'Missing Turso credentials'
    }
  }

  // Test hybrid prisma client
  try {
    console.log('🧪 Testing hybrid prisma client...')
    const roleWeights = await prisma.roleWeights.findMany({
      orderBy: { createdAt: 'asc' }
    })
    
    debugInfo.connectivity.hybridPrismaClient = {
      success: true,
      roleWeightsCount: roleWeights.length,
      sampleRecord: roleWeights[0] || null
    }
    console.log('✅ Hybrid prisma client test successful')
  } catch (error) {
    console.error('❌ Hybrid prisma client test failed:', error)
    debugInfo.connectivity.hybridPrismaClient = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      errorName: error instanceof Error ? error.name : 'Unknown',
      errorStack: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined
    }
  }

  // Test other endpoints
  try {
    console.log('🧪 Testing categories...')
    const categories = await prisma.category.findMany()
    debugInfo.connectivity.categories = {
      success: true,
      count: categories.length
    }
  } catch (error) {
    debugInfo.connectivity.categories = {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }

  try {
    console.log('🧪 Testing targets...')
    const targets = await prisma.performanceTarget.findMany()
    debugInfo.connectivity.targets = {
      success: true,
      count: targets.length
    }
  } catch (error) {
    debugInfo.connectivity.targets = {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }

  try {
    console.log('🧪 Testing weekly logs...')
    const weeklyLogs = await prisma.weeklyLog.findMany({
      take: 5
    })
    debugInfo.connectivity.weeklyLogs = {
      success: true,
      count: weeklyLogs.length
    }
  } catch (error) {
    debugInfo.connectivity.weeklyLogs = {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }

  // Runtime information
  debugInfo.runtime = {
    platform: process.platform,
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime(),
    cwd: process.cwd(),
  }

  // Detailed database URLs (safely)
  if (process.env.TURSO_DATABASE_URL) {
    const tursoUrl = process.env.TURSO_DATABASE_URL
    debugInfo.environment.tursoUrlDetails = {
      protocol: tursoUrl.startsWith('libsql://') ? 'libsql' : 'other',
      hostname: tursoUrl.split('//')[1]?.split('/')[0] || 'unknown',
      convertedHttpsUrl: tursoUrl.replace('libsql://', 'https://') + '/v1/execute'
    }
  }

  console.log('🧪 Debug endpoint completed, returning results')
  return NextResponse.json(debugInfo)
} 