import { NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function POST() {
  try {
    // Create a test profile
    const testProfile = await db.profiles.create({
      id: 'i-am-a-marmot',
      role: 'developer',
      displayName: 'Marmot Developer',
      timezone: 'UTC'
    })

    return NextResponse.json({
      message: 'Marmot created',
      profile: testProfile
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to seed marmot',
      details: error.message
    }, { status: 500 })
  }
}
