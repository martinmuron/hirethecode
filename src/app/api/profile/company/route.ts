import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      displayName,
      companyName,
      about,
      websiteUrl,
      industry,
      size,
      experienceLevel,
      workStyle,
      workEnvironment,
      benefits,
      teamSize,
      growth,
      skills: skillsInput
    } = await request.json()

    const userId = user.id

    // Validate required fields
    if (!companyName?.trim()) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 })
    }

    await db.profiles.update(userId, {
      displayName: displayName || null,
    })

    await db.companyProfiles.upsert(userId, {
      userId,
      companyName: companyName.trim(),
      about: about || null,
      websiteUrl: websiteUrl || null,
      industry: industry || null,
      size: size || null,
      experienceLevel: experienceLevel || 'any',
      workStyle: workStyle || 'flexible',
      workEnvironment: workEnvironment || null,
      benefits: benefits || null,
      teamSize: teamSize || null,
      growth: growth || null,
    })

    if (skillsInput && Array.isArray(skillsInput)) {
      console.log(`api/profile/company -> POST -> skills:`, skillsInput)
      
      await db.companySkills.replaceAllForUser(userId, skillsInput)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating company profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
