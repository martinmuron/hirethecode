import { NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET() {
  try {
    // Test basic connection
    const result = await db.profiles.findByRole('developer')
    
    return NextResponse.json({
      status: 'Connected to Neon!',
      profileCount: result.length,
      message: 'Database connection successful'
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Database connection failed',
      details: error.message
    }, { status: 500 })
  }
}
