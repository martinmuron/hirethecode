import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/database'

interface UpdateApplicationRequest {
  status: 'accepted' | 'rejected'
}

// Update application status (accept/reject)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; applicationId: string } }
) {
  try {
    const user = await currentUser()

    if (!user) {
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
    const project = await db.projects.findById(id)

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      )
    }

    // Get application with applicant details
    const application = await db.applications.findApplicationWithDetails(applicationId)

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Update application status
    const updatedApplication = await db.applications.updateStatus(applicationId, status)

    // Create notification for applicant
    await db.notifications.create({
      userId: application.applicant.id,
      title: `Application ${status === 'accepted' ? 'Accepted' : 'Rejected'}`,
      message: `Your application to "${project.title}" has been ${status}`,
      type: 'application_status',
      data: {
        projectId: project.id,
        applicationId,
        status
      }
    })

    return NextResponse.json({
      ...updatedApplication,
      createdAt: updatedApplication.createdAt.toISOString()
    })

  } catch (error) {
    console.error('Error updating application status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
