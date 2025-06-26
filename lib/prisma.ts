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
    VERCEL: process.env.VERCEL,
    hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
    hasTursoToken: !!process.env.TURSO_AUTH_TOKEN,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
  }
  console.log('Environment check:', envCheck)

  // For production/Vercel, don't use DATABASE_URL if it's a Turso URL
  // because our Prisma schema uses sqlite provider which can't handle libsql:// URLs
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    console.log('🌐 PRODUCTION/VERCEL: Using local SQLite fallback (Turso handled by hybrid client)')
    return new PrismaClient({
      datasources: {
        db: {
          url: "file:./dev.db"
        }
      },
      log: ['error'],
    })
  }

  // For development, use DATABASE_URL only if it's a file: URL
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('file:')) {
    console.log('💾 DEVELOPMENT: Using local SQLite database')
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
  }

  // Default fallback to local SQLite
  console.log('📁 FALLBACK: Using default local SQLite database')
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
    VERCEL: process.env.VERCEL,
    isProduction: process.env.NODE_ENV === 'production' || process.env.VERCEL
  })
  
  const tursoClient = getTursoClient()
  const prismaClient = getPrismaClient()
  
  // In development mode, ALWAYS use plain Prisma client
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    console.log('💾 DEVELOPMENT MODE: Using Prisma client')
    return prismaClient
  }
  
  // In production/Vercel, use Turso if available
  if ((process.env.NODE_ENV === 'production' || process.env.VERCEL) && tursoClient) {
    console.log('🌐 PRODUCTION/VERCEL MODE: Using Turso HTTP client')
    
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
      updateMany: async (options: { where: any; data: any }) => {
        console.log('📞 Hybrid client: roleWeights.updateMany() called with Turso')
        console.log('📝 UpdateMany options:', options)
        try {
          const result = await tursoClient.updateManyRoleWeights(options.where, options.data)
          console.log('✅ Hybrid client: roleWeights.updateMany() successful:', result.count)
          return result
        } catch (error) {
          console.error('❌ Hybrid client: roleWeights.updateMany() failed:', error)
          throw error
        }
      },
      update: async (options: { where: { id: string }; data: any }) => {
        console.log('📞 Hybrid client: roleWeights.update() called with Turso')
        console.log('📝 Update options:', options)
        try {
          const result = await tursoClient.updateRoleWeight(options.where.id, options.data)
          console.log('✅ Hybrid client: roleWeights.update() successful:', result.id)
          return result
        } catch (error) {
          console.error('❌ Hybrid client: roleWeights.update() failed:', error)
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
      create: async (options: { data: any }) => {
        console.log('📞 Hybrid client: performanceTarget.create() called with Turso')
        console.log('📝 Create data:', options.data)
        try {
          const result = await tursoClient.createTarget(options.data)
          console.log('✅ Hybrid client: performanceTarget.create() successful:', result.id)
          return result
        } catch (error) {
          console.error('❌ Hybrid client: performanceTarget.create() failed:', error)
          throw error
        }
      },
      update: async (options: { where: { id: string }; data: any }) => {
        console.log('📞 Hybrid client: performanceTarget.update() called with Turso')
        console.log('📝 Update options:', options)
        try {
          const result = await tursoClient.updateTarget(options.where.id, options.data)
          console.log('✅ Hybrid client: performanceTarget.update() successful:', result.id)
          return result
        } catch (error) {
          console.error('❌ Hybrid client: performanceTarget.update() failed:', error)
          throw error
        }
      },
      updateMany: async (options: { where: any; data: any }) => {
        console.log('📞 Hybrid client: performanceTarget.updateMany() called with Turso')
        console.log('📝 UpdateMany options:', options)
        try {
          const result = await tursoClient.updateManyTargets(options.where, options.data)
          console.log('✅ Hybrid client: performanceTarget.updateMany() successful:', result.count)
          return result
        } catch (error) {
          console.error('❌ Hybrid client: performanceTarget.updateMany() failed:', error)
          throw error
        }
      },
      delete: async (options: { where: { id: string } }) => {
        console.log('📞 Hybrid client: performanceTarget.delete() called with Turso')
        console.log('📝 Delete target ID:', options.where.id)
        try {
          await tursoClient.deleteTarget(options.where.id)
          console.log('✅ Hybrid client: performanceTarget.delete() successful')
          return { id: options.where.id }
        } catch (error) {
          console.error('❌ Hybrid client: performanceTarget.delete() failed:', error)
          throw error
        }
      },
    }
    
    hybridClient.category = {
      findMany: async (...args: any[]) => {
        console.log('📞 Hybrid client: category.findMany() called with Turso')
        return await tursoClient.findManyCategories()
      },
      create: async (options: { data: any }) => {
        console.log('📞 Hybrid client: category.create() called with Turso')
        console.log('📝 Create data:', options.data)
        try {
          const result = await tursoClient.createCategory(options.data)
          console.log('✅ Hybrid client: category.create() successful:', result.id)
          return result
        } catch (error) {
          console.error('❌ Hybrid client: category.create() failed:', error)
          throw error
        }
      },
      update: async (options: { where: { id: string }; data: any }) => {
        console.log('📞 Hybrid client: category.update() called with Turso')
        console.log('📝 Update options:', options)
        try {
          const result = await tursoClient.updateCategory(options.where.id, options.data)
          console.log('✅ Hybrid client: category.update() successful:', result.id)
          return result
        } catch (error) {
          console.error('❌ Hybrid client: category.update() failed:', error)
          throw error
        }
      },
      delete: async (options: { where: { id: string } }) => {
        console.log('📞 Hybrid client: category.delete() called with Turso')
        console.log('📝 Delete category ID:', options.where.id)
        try {
          await tursoClient.deleteCategory(options.where.id)
          console.log('✅ Hybrid client: category.delete() successful')
          return { id: options.where.id }
        } catch (error) {
          console.error('❌ Hybrid client: category.delete() failed:', error)
          throw error
        }
      },
    }
    
    hybridClient.weeklyLog = {
      findMany: async (options?: { where?: { week?: { in: string[] } }; include?: any; orderBy?: any }) => {
        console.log('📞 Hybrid client: weeklyLog.findMany() called with Turso')
        const weeks = options?.where?.week?.in
        // For Turso, we always include category data since it's needed for calculations
        return await tursoClient.findManyWeeklyLogs(weeks)
      },
      upsert: async (options: { 
        where: { categoryId_week: { categoryId: string; week: string } };
        update: any;
        create: any;
        include?: any;
      }) => {
        console.log('📞 Hybrid client: weeklyLog.upsert() called with Turso')
        console.log('📝 Upsert options:', options)
        try {
          const data = {
            categoryId: options.where.categoryId_week.categoryId,
            week: options.where.categoryId_week.week,
            count: options.update.count || options.create.count,
            overrideScore: options.update.overrideScore !== undefined 
              ? options.update.overrideScore 
              : options.create.overrideScore,
            reference: options.update.reference !== undefined 
              ? options.update.reference 
              : options.create.reference
          }
          const result = await tursoClient.upsertWeeklyLog(data)
          console.log('✅ Hybrid client: weeklyLog.upsert() successful:', result.id)
          return result
        } catch (error) {
          console.error('❌ Hybrid client: weeklyLog.upsert() failed:', error)
          throw error
        }
      },
    }
    
    hybridClient.categoryTemplate = {
      findMany: async (options?: { where?: { role?: string; level?: number }; orderBy?: any }) => {
        console.log('📞 Hybrid client: categoryTemplate.findMany() called with Turso')
        console.log('📝 FindMany options:', options)
        try {
          const filters: { role?: string; level?: number } = {}
          if (options?.where?.role) {
            filters.role = options.where.role
          }
          if (options?.where?.level !== undefined) {
            filters.level = options.where.level
          }
          const result = await tursoClient.findManyCategoryTemplates(filters)
          console.log('✅ Hybrid client: categoryTemplate.findMany() successful:', result.length, 'templates')
          return result
        } catch (error) {
          console.error('❌ Hybrid client: categoryTemplate.findMany() failed:', error)
          throw error
        }
      },
      upsert: async (options: {
        where: { role_level_categoryName: { role: string; level: number; categoryName: string } };
        update: any;
        create: any;
      }) => {
        console.log('📞 Hybrid client: categoryTemplate.upsert() called with Turso')
        console.log('📝 Upsert options:', options)
        try {
          const data = {
            role: options.where.role_level_categoryName.role,
            level: options.where.role_level_categoryName.level,
            categoryName: options.where.role_level_categoryName.categoryName,
            dimension: options.update.dimension || options.create.dimension,
            scorePerOccurrence: options.update.scorePerOccurrence || options.create.scorePerOccurrence,
            expectedWeeklyCount: options.update.expectedWeeklyCount || options.create.expectedWeeklyCount,
            description: options.update.description !== undefined 
              ? options.update.description 
              : options.create.description
          }
          const result = await tursoClient.upsertCategoryTemplate(data)
          console.log('✅ Hybrid client: categoryTemplate.upsert() successful:', result.id)
          return result
        } catch (error) {
          console.error('❌ Hybrid client: categoryTemplate.upsert() failed:', error)
          throw error
        }
      },
    }
    
    return hybridClient
  }

  if ((process.env.NODE_ENV === 'production' || process.env.VERCEL) && !tursoClient) {
    console.log('⚠️ PRODUCTION/VERCEL MODE: Turso client not available, falling back to Prisma')
  } else {
    console.log('💾 DEVELOPMENT MODE: Using Prisma client')
  }
  
  return prismaClient
}

console.log('🚀 Initializing database client module...')
export const prisma = createHybridClient() as PrismaClient
console.log('✅ Database client module initialized') 