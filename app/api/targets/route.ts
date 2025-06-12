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

// Transform target data from Turso format to normal format
const transformTarget = (rawTarget: any): any => {
  if (!rawTarget) return null
  
  return {
    id: safeValue(rawTarget.id),
    name: safeValue(rawTarget.name),
    excellentThreshold: parseInt(safeValue(rawTarget.excellentThreshold)) || 0,
    goodThreshold: parseInt(safeValue(rawTarget.goodThreshold)) || 0,
    needsImprovementThreshold: parseInt(safeValue(rawTarget.needsImprovementThreshold)) || 0,
    timePeriodWeeks: parseInt(safeValue(rawTarget.timePeriodWeeks)) || 0,
    isActive: safeValue(rawTarget.isActive) === 'true' || safeValue(rawTarget.isActive) === true,
    createdAt: safeValue(rawTarget.createdAt),
    updatedAt: safeValue(rawTarget.updatedAt)
  }
}

export async function GET() {
  try {
    const targets = await prisma.performanceTarget.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    // Transform the data to handle Turso's wrapped format
    const transformedTargets = targets.map(transformTarget).filter(target => target !== null)
    
    return NextResponse.json(transformedTargets)
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

    // Transform the response data
    const transformedTarget = transformTarget(target)

    return NextResponse.json(transformedTarget)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create target' }, { status: 500 })
  }
} 