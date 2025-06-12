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

    // For production with Turso, use DATABASE_URL with auth token
    if (process.env.NODE_ENV === 'production' && process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
      console.log('🌐 Using Turso cloud database for production')
      
      // Create a Turso connection URL with auth token as query parameter
      const tursoUrl = new URL(process.env.TURSO_DATABASE_URL)
      tursoUrl.searchParams.set('authToken', process.env.TURSO_AUTH_TOKEN)
      
      return new PrismaClient({
        datasources: {
          db: {
            url: tursoUrl.toString()
          }
        },
        log: ['error'],
      })
    }

    // For development, prefer local SQLite
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('file:')) {
      console.log('💾 Using local SQLite database:', process.env.DATABASE_URL.substring(0, 20) + '...')
      
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

  } catch (error) {
    console.error('❌ Error creating Prisma client:', error)
    
    // Last resort: Create basic local SQLite client
    console.log('🚨 Creating emergency fallback client')
    return new PrismaClient({
      datasources: {
        db: {
          url: "file:./dev.db"
        }
      },
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
  prismaInstance = new PrismaClient({ 
    datasources: { db: { url: "file:./dev.db" } },
    log: ['error'] 
  })
}

export const prisma = prismaInstance 