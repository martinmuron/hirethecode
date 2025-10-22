import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
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

  const unreadCount = await db.select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(
      eq(notifications.userId, session.user.id),
      eq(notifications.isRead, false)
    ))

  // Check subscription status (simplified for now)
  // TODO: Integrate with Stripe to check actual subscription status
  const hasActiveSubscription = true // For now, assume everyone has subscription

  if (!hasActiveSubscription) {
    return <SubscriptionRequired role={profile.role} />
  }

  switch (profile.role) {
    case 'developer':
      return (
        <DeveloperDashboard 
          profile={profile} 
          user={session.user}
          unreadNotificationCount={unreadCount}
        />
      )

    case 'seeker':
      // Get seeker-specific stats
      const activeProjects = await db.select({ count: sql<number>`count(*)` })
        .from(projects)
        .where(and(
          eq(projects.seekerId, session.user.id),
          eq(projects.status, 'open')
        ))

      // Get total applications count (you'll need to implement this based on your applications schema)
      const totalApplications = 0 // TODO: Implement when you have project applications

      return (
        <SeekerDashboard 
          profile={profile} 
          user={session.user}
          unreadNotificationCount={unreadCount}
          activeProjects={activeProjects[0]?.count || 0}
          totalApplications={totalApplications}
        />
      )

    case 'company':
      // Return your existing company dashboard
      // return <CompanyDashboard ... />
      return <div>Company Dashboard (TODO)</div>

    case 'admin':
      return <div>Admin Dashboard (TODO)</div>

    default:
      redirect('/profile/setup')
  }
}
