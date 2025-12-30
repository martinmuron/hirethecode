import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server' 
import { db } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      console.log('❌ No session in admin stats')
      return NextResponse.json({ error: 'No session' }, { status: 401 })
    }

    const adminProfile = await db.profiles.findByUserId(user.id)

    if (!adminProfile) {
      console.log('❌ No profile found for user:', user.id)
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if(adminProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'You are not an admin, vole' }, { status: 403 })
    }

    const stats = await db.adminStats.getAdminDashboardStats()
    
    return NextResponse.json({ stats })
  } catch(err) {
    console.error(`Error fetching stats, vole: ${err}`)
    return NextResponse.json({ error: `Error fetching stats, vole: ${err}` }, { status: 500 })
  }
}
