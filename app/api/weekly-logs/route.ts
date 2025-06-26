import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Helper function to safely extract values from Turso's wrapped format
const safeValue = (value: any): any => {
  if (value === null || value === undefined) return null
  if (typeof value === 'object' && value && 'type' in value) {
    if (value.type === 'null') return null
    if (value.type === 'text' || value.type === 'integer') return value.value
  }
  return value
}

// Transform weekly log data from Turso format to normal format
const transformWeeklyLog = (rawLog: any): any => {
  if (!rawLog) return null
  
  return {
    id: safeValue(rawLog.id),
    categoryId: safeValue(rawLog.categoryId),
    week: safeValue(rawLog.week),
    count: parseInt(safeValue(rawLog.count)) || 0,
    overrideScore: rawLog.overrideScore !== null ? parseInt(safeValue(rawLog.overrideScore)) : null,
    reference: safeValue(rawLog.reference),
    createdAt: safeValue(rawLog.createdAt),
    category: rawLog.category ? {
      id: safeValue(rawLog.category.id),
      name: safeValue(rawLog.category.name),
      scorePerOccurrence: parseInt(safeValue(rawLog.category.scorePerOccurrence)) || 0,
      dimension: safeValue(rawLog.category.dimension),
      description: safeValue(rawLog.category.description),
      createdAt: safeValue(rawLog.category.createdAt),
      updatedAt: safeValue(rawLog.category.updatedAt)
    } : undefined
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const weeks = searchParams.get('weeks')?.split(',') || []

    const logs = await prisma.weeklyLog.findMany({
      where: weeks.length > 0 ? { week: { in: weeks } } : {},
      include: { category: true },
      orderBy: { week: 'desc' }
    })

    // Debug logging for Vercel
    console.log('🔍 Raw logs from Prisma:', JSON.stringify(logs.slice(0, 2), null, 2))
    console.log('🔍 First log category:', logs[0]?.category)

    // Check if categories are missing and fetch them manually if needed
    let logsWithCategories: any[] = logs
    if (logs.length > 0 && !logs[0].category) {
      console.log('⚠️ Categories missing from Prisma include, fetching manually...')
      
      // Get unique category IDs
      const categoryIds = Array.from(new Set(logs.map(log => safeValue(log.categoryId)).filter(Boolean)))
      console.log('🔍 Category IDs to fetch:', categoryIds)
      
      // Fetch categories separately
      const categories = await prisma.category.findMany({
        where: { id: { in: categoryIds } }
      })
      console.log('🔍 Fetched categories:', categories.length)
      
      // Create a map for quick lookup
      const categoryMap = new Map(categories.map(cat => [safeValue(cat.id), cat]))
      
      // Attach categories to logs
      logsWithCategories = logs.map(log => ({
        ...log,
        category: categoryMap.get(safeValue(log.categoryId))
      }))
      
      console.log('🔍 First log with manually attached category:', logsWithCategories[0]?.category)
    }

    // Transform the data to handle Turso's wrapped format
    const transformedLogs = logsWithCategories.map(transformWeeklyLog).filter(log => log !== null)

    console.log('🔍 Transformed logs:', JSON.stringify(transformedLogs.slice(0, 2), null, 2))

    return NextResponse.json(transformedLogs)
  } catch (error) {
    console.error('❌ Error in weekly-logs API:', error)
    return NextResponse.json({ error: 'Failed to fetch weekly logs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { categoryId, week, count, overrideScore, reference } = body

    if (!categoryId || !week || count === undefined) {
      return NextResponse.json({ error: 'Category ID, week, and count are required' }, { status: 400 })
    }

    const log = await prisma.weeklyLog.upsert({
      where: {
        categoryId_week: {
          categoryId,
          week
        }
      },
      update: {
        count: parseInt(count),
        overrideScore: overrideScore ? parseInt(overrideScore) : null,
        reference: reference || null
      },
      create: {
        categoryId,
        week,
        count: parseInt(count),
        overrideScore: overrideScore ? parseInt(overrideScore) : null,
        reference: reference || null
      },
      include: { category: true }
    })

    // Transform the response data
    const transformedLog = transformWeeklyLog(log)

    return NextResponse.json(transformedLog)
  } catch (error: any) {
    if (error.code === 'P2003') {
      return NextResponse.json({ error: 'Category not found' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create/update weekly log' }, { status: 500 })
  }
} 