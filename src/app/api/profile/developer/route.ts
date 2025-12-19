import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      displayName,
      headline,
      bio,
      rate,
      availability,
      portfolioUrl,
      githubUrl,
      websiteUrl,
      country,
      skills: userSkills
    } = await request.json()

    const userId = user.id

    await db.profiles.update(userId, {
      displayName: displayName || null,
    })

    await db.developerProfiles.upsert(userId, {
      userId,
      headline: headline || null,
      bio: bio || null,
      rate: rate ? parseFloat(rate) : null,
      availability: availability || 'available',
      approved: 'pending', // Keep existing approval status or set default
      portfolioUrl: portfolioUrl || null,
      githubUrl: githubUrl || null,
      websiteUrl: websiteUrl || null,
      country: country || null,
    })

    if (userSkills && Array.isArray(userSkills)) {
      console.log('Updating developer skills:', userSkills)
      
      await db.developerSkills.replaceAllForUser(userId, userSkills)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating developer profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
