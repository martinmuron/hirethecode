import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server' // Add missing import
import { db } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminProfile = await db.profiles.findByUserId(user.id)

    if (adminProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'pending', 'approved', 'rejected', or 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    const filters = {
      status: status || 'all',
      page,
      limit,
      offset
    }

    const developers = await  db.developerProfiles.findDevelopersForAdmin(filters)

    const total = await db.developerProfiles.getTotalDevelopersCount(filters)

    const userIds = developers.map(dev => dev.profileId)
    const skillsByUser = await db.developerSkills.findSkillsForDevelopers(userIds)

    const developersWithSkills = developers.map(dev => ({
      ...dev,
      skills: skillsByUser.get(dev.profileId) || []
    }))

    return NextResponse.json({
      developers: developersWithSkills,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch(err) {
    console.error(`Could not fetch developers: ${err}`)
    return NextResponse.json({ error: `Could not fetch developers: ${err}` }, { status: 500 })
  }
}

// PATCH /api/admin/developers - Update developer approval status
export async function PATCH(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminProfile = await db.profiles.findByUserId(user.id)

    if (adminProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { developerId, approved } = await request.json()

    if (!developerId || !approved || !['approved', 'rejected', 'pending'].includes(approved)) {
      return NextResponse.json(
        { error: 'Invalid request. Required: developerId, approved (approved|rejected|pending)' },
        { status: 400 }
      )
    }

    try {
      const updatedDeveloper = await db.developerProfiles.updateApprovalStatus(
        developerId, 
        approved as 'approved' | 'rejected' | 'pending'
      )

      // TODO: Send notification to developer about approval status change
      // You could create a notification record here
      if (approved !== 'pending') {
        try {
          await db.notifications.create({
            userId: developerId,
            title: `Application ${approved}`,
            message: `Your developer application has been ${approved}.`,
            type: 'application_status',
            isRead: false,
            data: {
              status: approved,
              updatedBy: user.id
            }
          })
        } catch (notificationError) {
          console.error('Failed to create notification:', notificationError)
          // Don't fail the main operation if notification fails
        }
      }

      return NextResponse.json({
        success: true,
        developer: updatedDeveloper,
      })

    } catch (error) {
      if (error.message === 'Developer not found') {
        return NextResponse.json(
          { error: 'Developer not found' },
          { status: 404 }
        )
      }
      throw error
    }

    // TODO: Send notification to developer about approval status change
    // You could create a notification record here

    return NextResponse.json({
      success: true,
      developer: updatedDeveloper,
    })

  } catch (error) {
    console.error('Error updating developer approval:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
