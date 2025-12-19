import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userProfile = db.profiles.findByUserId(user.id)

    const adminAndCompany = new Set(['admin', 'company'])
    if (!userProfile || !adminAndCompany.has(userProfile.role)) {
      return NextResponse.json({ error: 'Only companies and admin can search developers' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const developers = await db.developerProfiles.findApprovedDevelopers({
      availability: searchParams.get('availability') as any || 'all',
      rateRange: searchParams.get('rateRange') || 'all',
      skill: searchParams.get('skill') || 'all',
      sort: searchParams.get('sort') as any || 'recent',
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0')
    })


    return NextResponse.json({
      developers,
      pagination: {
        limit: parseInt(searchParams.get('limit') || '50'),
        offset: parseInt(searchParams.get('offset') || '0'),
        hasMore: developers.length === parseInt(searchParams.get('limit') || '50')
      }
    })
  } catch (error) {
    console.error('Error fetching developers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
