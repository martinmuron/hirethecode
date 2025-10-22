import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { projects, projectSkills, skills, profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a seeker
    const userProfile = await db.select()
      .from(profiles)
      .where(eq(profiles.id, session.user.id))
      .limit(1)

    if (!userProfile.length || userProfile[0].role !== 'seeker') {
      return NextResponse.json({ error: 'Only seekers can post projects' }, { status: 403 })
    }

    const {
      title,
      description,
      budgetMin,
      budgetMax,
      currency,
      timeline,
      locationPref,
      requiredSkills
    } = await request.json()

    // Validate required fields
    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }

    // Create the project
    const [project] = await db.insert(projects).values({
      seekerId: session.user.id,
      title: title.trim(),
      description: description.trim(),
      budgetMin: budgetMin ? budgetMin.toString() : null,
      budgetMax: budgetMax ? budgetMax.toString() : null,
      currency: currency || 'USD',
      timeline: timeline || null,
      locationPref: locationPref || null,
      status: 'open',
    }).returning()

    // Handle required skills
    if (requiredSkills && Array.isArray(requiredSkills) && requiredSkills.length > 0) {
      for (const skillName of requiredSkills) {
        if (typeof skillName !== 'string' || !skillName.trim()) continue

        // Find or create skill
        let skill = await db.select()
          .from(skills)
          .where(eq(skills.label, skillName.trim()))
          .limit(1)

        if (!skill.length) {
          // Create new skill if it doesn't exist
          const slug = skillName.trim().toLowerCase().replace(/[^a-z0-9]/g, '-')
          skill = await db.insert(skills).values({
            slug,
            label: skillName.trim(),
          }).returning()
        }

        // Link skill to project
        if (skill.length > 0) {
          await db.insert(projectSkills).values({
            projectId: project.id,
            skillId: skill[0].id,
          }).onConflictDoNothing()
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      id: project.id,
      project: {
        ...project,
        requiredSkills
      }
    })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status') || 'open'

    // Get projects with seeker information
    const projectList = await db.select({
      project: projects,
      seeker: profiles,
    })
      .from(projects)
      .innerJoin(profiles, eq(projects.seekerId, profiles.id))
      .where(eq(projects.status, status as any))
      .orderBy(projects.createdAt)
      .limit(limit)
      .offset(offset)

    // Get skills for each project
    const projectsWithSkills = await Promise.all(
      projectList.map(async ({ project, seeker }) => {
        const projectSkillsData = await db.select({
          skill: skills
        })
          .from(projectSkills)
          .innerJoin(skills, eq(projectSkills.skillId, skills.id))
          .where(eq(projectSkills.projectId, project.id))

        return {
          ...project,
          seeker: {
            id: seeker.id,
            displayName: seeker.displayName,
            avatarUrl: seeker.avatarUrl,
          },
          skills: projectSkillsData.map(ps => ps.skill)
        }
      })
    )

    return NextResponse.json({
      projects: projectsWithSkills,
      pagination: {
        limit,
        offset,
        hasMore: projectsWithSkills.length === limit
      }
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
