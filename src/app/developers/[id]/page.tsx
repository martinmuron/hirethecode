import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { 
  profiles, 
  users, 
  developerProfiles, 
  developerSkills, 
  skills 
} from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { DeveloperProfile } from '@/components/developers/developer-profile'
import { notFound } from 'next/navigation'

interface DeveloperPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function DeveloperPage({ params }: DeveloperPageProps) {
  const { id } = await params
  const user = await currentUser()
  
  if (!user?.email) {
    redirect('/auth/sign-in')
  }

  // Get user profile
  const userProfile = await db.select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1)

  if (!userProfile.length) {
    redirect('/profile/setup')
  }

  const profile = userProfile[0]

  // Get developer profile
  const developerData = await db.select({
    profile: profiles,
    user: users,
    developerProfile: developerProfiles,
  })
    .from(profiles)
    .leftJoin(developerProfiles, eq(profiles.id, developerProfiles.userId))
    .where(eq(profiles.id, id))
    .limit(1)

  if (!developerData.length || developerData[0].profile.role !== 'developer') {
    notFound()
  }

  const { profile: devProfile, user: devUser, developerProfile } = developerData[0]

  // Get developer skills
  const developerSkillsData = await db.select({
    skill: skills,
    level: developerSkills.level
  })
    .from(developerSkills)
    .innerJoin(skills, eq(developerSkills.skillId, skills.id))
    .where(eq(developerSkills.userId, devProfile.id))

  const developerWithDetails = {
    ...devProfile,
    user: devUser,
    developerProfile,
    skills: developerSkillsData.map(ds => ({
      id: ds.skill.id,
      slug: ds.skill.slug,
      label: ds.skill.label,
      level: ds.level
    }))
  }

  return (
    <DeveloperProfile 
      developer={developerWithDetails}
      user={user} 
      userRole={profile.role}
      userId={profile.id}
      isOwner={profile.id === devProfile.id}
    />
  )
}
