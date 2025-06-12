import { PrismaClient } from '@prisma/client'
import { TursoHttpClient } from './turso-client'

// Type declarations for libSQL adapter
declare module '@prisma/client' {
  interface PrismaClientOptions {
    adapter?: any
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  tursoClient: TursoHttpClient | undefined
}

let prismaInstance: PrismaClient | undefined
let tursoInstance: TursoHttpClient | undefined

function createPrismaClient(): PrismaClient {
  console.log('🔄 Initializing Prisma client...')
  
  // Log environment variables (without sensitive data)
  const envCheck = {
    NODE_ENV: process.env.NODE_ENV,
    hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
    hasTursoToken: !!process.env.TURSO_AUTH_TOKEN,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    tursoUrlPrefix: process.env.TURSO_DATABASE_URL ? process.env.TURSO_DATABASE_URL.substring(0, 20) + '...' : 'none',
    databaseUrlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : 'none'
  }
  console.log('Environment check:', envCheck)

  // For development or when DATABASE_URL is a file
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('file:')) {
    console.log('💾 Using local SQLite database (file: protocol detected)')
    
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
  }

  // Default fallback to local SQLite
  console.log('📁 Using default local SQLite database (fallback)')
  return new PrismaClient({
    datasources: {
      db: {
        url: "file:./dev.db"
      }
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

function createTursoClient(): TursoHttpClient | undefined {
  console.log('🌐 Attempting to create Turso HTTP client...')
  
  if (!process.env.TURSO_DATABASE_URL) {
    console.log('❌ Missing TURSO_DATABASE_URL')
    return undefined
  }
  
  if (!process.env.TURSO_AUTH_TOKEN) {
    console.log('❌ Missing TURSO_AUTH_TOKEN')
    return undefined
  }
  
  try {
    console.log('✅ Creating Turso HTTP client with credentials')
    return new TursoHttpClient(process.env.TURSO_DATABASE_URL, process.env.TURSO_AUTH_TOKEN)
  } catch (error) {
    console.error('❌ Failed to create Turso HTTP client:', error)
    return undefined
  }
}

function getPrismaClient(): PrismaClient {
  console.log('🔍 Getting Prisma client...')
  
  if (prismaInstance) {
    console.log('♻️ Reusing existing Prisma instance')
    return prismaInstance
  }

  if (globalForPrisma.prisma) {
    console.log('🌐 Using global Prisma instance')
    prismaInstance = globalForPrisma.prisma
    return prismaInstance
  }

  console.log('🆕 Creating new Prisma instance')
  prismaInstance = createPrismaClient()
  
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance
  }

  console.log('✅ Prisma client initialized successfully')
  return prismaInstance
}

function getTursoClient(): TursoHttpClient | undefined {
  console.log('🔍 Getting Turso client...')
  
  if (tursoInstance) {
    console.log('♻️ Reusing existing Turso instance')
    return tursoInstance
  }

  if (globalForPrisma.tursoClient) {
    console.log('🌐 Using global Turso instance')
    tursoInstance = globalForPrisma.tursoClient
    return tursoInstance
  }

  console.log('🆕 Creating new Turso instance')
  tursoInstance = createTursoClient()
  
  if (tursoInstance && process.env.NODE_ENV !== 'production') {
    globalForPrisma.tursoClient = tursoInstance
  }

  if (tursoInstance) {
    console.log('✅ Turso client initialized successfully')
  } else {
    console.log('❌ Turso client initialization failed')
  }

  return tursoInstance
}

// Create a hybrid client that uses Turso in production, Prisma in development
const createHybridClient = () => {
  console.log('🔧 Creating hybrid database client...')
  console.log('Environment details:', {
    NODE_ENV: process.env.NODE_ENV,
    isProduction: process.env.NODE_ENV === 'production'
  })
  
  const tursoClient = getTursoClient()
  const prismaClient = getPrismaClient()
  
  if (process.env.NODE_ENV === 'production' && tursoClient) {
    console.log('🌐 PRODUCTION MODE: Using Turso HTTP client')
    
    // Create a custom object that implements the necessary Prisma methods
    const hybridClient = Object.create(prismaClient)
    
    hybridClient.roleWeights = {
      findMany: async (...args: any[]) => {
        console.log('📞 Hybrid client: roleWeights.findMany() called with Turso')
        return await tursoClient.findManyRoleWeights()
      },
      findFirst: async (...args: any[]) => {
        console.log('📞 Hybrid client: roleWeights.findFirst() called with Turso')
        try {
          const result = await tursoClient.findFirstRoleWeights()
          console.log('✅ Hybrid client: roleWeights.findFirst() result:', result ? 'found' : 'not found')
          return result
        } catch (error) {
          console.error('❌ Hybrid client: roleWeights.findFirst() failed:', error)
          throw error
        }
      },
      create: async (options: { data: any }) => {
        console.log('📞 Hybrid client: roleWeights.create() called with Turso')
        console.log('📝 Create data:', options.data)
        try {
          const result = await tursoClient.createRoleWeight(options.data)
          console.log('✅ Hybrid client: roleWeights.create() successful:', result.id)
          return result
        } catch (error) {
          console.error('❌ Hybrid client: roleWeights.create() failed:', error)
          throw error
        }
      },
    }
    
    hybridClient.performanceTarget = {
      findMany: async (...args: any[]) => {
        console.log('📞 Hybrid client: performanceTarget.findMany() called with Turso')
        return await tursoClient.findManyTargets()
      },
    }
    
    hybridClient.category = {
      findMany: async (...args: any[]) => {
        console.log('📞 Hybrid client: category.findMany() called with Turso')
        return await tursoClient.findManyCategories()
      },
    }
    
    hybridClient.weeklyLog = {
      findMany: async (options?: { where?: { week?: { in: string[] } } }) => {
        console.log('📞 Hybrid client: weeklyLog.findMany() called with Turso')
        const weeks = options?.where?.week?.in
        return await tursoClient.findManyWeeklyLogs(weeks)
      },
    }
    
    return hybridClient
  }

  if (process.env.NODE_ENV === 'production' && !tursoClient) {
    console.log('⚠️ PRODUCTION MODE: Turso client not available, falling back to Prisma')
  } else {
    console.log('💾 DEVELOPMENT MODE: Using Prisma client')
  }
  
  return prismaClient
}

console.log('🚀 Initializing database client module...')
export const prisma = createHybridClient() as PrismaClient
console.log('✅ Database client module initialized') 