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

// Transform category data from Turso format to normal format
const transformCategory = (rawCategory: any): any => {
  if (!rawCategory) return null
  
  return {
    id: safeValue(rawCategory.id),
    name: safeValue(rawCategory.name),
    scorePerOccurrence: parseInt(safeValue(rawCategory.scorePerOccurrence)) || 0,
    dimension: safeValue(rawCategory.dimension),
    description: safeValue(rawCategory.description),
    createdAt: safeValue(rawCategory.createdAt),
    updatedAt: safeValue(rawCategory.updatedAt)
  }
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'asc' }
    })
    
    // Transform the data to handle Turso's wrapped format
    const transformedCategories = categories.map(transformCategory).filter(category => category !== null)
    
    return NextResponse.json(transformedCategories)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, scorePerOccurrence, dimension, description } = body

    if (!name || !scorePerOccurrence || !dimension) {
      return NextResponse.json({ error: 'Name, score, and dimension are required' }, { status: 400 })
    }

    if (!['input', 'output', 'outcome', 'impact'].includes(dimension)) {
      return NextResponse.json({ error: 'Dimension must be one of: input, output, outcome, impact' }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        name,
        scorePerOccurrence: parseInt(scorePerOccurrence),
        dimension,
        description: description || null
      }
    })

    // Transform the response data
    const transformedCategory = transformCategory(category)

    return NextResponse.json(transformedCategory)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
} 