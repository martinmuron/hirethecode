import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { developerContacts, profiles } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a company
    const userProfile = await db.select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1)

    if (!userProfile.length || userProfile[0].role !== 'company') {
      return NextResponse.json({ error: 'Only companies can contact developers' }, { status: 403 })
    }

    const { developerId, message } = await request.json()

    if (!developerId || !message?.trim()) {
      return NextResponse.json({ error: 'Developer ID and message are required' }, { status: 400 })
    }

    // Verify developer exists
    const developer = await db.select()
      .from(profiles)
      .where(and(
        eq(profiles.id, developerId),
        eq(profiles.role, 'developer')
      ))
      .limit(1)

    if (!developer.length) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 })
    }

    // Create contact record
    await db.insert(developerContacts).values({
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
