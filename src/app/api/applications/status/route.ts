import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { projectApplications, profiles, projects, companyProfiles } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { NotificationService } from '@/lib/services/notifications'

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const userProfile = await db.select()
      .from(profiles)
      .where(eq(profiles.id, session.user.id))
      .limit(1)

    if (!userProfile.length || userProfile[0].role !== 'company') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { applicationId, status } = await req.json()

    if (!applicationId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['accepted', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Get the application with project and company details to verify ownership
    const application = await db.select({
      id: projectApplications.id,
      projectId: projectApplications.projectId,
      developerId: projectApplications.developerId,
      companyId: projects.companyId,
      projectTitle: projects.title,
      companyName: profiles.displayName,
      companyProfileName: companyProfiles.companyName
    })
      .from(projectApplications)
      .innerJoin(projects, eq(projectApplications.projectId, projects.id))
      .innerJoin(profiles, eq(projects.companyId, profiles.id))
      .leftJoin(companyProfiles, eq(profiles.id, companyProfiles.userId))
      .where(eq(projectApplications.id, applicationId))
      .limit(1)

    if (!application.length) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Verify the company owns this project
    if (application[0].companyId !== userProfile[0].id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update the application status
    await db.update(projectApplications)
      .set({ 
        status: status as 'pending' | 'accepted' | 'rejected'
      })
      .where(eq(projectApplications.id, applicationId))

    // Create notification for developer if status is accepted or rejected
    if (status === 'accepted' || status === 'rejected') {
      const companyDisplayName = application[0].companyProfileName || application[0].companyName || 'Company'
      
      try {
        await NotificationService.createApplicationStatusNotification(
          application[0].developerId,
          status as 'accepted' | 'rejected',
          application[0].projectTitle,
          companyDisplayName,
          applicationId,
          application[0].projectId
        )
      } catch (notificationError) {
        console.error('Failed to create notification:', notificationError)
        // Don't fail the entire request if notification creation fails
      }
    }

    return NextResponse.json({ 
      success: true,
      message: `Application ${status} successfully` 
    })

  } catch (error) {
    console.error('Error updating application status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}