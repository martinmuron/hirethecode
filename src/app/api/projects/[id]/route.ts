import { currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { 
  projects, 
  profiles,
  projectSkills,
  skills
} from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

interface UpdateProjectBody {
  title: string
  description: string
  budgetMin?: number | null
  budgetMax?: number | null
  currency: string
  timeline?: string | null
  locationPref?: string | null
  requiredSkills: string[]
}

export async function PUT(
  request: NextRequest,
  { params }: { params }
) {
  try {
    const user = await currentUser()

    if (!user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user profile
    const userProfile = await db.select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1)

    if (!userProfile.length) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    const profile = userProfile[0]

    // Only companies can update projects
    if (profile.role !== 'company') {
      return NextResponse.json(
        { error: 'Only companies can update projects' },
        { status: 403 }
      )
    }

    // Verify the project exists and belongs to this company
    const { id } = await params
    console.log(`PROJECTS/[ID] -> params.id is ${id}`)
    const existingProject = await db.select()
      .from(projects)
      .where(and(
        eq(projects.id, id),
        eq(projects.companyId, profile.id)
      ))
      .limit(1)

    if (!existingProject.length) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      )
    }

    // Parse and validate request body
    const body: UpdateProjectBody = await request.json()

    // Basic validation
    if (!body.title?.trim() || !body.description?.trim()) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      )
    }

    // Validate budget values if provided
    if (body.budgetMin !== null && body.budgetMax !== null) {
      if (body.budgetMin && body.budgetMax && body.budgetMin > body.budgetMax) {
        return NextResponse.json(
          { error: 'Minimum budget cannot exceed maximum budget' },
          { status: 400 }
        )
      }
    }

    // Update the project
    const updatedProject = await db.update(projects)
      .set({
        title: body.title.trim(),
        description: body.description.trim(),
        budgetMin: body.budgetMin,
        budgetMax: body.budgetMax,
        currency: body.currency,
        timeline: body.timeline,
        locationPref: body.locationPref,
        updatedAt: new Date()
      })
      .where(eq(projects.id, id))
      .returning()

    // Update skills
    const projectSkills = await Promise.all(
      body.requiredSkills.map(async skillLabel => {
        const skill = await db.select()
          .from(skills)
          .where(eq(skills.label, skillLabel.trim()))
          .limit(1)
        return skill
      })
    )
    await db
      .delete(projectSkills)
      .where(eq(projectSkills.projectId, id))
    await Promise.all(projectSkills.map(async skill => {
      await db.insert(projectSkills)
      .values({
        projectId: id,
        skillId: skill.id
      })
      .returning()
    }))

    return NextResponse.json(updatedProject[0], { status: 200 })

  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Optional: Add GET method to fetch single project details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser()

    if (!user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const project = await db.select()
      .from(projects)
      .where(eq(projects.id, params.id))
      .limit(1)

    if (!project.length) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(project[0], { status: 200 })

  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Optional: Add DELETE method for project deletion
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser()

    if (!user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user profile
    const userProfile = await db.select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1)

    if (!userProfile.length || userProfile[0].role !== 'company') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Verify ownership and delete
    const deletedProject = await db.delete(projects)
      .where(and(
        eq(projects.id, params.id),
        eq(projects.companyId, userProfile[0].id)
      ))
      .returning()

    if (!deletedProject.length) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: 'Project deleted successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
