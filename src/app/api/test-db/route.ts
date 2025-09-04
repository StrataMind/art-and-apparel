import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Test environment variables first
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: !!process.env.VERCEL,
      DATABASE_URL: !!process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL ? 'SET' : 'NOT SET',
      DATABASE_URL_PREVIEW: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 50) + '...' : 'NOT SET'
    }

    console.log('Environment check:', envCheck)

    // Try to import and test database connection
    let dbTest = null
    let dbError = null
    
    try {
      const { db } = await import('@/lib/db')
      console.log('Database imported successfully')
      
      // Test basic query
      const result = await db.$queryRaw`SELECT 1 as test`
      console.log('Database query result:', result)
      dbTest = { connected: true, result }
      
    } catch (error) {
      console.error('Database test failed:', error)
      dbError = {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: error.code || 'UNKNOWN',
        stack: error instanceof Error ? error.stack : 'No stack'
      }
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envCheck,
      database: dbTest,
      error: dbError
    })

  } catch (error) {
    console.error('Test endpoint failed:', error)
    return NextResponse.json(
      { 
        error: 'Test endpoint failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}