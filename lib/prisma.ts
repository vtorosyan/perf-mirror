import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // Log which database is being used
  if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
    console.log('🌐 Using Turso database for production')
  } else {
    console.log('💾 Using local SQLite database for development')
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.TURSO_DATABASE_URL 
          ? `${process.env.TURSO_DATABASE_URL}?authToken=${process.env.TURSO_AUTH_TOKEN}`
          : process.env.DATABASE_URL
      }
    }
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 