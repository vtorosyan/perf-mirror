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

    // Transform the data to handle Turso's wrapped format
    const transformedLogs = logs.map(transformWeeklyLog).filter(log => log !== null)

    return NextResponse.json(transformedLogs)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch weekly logs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { categoryId, week, count, overrideScore } = body

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
        overrideScore: overrideScore ? parseInt(overrideScore) : null
      },
      create: {
        categoryId,
        week,
        count: parseInt(count),
        overrideScore: overrideScore ? parseInt(overrideScore) : null
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