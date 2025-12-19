import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/database'

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { role, displayName } = await req.json()

    // Check if profile already exists
    const existing = await db.profiles.findByUserId(user.id)
    if(!existing) {
      db.profiles.create({
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
