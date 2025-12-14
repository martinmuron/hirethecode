import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { 
  profiles, 
  companyProfiles,
  companySkills,
  skills as skillsTable
} from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user?.id) {
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

    // Update profile
    await db.update(profiles)
      .set({
        displayName: displayName || null,
      })
      .where(eq(profiles.id, userId))

    const existingProfile = await db.select()
      .from(companyProfiles)
      .where(eq(companyProfiles.userId, userId))
      .limit(1)

    const profileData = {
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
    }

    if(existingProfile.length > 0) {
      await db.update(companyProfiles)
        .set(profileData)
        .where(eq(companyProfiles.userId, userId))
    } else {
      await db.insert(companyProfiles)
        .values(profileData)
    }

    if(skillsInput && Array.isArray(skillsInput)) {
      console.log(`api/profile/company -> POST -> what are the skills? ${JSON.stringify(skillsInput, null, "  ")}`);
      
      await db.delete(companySkills)
        .where(eq(companySkills.userId, userId))

      for(const skillInput of skillsInput) {
        try {
          const existingSkill = await db.select()
            .from(skillsTable)
            .where(eq(skillsTable.label, skillInput.label.trim()))
            .limit(1)

          let skillId: number

          if(existingSkill.length > 0) {
            skillId = existingSkill[0].id
          } else {
            const newSkill = await db.insert(skillsTable)
              .values({
                label: skillInput.label.trim(),
                slug: skillInput.label.trim().toLowerCase().replace(/[^a-z0-9]/g, '-')
              })
              .returning({ id: skillsTable.id })

            skillId = newSkill[0].id
          }

          await db.insert(companySkills)
          .values({
            userId,
            skillId,
            importance: skillInput.importance || 'preferred'
          })
        } catch(skillError) {
          console.error(`Error processing skill ${skillInput.label}:`, skillError)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating company profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
