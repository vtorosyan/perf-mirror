import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  console.log('🔄 Initializing Prisma client...')
  
  try {
    // Log environment variables (without sensitive data)
    console.log('Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
      hasTursoToken: !!process.env.TURSO_AUTH_TOKEN,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
    })

    // Priority 1: Use Turso in production/cloud
    if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
      console.log('🌐 Using Turso cloud database')
      const databaseUrl = `${process.env.TURSO_DATABASE_URL}?authToken=${process.env.TURSO_AUTH_TOKEN}`
      
      return new PrismaClient({
        datasources: {
          db: {
            url: databaseUrl
          }
        },
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      })
    }

    // Priority 2: Use DATABASE_URL if available
    if (process.env.DATABASE_URL) {
      console.log('💾 Using configured DATABASE_URL:', process.env.DATABASE_URL.substring(0, 20) + '...')
      
      return new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      })
    }

    // Priority 3: Default to local SQLite
    console.log('📁 Using default local SQLite database')
    return new PrismaClient({
      datasources: {
        db: {
          url: "file:./dev.db"
        }
      },
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })

  } catch (error) {
    console.error('❌ Error creating Prisma client:', error)
    
    // Last resort: Create basic client
    console.log('🚨 Creating emergency fallback client')
    return new PrismaClient({
      log: ['error'],
    })
  }
}

// Initialize the Prisma client
let prismaInstance: PrismaClient

try {
  prismaInstance = globalForPrisma.prisma ?? createPrismaClient()
  
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance
  }

  console.log('✅ Prisma client initialized successfully')
} catch (error) {
  console.error('🚨 Critical error initializing Prisma:', error)
  // Create emergency client
  prismaInstance = new PrismaClient({ log: ['error'] })
}

export const prisma = prismaInstance 