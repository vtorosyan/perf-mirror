import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const debugInfo = {
      nodeEnv: process.env.NODE_ENV,
      hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
      hasTursoToken: !!process.env.TURSO_AUTH_TOKEN,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      tursoUrlPrefix: process.env.TURSO_DATABASE_URL?.substring(0, 20) + '...',
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(debugInfo)
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({ error: 'Debug endpoint failed' }, { status: 500 })
  }
} 