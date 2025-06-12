import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Helper function to safely extract values from Turso's wrapped format
const safeValue = (value: any): any => {
  if (value === null || value === undefined) return null
  if (typeof value === 'object' && value && 'type' in value) {
    if (value.type === 'null') return null
    if (value.type === 'text' || value.type === 'integer') return value.value
  }
  return value
}

// Transform role weights data from Turso format to normal format
const transformRoleWeights = (rawWeights: any): any => {
  if (!rawWeights) return null
  
  return {
    id: safeValue(rawWeights.id),
    name: safeValue(rawWeights.name),
    inputWeight: parseFloat(safeValue(rawWeights.inputWeight)) || 0,
    outputWeight: parseFloat(safeValue(rawWeights.outputWeight)) || 0,
    outcomeWeight: parseFloat(safeValue(rawWeights.outcomeWeight)) || 0,
    impactWeight: parseFloat(safeValue(rawWeights.impactWeight)) || 0,
    isActive: safeValue(rawWeights.isActive) === 'true' || safeValue(rawWeights.isActive) === true,
    createdAt: safeValue(rawWeights.createdAt),
    updatedAt: safeValue(rawWeights.updatedAt)
  }
}

export async function GET() {
  const requestId = Math.random().toString(36).substring(7)
  console.log(`🌐 [${requestId}] GET /api/role-weights - Request started`)
  console.log(`🔍 [${requestId}] Environment:`, {
    NODE_ENV: process.env.NODE_ENV,
    hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
    hasTursoToken: !!process.env.TURSO_AUTH_TOKEN,
    timestamp: new Date().toISOString()
  })
  
  try {
    console.log(`📞 [${requestId}] Calling prisma.roleWeights.findMany()...`)
    console.log(`🔍 [${requestId}] Prisma client type:`, typeof prisma)
    console.log(`🔍 [${requestId}] Prisma roleWeights type:`, typeof prisma.roleWeights)
    console.log(`🔍 [${requestId}] Prisma roleWeights.findMany type:`, typeof prisma.roleWeights?.findMany)
    
    const weights = await prisma.roleWeights.findMany({
      orderBy: { createdAt: 'asc' }
    })
    
    console.log(`✅ [${requestId}] Successfully fetched role weights:`, weights.length, 'records')
    console.log(`📊 [${requestId}] Sample record:`, weights[0] ? {
      id: weights[0].id,
      name: weights[0].name,
      isActive: weights[0].isActive
    } : 'No records found')
    
    // Transform the data to handle Turso's wrapped format
    const transformedWeights = weights.map(transformRoleWeights).filter(weight => weight !== null)
    
    return NextResponse.json(transformedWeights)
  } catch (error) {
    console.error(`❌ [${requestId}] Error in GET /api/role-weights:`, error)
    console.error(`❌ [${requestId}] Error details:`, {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5).join('\n') : undefined,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json({ 
      error: 'Failed to fetch role weights',
      details: error instanceof Error ? error.message : String(error),
      requestId
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)
  console.log(`🌐 [${requestId}] POST /api/role-weights - Request started`)
  
  try {
    const body = await request.json()
    console.log(`📝 [${requestId}] Request body:`, { ...body, requestId })
    
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
      console.log(`❌ [${requestId}] Validation failed: Missing fields`)
      return NextResponse.json({ error: 'All fields are required', requestId }, { status: 400 })
    }

    // Validate weights sum to 1.0
    const totalWeight = parseFloat(inputWeight) + parseFloat(outputWeight) + 
                       parseFloat(outcomeWeight) + parseFloat(impactWeight)
    
    if (Math.abs(totalWeight - 1.0) > 0.001) {
      console.log(`❌ [${requestId}] Validation failed: Weights sum to ${totalWeight}, not 1.0`)
      return NextResponse.json({ error: 'Weights must sum to 1.0', requestId }, { status: 400 })
    }

    // Deactivate other weights if this one is active
    if (isActive) {
      console.log(`📝 [${requestId}] Deactivating other role weights...`)
      await prisma.roleWeights.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      })
    }

    console.log(`📝 [${requestId}] Creating new role weights...`)
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

    console.log(`✅ [${requestId}] Role weights created successfully:`, weights.id)
    return NextResponse.json(weights)
  } catch (error: any) {
    console.error(`❌ [${requestId}] Error in POST /api/role-weights:`, error)
    
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Role name already exists', requestId }, { status: 400 })
    }
    return NextResponse.json({ 
      error: 'Failed to create role weights',
      details: error instanceof Error ? error.message : String(error),
      requestId
    }, { status: 500 })
  }
} 