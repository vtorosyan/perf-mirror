import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🧪 Debug role weights: Starting test...')
    
    // Test 1: Get current state
    const currentWeights = await prisma.roleWeights.findMany()
    console.log('📊 Current role weights:', currentWeights.map(w => ({ id: w.id, name: w.name, isActive: w.isActive })))
    
    // Test 2: Try to deactivate all except Engineer
    const engineerId = currentWeights.find(w => w.name === 'Engineer')?.id
    if (!engineerId) {
      return NextResponse.json({ error: 'Engineer role not found' }, { status: 404 })
    }
    
    console.log('🔄 Attempting to deactivate all roles except Engineer:', engineerId)
    
    const updateResult = await prisma.roleWeights.updateMany({
      where: { 
        isActive: true,
        id: { not: engineerId }
      },
      data: { isActive: false }
    })
    
    console.log('✅ UpdateMany result:', updateResult)
    
    // Test 3: Get state after update
    const afterWeights = await prisma.roleWeights.findMany()
    console.log('📊 After update role weights:', afterWeights.map(w => ({ id: w.id, name: w.name, isActive: w.isActive })))
    
    return NextResponse.json({
      success: true,
      engineerId,
      updateResult,
      before: currentWeights.map(w => ({ id: w.id, name: w.name, isActive: w.isActive })),
      after: afterWeights.map(w => ({ id: w.id, name: w.name, isActive: w.isActive }))
    })
  } catch (error: any) {
    console.error('❌ Debug role weights error:', error)
    return NextResponse.json({ 
      error: 'Debug failed', 
      details: error.message,
      stack: error.stack 
    }, { status: 500 })
  }
} 