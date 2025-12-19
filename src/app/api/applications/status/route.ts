import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/database'
import { NotificationService } from '@/lib/services/notifications'

export async function PATCH(req: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const userProfile = await db.profiles.findById(user.id)

    if (!userProfile || userProfile.role !== 'company') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { applicationId, status } = await req.json()

    if (!applicationId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['accepted', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const application = await db.applications.findApplicationWithDetails(applicationId)

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Verify the company owns this project
    if (application.companyId !== userProfile.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await db.applications.updateStatus(applicationId, status as 'pending' | 'accepted' | 'rejected')

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
