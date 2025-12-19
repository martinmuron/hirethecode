import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/database'

interface ApplicationRequest {
  message: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser()

    if (!user) {
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
    const userProfile = await db.profiles.findByUserId(user.id)

    if (!userProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Only developers and companies can apply
    if (!['developer', 'company'].includes(userProfile.role)) {
      return NextResponse.json(
        { error: 'Only developers and companies can apply to projects' },
        { status: 403 }
      )
    }

    // Get project details
    const project = await db.projects.findById(projectId)

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Check if project is open
    if (project.status !== 'open') {
      return NextResponse.json(
        { error: 'This project is no longer accepting applications' },
        { status: 400 }
      )
    }

    // Check if user is project owner (seekers can't apply to their own projects)
    if (project.seekerId === user.id) {
      return NextResponse.json(
        { error: 'You cannot apply to your own project' },
        { status: 400 }
      )
    }

    // Check if user has already applied
    const existingApplication = await db.applications.findByProjectAndUser(projectId, user.id)

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this project' },
        { status: 400 }
      )
    }

    // Create the application
    const newApplication = await db.applications.create({
      projectId,
      developerId: user.id, // NOTE: developerId represents any userProfile (dev or company)
      message: message.trim(),
      status: 'pending'
    })

    if (!newApplication) {
      throw new Error('Failed to create application')
    }

    // Create notification for project owner (seeker)
    try {
      await db.notifications.create({
        userId: project.seekerId,
        title: 'New Project Application',
        message: `${userProfile.displayName || 'Someone'} applied to your project "${project.title}"`,
        type: 'application_status',
        data: {
          projectId: project.id,
          userProfileId: user.id,
          userProfileType: userProfile.role,
          applicationId: newApplication.id
        }
      })
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError)
      // Don't fail the application if notification fails
    }

    return NextResponse.json(
      {
        ...newApplication,
        createdAt: newApplication.createdAt.toISOString()
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

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const projectId = params.id

    // Verify user owns this project
    const project = await db.projects.findById(projectId)

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      )
    }

    if (project.seekerId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const applicationsWithDetails = await db.applications.findApplicationsWithApplicantDetails(projectId)

    const formattedApplications = applicationsWithDetails.map(({ application, applicant }) => ({
      ...application,
      createdAt: application.createdAt.toISOString(),
      applicant
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
