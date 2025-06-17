import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const level = searchParams.get('level')
    
    if (role && level) {
      const templates = await prisma.categoryTemplate.findMany({
        where: {
          role,
          level: parseInt(level)
        },
        orderBy: [
          { dimension: 'asc' },
          { categoryName: 'asc' }
        ]
      })
      
      return NextResponse.json(templates)
    }
    
    // Return all templates if no specific role/level requested
    const templates = await prisma.categoryTemplate.findMany({
      orderBy: [
        { role: 'asc' },
        { level: 'asc' },
        { dimension: 'asc' },
        { categoryName: 'asc' }
      ]
    })
    
    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching category templates:', error)
    return NextResponse.json({ error: 'Failed to fetch category templates' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const templates = await request.json()
    
    if (!Array.isArray(templates)) {
      return NextResponse.json({ error: 'Expected array of templates' }, { status: 400 })
    }
    
    // Use transaction to create/update all templates
    const results = await prisma.$transaction(
      templates.map(template => 
        prisma.categoryTemplate.upsert({
          where: {
            role_level_categoryName: {
              role: template.role,
              level: parseInt(template.level),
              categoryName: template.categoryName
            }
          },
          update: {
            dimension: template.dimension,
            scorePerOccurrence: parseInt(template.scorePerOccurrence),
            expectedWeeklyCount: parseFloat(template.expectedWeeklyCount),
            description: template.description
          },
          create: {
            role: template.role,
            level: parseInt(template.level),
            categoryName: template.categoryName,
            dimension: template.dimension,
            scorePerOccurrence: parseInt(template.scorePerOccurrence),
            expectedWeeklyCount: parseFloat(template.expectedWeeklyCount),
            description: template.description
          }
        })
      )
    )
    
    return NextResponse.json(results)
  } catch (error) {
    console.error('Error creating/updating category templates:', error)
    return NextResponse.json({ error: 'Failed to create/update category templates' }, { status: 500 })
  }
} 