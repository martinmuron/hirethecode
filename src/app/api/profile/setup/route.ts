import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { role, displayName } = await req.json()

    // Check if profile already exists
    const existing = await db.select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1)

    if (!existing.length) {
      await db.insert(profiles).values({
        id: user.id,
        role,
        displayName: displayName || user.fullName || user.emailAddresses[0]?.emailAddress,
        avatarUrl: user.imageUrl,
      })
    }

    return new NextResponse('OK')
  } catch (error) {
    return new NextResponse('Error', { status: 500 })
  }
}
