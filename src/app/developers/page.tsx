import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { DeveloperSearch } from '@/components/developers/developer-search'

export default async function DevelopersPage() {
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

  return (
    <DeveloperSearch 
      user={user} 
      companyId={profile.id}
      userRole={profile.role as 'developer' | 'company' | 'admin'}
    />
  )
}
