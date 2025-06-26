import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Test expectations API called')
    
    const expectations = await prisma.levelExpectation.findMany()
    
    console.log('✅ Found expectations:', expectations.length)
    return NextResponse.json({ count: expectations.length, data: expectations })
  } catch (error) {
    console.error('❌ Error:', error)
    return NextResponse.json({ error: 'Failed to fetch', details: String(error) }, { status: 500 })
  }
} 