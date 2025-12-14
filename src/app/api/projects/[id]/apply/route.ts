import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { 
  projects, 
  profiles,
  projectApplications,
  notifications
} from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

interface ApplicationRequest {
  message: string
}

export async function POST(
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

    const projectId = params.id
    const body: ApplicationRequest = await request.json()
    const { message } = body

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Application message is required' },
        { status: 400 }
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

    const applicant = userProfile[0]

    // Only developers and companies can apply
    if (!['developer', 'company'].includes(applicant.role)) {
      return NextResponse.json(
        { error: 'Only developers and companies can apply to projects' },
        { status: 403 }
      )
    }

    // Get project details
    const project = await db.select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1)

    if (!project.length) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Check if project is open
    if (project[0].status !== 'open') {
      return NextResponse.json(
        { error: 'This project is no longer accepting applications' },
        { status: 400 }
      )
    }

    // Check if user is project owner (seekers can't apply to their own projects)
    if (project[0].seekerId === user.id) {
      return NextResponse.json(
        { error: 'You cannot apply to your own project' },
        { status: 400 }
      )
    }

    // Check if user has already applied
    const existingApplication = await db.select()
      .from(projectApplications)
      .where(and(
        eq(projectApplications.projectId, projectId),
        eq(projectApplications.developerId, user.id) // NOTE: Using developerId for both developers and companies
      ))
      .limit(1)

    if (existingApplication.length > 0) {
      return NextResponse.json(
        { error: 'You have already applied to this project' },
        { status: 400 }
      )
    }

    // Create the application
    const newApplication = await db.insert(projectApplications)
      .values({
        projectId,
        developerId: user.id, // NOTE: developerId represents any applicant (dev or company)
        message: message.trim(),
        status: 'pending'
      })
      .returning()

    if (!newApplication.length) {
      throw new Error('Failed to create application')
    }

    // Create notification for project owner (seeker)
    try {
      await db.insert(notifications)
        .values({
          userId: project[0].seekerId,
          title: 'New Project Application',
          message: `${applicant.displayName || 'Someone'} applied to your project "${project[0].title}"`,
          type: 'application_status',
          data: {
            projectId: project[0].id,
            applicantId: user.id,
            applicantType: applicant.role,
            applicationId: newApplication[0].id
          }
        })
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError)
      // Don't fail the application if notification fails
    }

    return NextResponse.json(
      {
        ...newApplication[0],
        createdAt: newApplication[0].createdAt.toISOString()
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating project application:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch applications for a project (for project owners)
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

    const projectId = params.id

    // Verify user owns this project
    const project = await db.select()
      .from(projects)
      .where(and(
        eq(projects.id, projectId),
        eq(projects.seekerId, user.id)
      ))
      .limit(1)

    if (!project.length) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      )
    }

    // Get all applications with applicant details
    const applications = await db.select({
      application: projectApplications,
      applicant: profiles,
    })
      .from(projectApplications)
      .innerJoin(profiles, eq(projectApplications.developerId, profiles.id))
      .where(eq(projectApplications.projectId, projectId))

    const formattedApplications = applications.map(({ application, applicant }) => ({
      ...application,
      createdAt: application.createdAt.toISOString(),
      applicant: {
        id: applicant.id,
        displayName: applicant.displayName,
        avatarUrl: applicant.avatarUrl,
        role: applicant.role
      }
    }))

    return NextResponse.json({
      applications: formattedApplications,
      count: formattedApplications.length
    })

  } catch (error) {
    console.error('Error fetching project applications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
