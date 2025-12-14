import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { SmartMatchPage } from '@/components/smart-match/smart-match-page'

export default async function SmartMatch() {
  const user = await currentUser()

  if (!user?.email) {
    redirect('/auth/sign-in')
  }

  // Get user profile from database
  const userProfile = await db.select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1)

  // If no profile exists, redirect to profile creation
  if (!userProfile.length) {
    redirect('/profile/setup')
  }

  const profile = userProfile[0]

  // Only allow developers and companies
  if (!['developer', 'company'].includes(profile.role)) {
    redirect('/dashboard')
  }

  return <SmartMatchPage profile={profile} user={user} />
}
