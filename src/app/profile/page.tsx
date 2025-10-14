import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { profiles, users, developerProfiles, companyProfiles, developerSkills, skills, companySkills as companySkillsTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { DeveloperProfileEditor } from '@/components/profile/developer-profile-editor'
import { CompanyProfileEditor } from '@/components/profile/company-profile-editor'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect('/auth/sign-in')
  }

  // Get user profile
  const userProfile = await db.select()
    .from(profiles)
    .innerJoin(users, eq(profiles.id, users.id))
    .where(eq(profiles.id, session.user.id))
    .limit(1)

  if (!userProfile.length) {
    redirect('/profile/setup')
  }

  const profile = userProfile[0].profiles
  const user = userProfile[0].users

  if (profile.role === 'developer') {
    // Get developer-specific profile data
    const developerData = await db.select()
      .from(developerProfiles)
      .where(eq(developerProfiles.userId, profile.id))
      .limit(1)

    // Get developer skills
    const userSkills = await db.select({
      skill: skills,
      level: developerSkills.level
    })
      .from(developerSkills)
      .innerJoin(skills, eq(developerSkills.skillId, skills.id))
      .where(eq(developerSkills.userId, profile.id))

    return (
      <DeveloperProfileEditor 
        profile={profile}
        user={user}
        developerProfile={developerData[0] || null}
        userSkills={userSkills}
      />
    )
  } else if (profile.role === 'company') {
    // Get company-specific profile data
    const companyData = await db.select()
      .from(companyProfiles)
      .where(eq(companyProfiles.userId, profile.id))
      .limit(1)
    const companySkills = await db.select({
      skill: skills,
      importance: companySkillsTable.importance
    })
      .from(companySkillsTable)
      .innerJoin(skills, eq(companySkillsTable.skillId, skills.id))
      .where(eq(companySkillsTable.userId, profile.id))

    return (
      <CompanyProfileEditor 
        profile={profile}
        user={user}
        companyProfile={companyData[0] || null}
        companySkills={companySkills}
      />
    )
  }

  redirect('/dashboard')
}
