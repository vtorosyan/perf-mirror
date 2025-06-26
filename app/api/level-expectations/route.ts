import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 LevelExpectation API: Starting request')
    
    // Test if basic functionality works
    return NextResponse.json({ 
      message: 'API is working',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Error:', error)
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