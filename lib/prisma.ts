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

    // Determine the database URL to use
    let databaseUrl: string
    
    if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
      // For Turso, we need to use a direct connection approach
      console.log('🌐 Using Turso cloud database')
      databaseUrl = process.env.TURSO_DATABASE_URL
      
      // For now, fall back to local SQLite since libSQL adapter has compatibility issues
      console.log('⚠️  LibSQL adapter has compatibility issues, falling back to local SQLite')
      databaseUrl = process.env.DATABASE_URL || "file:./dev.db"
      
    } else if (process.env.DATABASE_URL) {
      console.log('💾 Using configured DATABASE_URL')
      databaseUrl = process.env.DATABASE_URL
    } else {
      console.log('📁 Using default local SQLite database')
      databaseUrl = "file:./dev.db"
    }

    // Create Prisma client with the determined URL
    const client = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl
        }
      },
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })

    return client

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