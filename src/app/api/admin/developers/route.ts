import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import {
  profiles, developerProfiles, users, developerSkills, skills
} from '@/lib/db/schema'
import { eq, and, desc, count, sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const db = getDb()
    const user = await currentUser()

    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminProfile = await db.query.profiles.findFirst({
      where: eq(profiles.id, user.id as string),
    })

    // console.log(`admin? ${JSON.stringify(adminProfile, null, "  ")}`)

    if (adminProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'pending', 'approved', 'rejected', or 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Build where conditions
    let whereConditions = eq(profiles.role, 'developer')
    
    if (status && status !== 'all') {
      whereConditions = and(
        whereConditions,
        eq(developerProfiles.approved, status as 'pending' | 'approved' | 'rejected')
      )
    }

    // console.log(`ABOUT TO CALL DB`)

    // Get developers with relations
    const developers = await db
      .select({
        // Profile info
        profileId: profiles.id,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
        timezone: profiles.timezone,
        profileCreatedAt: profiles.createdAt,
        
        // Developer profile info
        headline: developerProfiles.headline,
        bio: developerProfiles.bio,
        rate: developerProfiles.rate,
        availability: developerProfiles.availability,
        approved: developerProfiles.approved,
        portfolioUrl: developerProfiles.portfolioUrl,
        githubUrl: developerProfiles.githubUrl,
        websiteUrl: developerProfiles.websiteUrl,
        country: developerProfiles.country,
      })
      .from(profiles)
      .innerJoin(developerProfiles, eq(profiles.id, developerProfiles.userId))
      .where(whereConditions)
      .orderBy(desc(profiles.createdAt))
      .limit(limit)
      .offset(offset)

    // Get total count for pagination
    const [totalResult] = await db
      .select({ count: count() })
      .from(profiles)
      .innerJoin(developerProfiles, eq(profiles.id, developerProfiles.userId))
      .where(whereConditions)

    const total = totalResult.count

    // Get skills for each developer (could be optimized with a single query)
    const developersWithSkills = await Promise.all(
      developers.map(async (dev) => {
        const devSkills = await db
          .select({
            skillId: skills.id,
            skillSlug: skills.slug,
            skillLabel: skills.label,
            level: developerSkills.level,
          })
          .from(developerSkills)
          .innerJoin(skills, eq(developerSkills.skillId, skills.id))
          .where(eq(developerSkills.userId, dev.profileId))

        return {
          ...dev,
          skills: devSkills,
        }
      })
    )

    return NextResponse.json({
      developers: developersWithSkills,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch(err) {
    console.error(`Could not fetch developers: ${err}`)
    return NextResponse.json({ error: `Could not fetch developers: ${err}` }, { status: 500 })
  }
}

// PATCH /api/admin/developers - Update developer approval status
export async function PATCH(request: NextRequest) {
  try {
    const db = getDb()
    const user = await currentUser()
    
    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminProfile = await db.query.profiles.findFirst({
      where: eq(profiles.id, user.id as string),
    })

    if (adminProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { developerId, approved } = await request.json()

    if (!developerId || !approved || !['approved', 'rejected', 'pending'].includes(approved)) {
      return NextResponse.json(
        { error: 'Invalid request. Required: developerId, approved (approved|rejected|pending)' },
        { status: 400 }
      )
    }

    // Update developer approval status
    const [updatedDeveloper] = await db
      .update(developerProfiles)
      .set({ 
        approved: approved as 'approved' | 'rejected' | 'pending'
      })
      .where(eq(developerProfiles.userId, developerId))
      .returning()

    if (!updatedDeveloper) {
      return NextResponse.json(
        { error: 'Developer not found' },
        { status: 404 }
      )
    }

    // TODO: Send notification to developer about approval status change
    // You could create a notification record here

    return NextResponse.json({
      success: true,
      developer: updatedDeveloper,
    })

  } catch (error) {
    console.error('Error updating developer approval:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
