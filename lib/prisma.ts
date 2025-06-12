import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // Log which database configuration is being used
  if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
    console.log('🌐 Using Turso cloud database')
    
    try {
      // Use Turso with proper connection URL
      const databaseUrl = `${process.env.TURSO_DATABASE_URL}?authToken=${process.env.TURSO_AUTH_TOKEN}`
      
      return new PrismaClient({
        datasources: {
          db: {
            url: databaseUrl
          }
        },
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      })
    } catch (error) {
      console.error('❌ Failed to create Turso connection:', error)
      console.log('🔄 Falling back to local database')
      return createFallbackClient()
    }
  } else if (process.env.DATABASE_URL) {
    console.log('💾 Using configured DATABASE_URL')
    
    // Use configured DATABASE_URL (local SQLite or other)
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
  } else {
    console.log('⚠️  No database configuration found, using default')
    return createFallbackClient()
  }
}

function createFallbackClient() {
  console.log('📁 Using fallback SQLite database')
  return new PrismaClient({
    datasources: {
      db: {
        url: "file:./dev.db"
      }
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 