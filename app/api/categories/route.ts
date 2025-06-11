import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'asc' }
    })
    return NextResponse.json(categories)
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

    return NextResponse.json(category)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
} 