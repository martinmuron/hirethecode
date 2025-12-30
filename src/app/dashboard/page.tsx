import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/database'
import { DeveloperDashboard } from '@/components/dashboard/developer-dashboard'
import { CompanyDashboard } from '@/components/dashboard/company-dashboard'
import { AdminDashboard } from '@/components/dashboard/admin-dashboard'
import { SeekerDashboard } from '@/components/dashboard/seeker-dashboard'
import { SubscriptionRequired } from '@/components/dashboard/subscription-required'

export default async function DashboardPage() {
  const user = await currentUser()
  const id = user?.id

  console.log(`Dashboard: userId -> ${id}`)
  
  if (!id) {
    console.log('Dashboard: No userId, redirecting to sign-in')
    redirect('/auth/sign-in')
  }

  // Get user profile from database
  const userProfile = await db.profiles.findByUserId(id)

  if (!userProfile) {
    redirect('/profile/setup')
  }

  const unreadCount = await db.notifications.findUnreadCountByUserId(id)

  // Check subscription status (simplified for now)
  // TODO: Integrate with Stripe to check actual subscription status
  const hasActiveSubscription = true // For now, assume everyone has subscription

  if (!hasActiveSubscription) {
    return <SubscriptionRequired role={profile.role} />
  }

  const constructedUser = { id: id }

  switch (userProfile.role) {
    case 'developer':
      return (
        <DeveloperDashboard 
          profile={userProfile} 
          user={constructedUser}
          unreadNotificationCount={unreadCount}
        />
      )

    case 'seeker':
      // Get seeker-specific stats
      const activeProjects = await db.projects.findOpenProjectsCountBySeekerId(id)

      const totalApplications = 0 // TODO: Implement when you have project applications

      return (
        <SeekerDashboard 
          profile={userProfile} 
          user={constructedUser}
          unreadNotificationCount={unreadCount}
          activeProjects={activeProjects?.count || 0}
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
