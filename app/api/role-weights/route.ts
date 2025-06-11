import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const weights = await prisma.roleWeights.findMany({
      orderBy: { createdAt: 'asc' }
    })
    return NextResponse.json(weights)
  } catch (error) {
    console.error('Error in GET /api/role-weights:', error)
    return NextResponse.json({ error: 'Failed to fetch role weights' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    if (!name || inputWeight === undefined || outputWeight === undefined || 
        outcomeWeight === undefined || impactWeight === undefined) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Validate weights sum to 1.0
    const totalWeight = parseFloat(inputWeight) + parseFloat(outputWeight) + 
                       parseFloat(outcomeWeight) + parseFloat(impactWeight)
    
    if (Math.abs(totalWeight - 1.0) > 0.001) {
      return NextResponse.json({ error: 'Weights must sum to 1.0' }, { status: 400 })
    }

    // Deactivate other weights if this one is active
    if (isActive) {
      await prisma.roleWeights.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      })
    }

    const weights = await prisma.roleWeights.create({
      data: {
        name,
        inputWeight: parseFloat(inputWeight),
        outputWeight: parseFloat(outputWeight),
        outcomeWeight: parseFloat(outcomeWeight),
        impactWeight: parseFloat(impactWeight),
        isActive: isActive || false
      }
    })

    return NextResponse.json(weights)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Role name already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create role weights' }, { status: 500 })
  }
} 