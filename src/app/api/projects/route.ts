import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { 
  projects, 
  profiles,
  projectSkills,
  skills as skillsTable
} from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

interface CreateProjectRequest {
  title: string
  description: string
  budgetMin?: number | null
  budgetMax?: number | null
  currency: string
  timeline?: string | null
  locationPref?: string | null
  requiredSkills: string[]
  // Claude analysis fields
  complexity?: 'simple' | 'moderate' | 'complex' | 'enterprise' | null
  estimatedTimeline?: string | null
  recommendedFor?: 'freelancer' | 'company' | 'either' | null
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify user is a seeker
    const userProfile = await db.select()
      .from(profiles)
      .where(eq(profiles.id, session.user.id))
      .limit(1)

    if (!userProfile.length) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    if (userProfile[0].role !== 'seeker') {
      return NextResponse.json(
        { error: 'Only seekers can post projects' },
        { status: 403 }
      )
    }

    const body: CreateProjectRequest = await request.json()
    const {
      title,
      description,
      budgetMin,
      budgetMax,
      currency,
      timeline,
      locationPref,
      requiredSkills,
      complexity,
      estimatedTimeline,
      recommendedFor
    } = body

    // Basic validation
    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      )
    }

    // Validate budget
    if (budgetMin !== null && budgetMax !== null && budgetMin && budgetMax && budgetMin > budgetMax) {
      return NextResponse.json(
        { error: 'Minimum budget cannot exceed maximum budget' },
        { status: 400 }
      )
    }

    // Create the project
    const newProject = await db.insert(projects)
      .values({
        seekerId: session.user.id, // UPDATED: seekerId instead of companyId
        title: title.trim(),
        description: description.trim(),
        budgetMin: budgetMin || null,
        budgetMax: budgetMax || null,
        currency: currency || 'USD',
        timeline: timeline || null,
        locationPref: locationPref || null,
        complexity: complexity || null,
        estimatedTimeline: estimatedTimeline || null,
        recommendedFor: recommendedFor || null,
        status: 'open',
      })
      .returning()

    if (!newProject.length) {
      throw new Error('Failed to create project')
    }

    const projectId = newProject[0].id

    // Handle required skills
    if (requiredSkills && Array.isArray(requiredSkills) && requiredSkills.length > 0) {
      for (const skillLabel of requiredSkills) {
        try {
          // Find or create skill
          let existingSkill = await db.select()
            .from(skillsTable)
            .where(eq(skillsTable.label, skillLabel.trim()))
            .limit(1)

          let skillId: number

          if (existingSkill.length > 0) {
            skillId = existingSkill[0].id
          } else {
            // Create new skill
            const newSkill = await db.insert(skillsTable)
              .values({
                label: skillLabel.trim(),
                slug: skillLabel.trim().toLowerCase().replace(/[^a-z0-9]/g, '-')
              })
              .returning({ id: skillsTable.id })
            
            skillId = newSkill[0].id
          }

          // Add project skill relationship
          await db.insert(projectSkills)
            .values({
              projectId,
              skillId
            })
        } catch (skillError) {
          console.error(`Error processing skill "${skillLabel}":`, skillError)
          // Continue with other skills if one fails
        }
      }
    }

    return NextResponse.json(
      { 
        ...newProject[0],
        createdAt: newProject[0].createdAt.toISOString()
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
