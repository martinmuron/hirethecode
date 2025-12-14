import { NextRequest, NextResponse } from 'next/server'
// import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  const { id, email, name, image } = await req.json()
  // const { userId } = auth()
  
  console.log('sync-user: received data:', { id, email, name }) // Debug

  /*
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { id, email, name, image } = await req.json()
  */

  try {
    // Check if profile already exists
    const existing = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, id))
      .limit(1)

    if (!existing.length) {
      console.log('sync-user: creating profile for:', id) // Debug
      await db.insert(profiles).values({
        id: id,
        role: 'developer', // Default - user can change in setup
        displayName: name || email,
        avatarUrl: image,
      })
      console.log('sync-user: profile created successfully') // Debug
    } else {
      console.log('sync-user: profile already exists') // Debug
    }

    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    console.error('Error syncing user:', error)
    return new NextResponse('Error', { status: 500 })
  }
}
