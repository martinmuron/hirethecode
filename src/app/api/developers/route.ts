import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { 
  profiles, 
  developerProfiles, 
  developerSkills, 
  skills,
  users 
} from '@/lib/db/schema'
import { eq, and, gte, lte, desc, asc, sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a company
    const userProfile = await db.select()
      .from(profiles)
      .where(eq(profiles.id, session.user.id))
      .limit(1)

    if (!userProfile.length || userProfile[0].role !== 'company') {
      return NextResponse.json({ error: 'Only companies can search developers' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const availability = searchParams.get('availability') || 'all'
    const rateRange = searchParams.get('rateRange') || 'all'
    const skill = searchParams.get('skill') || 'all'
    const sort = searchParams.get('sort') || 'recent'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build filter conditions
    let conditions = [eq(profiles.role, 'developer')]

    // Apply availability filter
    if (availability !== 'all') {
      conditions.push(eq(developerProfiles.availability, availability as any))
    }

    // Apply rate filter
    if (rateRange !== 'all') {
      const [min, max] = rateRange.split('-').map(r => r.replace('+', ''))
      if (max) {
        conditions.push(
          and(
            gte(sql`CAST(${developerProfiles.rate} AS DECIMAL)`, min),
            lte(sql`CAST(${developerProfiles.rate} AS DECIMAL)`, max)
          )!
        )
      } else if (min) {
        conditions.push(
          gte(sql`CAST(${developerProfiles.rate} AS DECIMAL)`, min)
        )
      }
    }

    // Execute the query with sorting
    let orderByClause
    switch (sort) {
      case 'rate-low':
        orderByClause = asc(sql`CAST(${developerProfiles.rate} AS DECIMAL)`)
        break
      case 'rate-high':
        orderByClause = desc(sql`CAST(${developerProfiles.rate} AS DECIMAL)`)
        break
      case 'available':
        orderByClause = sql`CASE ${developerProfiles.availability} WHEN 'available' THEN 1 WHEN 'busy' THEN 2 ELSE 3 END`
        break
      default: // recent
        orderByClause = desc(profiles.createdAt)
    }

    const developers = await db.select({
      profile: profiles,
      user: users,
      developerProfile: developerProfiles,
    })
      .from(profiles)
      .innerJoin(users, eq(profiles.id, users.id))
      .leftJoin(developerProfiles, eq(profiles.id, developerProfiles.userId))
      .where(and(...conditions))
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset)

    // Get skills for each developer
    const developersWithSkills = await Promise.all(
      developers.map(async ({ profile, user, developerProfile }) => {
        const developerSkillsData = await db.select({
          skill: skills,
          level: developerSkills.level
        })
          .from(developerSkills)
          .innerJoin(skills, eq(developerSkills.skillId, skills.id))
          .where(eq(developerSkills.userId, profile.id))

        // Filter by skill if specified
        if (skill !== 'all') {
          const hasSkill = developerSkillsData.some(ds => 
            ds.skill.label.toLowerCase() === skill.toLowerCase()
          )
          if (!hasSkill) return null
        }

        return {
          id: profile.id,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
          headline: developerProfile?.headline,
          bio: developerProfile?.bio,
          rate: developerProfile?.rate,
          availability: developerProfile?.availability,
          portfolioUrl: developerProfile?.portfolioUrl,
          githubUrl: developerProfile?.githubUrl,
          websiteUrl: developerProfile?.websiteUrl,
          country: developerProfile?.country,
          skills: developerSkillsData.map(ds => ({
            id: ds.skill.id,
            label: ds.skill.label,
            level: ds.level
          }))
        }
      })
    )

    // Filter out null results (developers without required skill)
    const filteredDevelopers = developersWithSkills.filter(dev => dev !== null)

    return NextResponse.json({
      developers: filteredDevelopers,
      pagination: {
        limit,
        offset,
        hasMore: filteredDevelopers.length === limit
      }
    })
  } catch (error) {
    console.error('Error fetching developers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}