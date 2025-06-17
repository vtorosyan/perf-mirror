import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const level = searchParams.get('level')
    
    if (role && level) {
      const expectation = await prisma.levelExpectation.findUnique({
        where: {
          role_level: {
            role,
            level: parseInt(level)
          }
        }
      })
      
      return NextResponse.json(expectation)
    }
    
    // Return all expectations if no specific role/level requested
    const expectations = await prisma.levelExpectation.findMany({
      orderBy: [
        { role: 'asc' },
        { level: 'asc' }
      ]
    })
    
    return NextResponse.json(expectations)
  } catch (error) {
    console.error('Error fetching level expectations:', error)
    return NextResponse.json({ error: 'Failed to fetch level expectations' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { role, level, expectations } = await request.json()
    
    const expectation = await prisma.levelExpectation.upsert({
      where: {
        role_level: {
          role,
          level: parseInt(level)
        }
      },
      update: {
        expectations: JSON.stringify(expectations)
      },
      create: {
        role,
        level: parseInt(level),
        expectations: JSON.stringify(expectations)
      }
    })
    
    return NextResponse.json(expectation)
  } catch (error) {
    console.error('Error creating/updating level expectation:', error)
    return NextResponse.json({ error: 'Failed to create/update level expectation' }, { status: 500 })
  }
} 