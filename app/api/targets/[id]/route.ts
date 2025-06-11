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
    
    // If setting this target as active, deactivate others first
    if (body.isActive) {
      await prisma.performanceTarget.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      })
    }

    const target = await prisma.performanceTarget.update({
      where: { id: params.id },
      data: body
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