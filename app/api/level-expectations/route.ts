import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Level expectations API called')
    console.log('🔧 Prisma client available:', !!prisma)
    console.log('🔧 levelExpectation method available:', !!prisma.levelExpectation)
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const level = searchParams.get('level')
    console.log('📝 Query params:', { role, level })
    
    if (role && level) {
      console.log('🔍 Searching for specific role/level:', role, level)
      const expectation = await prisma.levelExpectation.findFirst({
        where: {
          role,
          level: parseInt(level)
        }
      })
      console.log('📊 Found expectation:', expectation ? 'YES' : 'NO')
      
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
    
    // First try to find existing record
    const existing = await prisma.levelExpectation.findFirst({
      where: {
        role,
        level: parseInt(level)
      }
    })
    
    let expectation
    if (existing) {
      expectation = await prisma.levelExpectation.update({
        where: { id: existing.id },
        data: {
          expectations: JSON.stringify(expectations)
        }
      })
    } else {
      expectation = await prisma.levelExpectation.create({
        data: {
          role,
          level: parseInt(level),
          expectations: JSON.stringify(expectations)
        }
      })
    }
    
    return NextResponse.json(expectation)
  } catch (error) {
    console.error('Error creating/updating level expectation:', error)
    return NextResponse.json({ error: 'Failed to create/update level expectation' }, { status: 500 })
  }
} 