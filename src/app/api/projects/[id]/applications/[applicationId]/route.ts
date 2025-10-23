import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { 
  projects, 
  projectApplications,
  profiles,
  notifications
} from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

interface UpdateApplicationRequest {
  status: 'accepted' | 'rejected'
}

// Update application status (accept/reject)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; applicationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id: projectId, applicationId } = params
    const body: UpdateApplicationRequest = await request.json()
    const { status } = body

    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Verify user owns this project
    const project = await db.select()
      .from(projects)
      .where(and(
        eq(projects.id, projectId),
        eq(projects.seekerId, session.user.id)
      ))
      .limit(1)

    if (!project.length) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      )
    }

    // Get application with applicant details
    const application = await db.select({
      application: projectApplications,
      applicant: profiles,
    })
      .from(projectApplications)
      .innerJoin(profiles, eq(projectApplications.developerId, profiles.id))
      .where(and(
        eq(projectApplications.id, applicationId),
        eq(projectApplications.projectId, projectId)
      ))
      .limit(1)

    if (!application.length) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Update application status
    const updatedApplication = await db.update(projectApplications)
      .set({ status })
      .where(eq(projectApplications.id, applicationId))
      .returning()

    // Create notification for applicant
    try {
      await db.insert(notifications)
        .values({
          userId: application[0].applicant.id,
          title: `Application ${status === 'accepted' ? 'Accepted' : 'Rejected'}`,
          message: `Your application to "${project[0].title}" has been ${status}`,
          type: 'application_status',
          data: {
            projectId: project[0].id,
            applicationId,
            status
          }
        })
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError)
    }

    return NextResponse.json({
      ...updatedApplication[0],
      createdAt: updatedApplication[0].createdAt.toISOString()
    })

  } catch (error) {
    console.error('Error updating application status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
