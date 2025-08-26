import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { profiles, companyProfiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      displayName,
      companyName,
      about,
      websiteUrl,
      industry,
      size,
    } = await request.json()

    const userId = session.user.id

    // Validate required fields
    if (!companyName?.trim()) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 })
    }

    // Update profile
    await db.update(profiles)
      .set({
        displayName: displayName || null,
      })
      .where(eq(profiles.id, userId))

    // Update or create company profile
    await db.insert(companyProfiles).values({
      userId,
      companyName: companyName.trim(),
      about: about || null,
      websiteUrl: websiteUrl || null,
      industry: industry || null,
      size: size || null,
    }).onConflictDoUpdate({
      target: companyProfiles.userId,
      set: {
        companyName: companyName.trim(),
        about: about || null,
        websiteUrl: websiteUrl || null,
        industry: industry || null,
        size: size || null,
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating company profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}