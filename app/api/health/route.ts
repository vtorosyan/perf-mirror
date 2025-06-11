import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simple health check - could add database connectivity check here
    return NextResponse.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      app: 'perf-mirror'
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: 'Service unavailable' },
      { status: 503 }
    );
  }
} 