import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { DeveloperDashboard } from '@/components/dashboard/developer-dashboard'
import { CompanyDashboard } from '@/components/dashboard/company-dashboard'
import { AdminDashboard } from '@/components/dashboard/admin-dashboard'
import { SubscriptionRequired } from '@/components/dashboard/subscription-required'

export default async function DashboardPage() {
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

  // Check subscription status (simplified for now)
  // TODO: Integrate with Stripe to check actual subscription status
  const hasActiveSubscription = true // For now, assume everyone has subscription

  if (!hasActiveSubscription) {
    return <SubscriptionRequired role={profile.role} />
  }

  // Render appropriate dashboard based on role
  if (profile.role === 'developer') {
    return <DeveloperDashboard profile={profile} user={session.user} />
  } else if (profile.role === 'company') {
    return <CompanyDashboard profile={profile} user={session.user} />
  } else if (profile.role === 'admin') {
    return <AdminDashboard profile={profile} user={session.user} />
  }

  // Fallback - shouldn't happen but safety net
  redirect('/profile/setup')
}
