import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { 
      name,
      role,
      level,
      outstandingThreshold,
      strongThreshold,
      meetingThreshold,
      partialThreshold,
      underperformingThreshold,
      timePeriodWeeks,
      isActive 
    } = body

    // Deactivate other targets if this one is being activated
    if (isActive) {
      await prisma.performanceTarget.updateMany({
        where: { 
          isActive: true,
          id: { not: params.id }  // Exclude the current target from deactivation
        },
        data: { isActive: false }
      })
    }

    const target = await prisma.performanceTarget.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(role && { role }),
        ...(level !== undefined && { level: level ? parseInt(level) : null }),
        ...(outstandingThreshold !== undefined && { outstandingThreshold: parseInt(outstandingThreshold) }),
        ...(strongThreshold !== undefined && { strongThreshold: parseInt(strongThreshold) }),
        ...(meetingThreshold !== undefined && { meetingThreshold: parseInt(meetingThreshold) }),
        ...(partialThreshold !== undefined && { partialThreshold: parseInt(partialThreshold) }),
        ...(underperformingThreshold !== undefined && { underperformingThreshold: parseInt(underperformingThreshold) }),
        ...(timePeriodWeeks !== undefined && { timePeriodWeeks: parseInt(timePeriodWeeks) }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return NextResponse.json(target)
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Target not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update target' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.performanceTarget.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Target deleted successfully' })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Target not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete target' }, { status: 500 })
  }
} 