import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  const { userId } = auth()
  
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { id, email, name, image } = await req.json()

  try {
    // Check if profile already exists
    const existing = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, id))
      .limit(1)

    if (!existing.length) {
      // Create new profile
      await db.insert(profiles).values({
        id: id,
        role: 'developer', // Default - user can change in setup
        displayName: name || email,
        avatarUrl: image,
      })
      console.log('Created profile for user:', id)
    }

    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    console.error('Error syncing user:', error)
    return new NextResponse('Error', { status: 500 })
  }
}
