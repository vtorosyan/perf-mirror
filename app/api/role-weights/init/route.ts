import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    // Check if any role weights exist
    const existingWeights = await prisma.roleWeights.findFirst()
    if (existingWeights) {
      return NextResponse.json({ message: 'Role weights already initialized' })
    }

    // Create default role weights
    const defaultRoles = [
      {
        name: 'Engineer',
        inputWeight: 0.3,
        outputWeight: 0.4,
        outcomeWeight: 0.2,
        impactWeight: 0.1,
        isActive: false
      },
      {
        name: 'Manager',
        inputWeight: 0.2,
        outputWeight: 0.4,
        outcomeWeight: 0.3,
        impactWeight: 0.1,
        isActive: true
      },
      {
        name: 'Senior Manager',
        inputWeight: 0.15,
        outputWeight: 0.35,
        outcomeWeight: 0.35,
        impactWeight: 0.15,
        isActive: false
      },
      {
        name: 'Director',
        inputWeight: 0.1,
        outputWeight: 0.25,
        outcomeWeight: 0.4,
        impactWeight: 0.25,
        isActive: false
      }
    ]

    for (const role of defaultRoles) {
      await prisma.roleWeights.create({
        data: role
      })
    }

    return NextResponse.json({ message: 'Default role weights created successfully' })
  } catch (error) {
    console.error('Error in POST /api/role-weights/init:', error)
    return NextResponse.json({ error: 'Failed to initialize role weights' }, { status: 500 })
  }
} 