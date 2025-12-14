import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { profiles, notifications, projects } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { DeveloperDashboard } from '@/components/dashboard/developer-dashboard'
import { CompanyDashboard } from '@/components/dashboard/company-dashboard'
import { AdminDashboard } from '@/components/dashboard/admin-dashboard'
import { SeekerDashboard } from '@/components/dashboard/seeker-dashboard'
import { SubscriptionRequired } from '@/components/dashboard/subscription-required'

export default async function DashboardPage() {
  // const { userId } = auth()
  const user = await currentUser()
  const id = user?.id

  console.log(`Dashboard: userId -> ${id}`)
  
  if (!id) {
    console.log('Dashboard: No userId, redirecting to sign-in')
    redirect('/auth/sign-in')
  }

  // Get user profile from database
  const userProfile = await db.select()
    .from(profiles)
    .where(eq(profiles.id, id))
    .limit(1)

  if (!userProfile.length) {
    redirect('/profile/setup')
  }

  const profile = userProfile[0]

  const unreadCount = await db.select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(
      eq(notifications.userId, id),
      eq(notifications.isRead, false)
    ))

  // Check subscription status (simplified for now)
  // TODO: Integrate with Stripe to check actual subscription status
  const hasActiveSubscription = true // For now, assume everyone has subscription

  if (!hasActiveSubscription) {
    return <SubscriptionRequired role={profile.role} />
  }

  const constructedUser = { id: id }

  switch (profile.role) {
    case 'developer':
      return (
        <DeveloperDashboard 
          profile={profile} 
          user={constructedUser}
          unreadNotificationCount={unreadCount}
        />
      )

    case 'seeker':
      // Get seeker-specific stats
      const activeProjects = await db.select({ count: sql<number>`count(*)` })
        .from(projects)
        .where(and(
          eq(projects.seekerId, id),
          eq(projects.status, 'open')
        ))

      const totalApplications = 0 // TODO: Implement when you have project applications

      return (
        <SeekerDashboard 
          profile={profile} 
          user={constructedUser}
          unreadNotificationCount={unreadCount}
          activeProjects={activeProjects[0]?.count || 0}
          totalApplications={totalApplications}
        />
      )

    case 'company':
      return <div>Company Dashboard (TODO)</div>

    case 'admin':
      return <div>Admin Dashboard (TODO)</div>

    default:
      redirect('/profile/setup')
  }
}
