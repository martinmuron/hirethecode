import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userProfile = await db.profiles.findByUserId(user.id)

    if (!userProfile || userProfile.role !== 'company') {
      return NextResponse.json({ error: 'Only companies can contact developers' }, { status: 403 })
    }

    const { developerId, message } = await request.json()

    if (!developerId || !message?.trim()) {
      return NextResponse.json({ error: 'Developer ID and message are required' }, { status: 400 })
    }

    const developer = await db.profiles.findByUserId(developerId)

    if (!developer) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 })
    }

    await db.developerContacts.create({
      companyId: user.id,
      developerId,
      message: message.trim(),
      status: 'sent',
    })

    // TODO: Send email notification to developer using Resend

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending contact message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
