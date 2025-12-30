import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/database'

export async function POST(req: NextRequest) {
  const { id, email, name, image } = await req.json()
  const user = await currentUser()
  
  console.log('sync-user: received data:', { id, email, name }) // Debug

  try {
    // Check if profile already exists
    const existing = db.profiles.findByUserId(user.id)

    if (!existing) {
      console.log('sync-user: creating profile for:', id) // Debug
      await db.profiles.create({
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
