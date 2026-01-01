import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { DeveloperSearch } from '@/components/developers/developer-search'

export default async function DevelopersPage() {
  const user = await currentUser()
  
  if (!user) {
    redirect('/auth/sign-in')
  }

  // Get user profile
  const userProfile = await db.profiles.findByUserId(user.id)

  if (!userProfile) {
    redirect('/profile/setup')
  }

  return (
    <DeveloperSearch 
      user={user} 
      companyId={userProfile.id}
      userRole={userProfile.role as 'developer' | 'company' | 'admin' | 'seeker'}
    />
  )
}
