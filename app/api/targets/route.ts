import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const targets = await prisma.performanceTarget.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(targets)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch targets' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name,
      excellentThreshold,
      goodThreshold,
      needsImprovementThreshold,
      timePeriodWeeks,
      isActive 
    } = body

    // Deactivate other targets if this one is active
    if (isActive) {
      await prisma.performanceTarget.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      })
    }

    const target = await prisma.performanceTarget.create({
      data: {
        name: name || 'Default Target',
        excellentThreshold: parseInt(excellentThreshold) || 225,
        goodThreshold: parseInt(goodThreshold) || 170,
        needsImprovementThreshold: parseInt(needsImprovementThreshold) || 120,
        timePeriodWeeks: parseInt(timePeriodWeeks) || 12,
        isActive: isActive || false
      }
    })

    return NextResponse.json(target)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create target' }, { status: 500 })
  }
} 