import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, scorePerOccurrence, dimension, description } = body

    if (dimension && !['input', 'output', 'outcome', 'impact'].includes(dimension)) {
      return NextResponse.json({ error: 'Dimension must be one of: input, output, outcome, impact' }, { status: 400 })
    }

    const category = await prisma.category.update({
      where: { id: params.id },
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
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.category.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
} 