import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const profile = await prisma.userProfile.findFirst({
      where: { isActive: true }
    })
    
    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { role, level } = await request.json()
    
    // Validate role and level combinations
    if (role === 'IC' && (level < 1 || level > 8)) {
      return NextResponse.json({ error: 'IC levels must be between 1 and 8' }, { status: 400 })
    }
    if (role === 'Manager' && (level < 4 || level > 8)) {
      return NextResponse.json({ error: 'Manager levels must be between 4 and 8' }, { status: 400 })
    }
    if (!['IC', 'Manager'].includes(role)) {
      return NextResponse.json({ error: 'Role must be IC or Manager' }, { status: 400 })
    }
    
    // Deactivate existing profiles
    await prisma.userProfile.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    })
    
    // Create new active profile
    const profile = await prisma.userProfile.create({
      data: {
        role,
        level: parseInt(level),
        isActive: true
      }
    })
    
    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error creating user profile:', error)
    return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 })
  }
} 