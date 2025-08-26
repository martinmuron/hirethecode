import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { profiles, developerProfiles, developerSkills, skills } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
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

    const userId = session.user.id

    // Update profile
    await db.update(profiles)
      .set({
        displayName: displayName || null,
      })
      .where(eq(profiles.id, userId))

    // Update or create developer profile
    await db.insert(developerProfiles).values({
      userId,
      headline: headline || null,
      bio: bio || null,
      rate: rate ? rate.toString() : null,
      availability: availability || 'available',
      portfolioUrl: portfolioUrl || null,
      githubUrl: githubUrl || null,
      websiteUrl: websiteUrl || null,
      country: country || null,
    }).onConflictDoUpdate({
      target: developerProfiles.userId,
      set: {
        headline: headline || null,
        bio: bio || null,
        rate: rate ? rate.toString() : null,
        availability: availability || 'available',
        portfolioUrl: portfolioUrl || null,
        githubUrl: githubUrl || null,
        websiteUrl: websiteUrl || null,
        country: country || null,
      }
    })

    // Handle skills
    if (userSkills && Array.isArray(userSkills)) {
      // Remove existing skills
      await db.delete(developerSkills)
        .where(eq(developerSkills.userId, userId))

      // Add new skills
      for (const userSkill of userSkills) {
        // Ensure skill exists in skills table
        const existingSkill = await db.select()
          .from(skills)
          .where(eq(skills.id, userSkill.skillId))
          .limit(1)

        if (existingSkill.length > 0) {
          await db.insert(developerSkills).values({
            userId,
            skillId: userSkill.skillId,
            level: userSkill.level,
          })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating developer profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}