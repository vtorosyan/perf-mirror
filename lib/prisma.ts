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
  console.log('Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
    hasTursoToken: !!process.env.TURSO_AUTH_TOKEN,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
  })

  // For development or when DATABASE_URL is a file
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('file:')) {
    console.log('💾 Using local SQLite database')
    
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
  }

  // Default fallback to local SQLite
  console.log('📁 Using default local SQLite database')
  return new PrismaClient({
    datasources: {
      db: {
        url: "file:./dev.db"
      }
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

function createTursoClient(): TursoHttpClient | null {
  if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
    console.log('🌐 Initializing Turso HTTP client for production')
    return new TursoHttpClient(process.env.TURSO_DATABASE_URL, process.env.TURSO_AUTH_TOKEN)
  }
  return null
}

function getPrismaClient(): PrismaClient {
  if (prismaInstance) {
    return prismaInstance
  }

  if (globalForPrisma.prisma) {
    prismaInstance = globalForPrisma.prisma
    return prismaInstance
  }

  prismaInstance = createPrismaClient()
  
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance
  }

  console.log('✅ Prisma client initialized successfully')
  return prismaInstance
}

function getTursoClient(): TursoHttpClient | null {
  if (tursoInstance) {
    return tursoInstance
  }

  if (globalForPrisma.tursoClient) {
    tursoInstance = globalForPrisma.tursoClient
    return tursoInstance
  }

  tursoInstance = createTursoClient()
  
  if (tursoInstance && process.env.NODE_ENV !== 'production') {
    globalForPrisma.tursoClient = tursoInstance
  }

  return tursoInstance
}

// Create a hybrid client that uses Turso in production, Prisma in development
const createHybridClient = () => {
  const tursoClient = getTursoClient()
  const prismaClient = getPrismaClient()
  
  if (process.env.NODE_ENV === 'production' && tursoClient) {
    console.log('🌐 Using Turso HTTP client for production')
    
    return {
      roleWeights: {
        findMany: () => tursoClient.findManyRoleWeights(),
      },
      performanceTarget: {
        findMany: () => tursoClient.findManyTargets(),
      },
      category: {
        findMany: () => tursoClient.findManyCategories(),
      },
      weeklyLog: {
        findMany: (options?: { where?: { week?: { in: string[] } } }) => {
          const weeks = options?.where?.week?.in
          return tursoClient.findManyWeeklyLogs(weeks)
        },
      },
      // Fallback for other operations
      ...prismaClient,
    }
  }

  console.log('💾 Using Prisma client for development')
  return prismaClient
}

export const prisma = createHybridClient() as PrismaClient 