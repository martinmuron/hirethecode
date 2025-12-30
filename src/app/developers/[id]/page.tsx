import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/database'
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
  
  if (!user) {
    redirect('/auth/sign-in')
  }

  // Get user profile
  const userProfile = await db.profiles.findByUserId(user.id)

  if (!userProfile) {
    redirect('/profile/setup')
  }

  const developerPageData = await db.getDeveloperPageData(id, user.id)

  const { developer, isOwner } = developerPageData

  // Create developer object for component (maintaining backward compatibility)
  const developerWithDetails = {
    ...developer.profile,
    // Remove user object since it's no longer available (Clerk manages users)
    developerProfile: developer.developerProfile,
    skills: developer.skills
  }

  return (
    <DeveloperProfile 
      developer={developerWithDetails}
      user={user} 
      userRole={userProfile.role}
      userId={userProfile.id}
      isOwner={isOwner}
    />
  )
}
