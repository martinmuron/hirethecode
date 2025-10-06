import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { users, profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { EmailService } from '@/lib/email/email-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, role, displayName } = await request.json()

    // Validate input
    if (!role || !displayName || !['developer', 'company'].includes(role)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    let extantProfileId = null
    // Check if user already has a profile
    const existingProfile = await db.select()
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1)

    if (existingProfile.length > 0) {
      extantProfileId = existingProfile.id
    }

    // Create or update user record
    await db.insert(users).values({
      id: userId,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
    }).onConflictDoUpdate({
      target: users.id,
      set: {
        name: session.user.name,
        image: session.user.image,
      }
    })

    // Create profile
    await db.insert(profiles).values({
      id: userId,
      role: role as 'developer' | 'company',
      displayName,
    }).onConflictDoUpdate({
      target: profiles.id,
      set: {
        role: role as 'developer' | 'company',
        displayName
      }
    })

    // Send welcome email for developers
    if (role === 'developer') {
      try {
        await EmailService.sendWelcomeDeveloperEmail(
          session.user.email,
          displayName,
          userId
        )
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError)
        // Don't fail the profile creation if email fails
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error creating profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
