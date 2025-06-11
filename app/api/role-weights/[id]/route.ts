import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { 
      name,
      inputWeight,
      outputWeight,
      outcomeWeight,
      impactWeight,
      isActive 
    } = body

    // Validate weights sum to 1.0 if provided
    if (inputWeight !== undefined && outputWeight !== undefined && 
        outcomeWeight !== undefined && impactWeight !== undefined) {
      const totalWeight = parseFloat(inputWeight) + parseFloat(outputWeight) + 
                         parseFloat(outcomeWeight) + parseFloat(impactWeight)
      
      if (Math.abs(totalWeight - 1.0) > 0.001) {
        return NextResponse.json({ error: 'Weights must sum to 1.0' }, { status: 400 })
      }
    }

    // Deactivate other weights if this one is being activated
    if (isActive) {
      await prisma.roleWeights.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      })
    }

    const weights = await prisma.roleWeights.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(inputWeight !== undefined && { inputWeight: parseFloat(inputWeight) }),
        ...(outputWeight !== undefined && { outputWeight: parseFloat(outputWeight) }),
        ...(outcomeWeight !== undefined && { outcomeWeight: parseFloat(outcomeWeight) }),
        ...(impactWeight !== undefined && { impactWeight: parseFloat(impactWeight) }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return NextResponse.json(weights)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Role name already exists' }, { status: 400 })
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Role weights not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update role weights' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.roleWeights.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Role weights deleted successfully' })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Role weights not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete role weights' }, { status: 500 })
  }
} 