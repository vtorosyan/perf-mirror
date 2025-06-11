import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const weeks = searchParams.get('weeks')?.split(',') || []

    const logs = await prisma.weeklyLog.findMany({
      where: weeks.length > 0 ? { week: { in: weeks } } : {},
      include: { category: true },
      orderBy: { week: 'desc' }
    })

    return NextResponse.json(logs)
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

    return NextResponse.json(log)
  } catch (error: any) {
    if (error.code === 'P2003') {
      return NextResponse.json({ error: 'Category not found' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create/update weekly log' }, { status: 500 })
  }
} 