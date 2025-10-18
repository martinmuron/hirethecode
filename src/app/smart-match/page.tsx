import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { SmartMatchPage } from '@/components/smart-match/smart-match-page'

export default async function SmartMatch() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/auth/sign-in')
  }

  // Get user profile from database
  const userProfile = await db.select()
    .from(profiles)
    .where(eq(profiles.id, session.user.id))
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

  return <SmartMatchPage profile={profile} user={session.user} />
}
