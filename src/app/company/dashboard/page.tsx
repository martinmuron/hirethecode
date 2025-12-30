import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/database'
import { CompanyDashboard } from '@/components/company/company-dashboard'

export default async function CompanyDashboardPage() {
  const user = await currentUser()
  
  if (!user) {
    redirect('/auth/sign-in')
  }

  // Get user profile
  const userProfile = await db.profiles.findByUserId(user.id)

  if (!userProfile) {
    redirect('/profile/setup')
  }

  // Only companies can access this page
  if (userProfile.role !== 'company') {
    redirect('/dashboard')
  }

  const dashboardData = await db.getCompanyDashboardData(userProfile.id)

  return (
    <CompanyDashboard 
      user={user}
      company={userProfile}
      projects={dashboardData.projects}
      recentApplications={dashboardData.recentApplications}
      subscription={dashboardData.subscription}
      stats={dashboardData.stats}
    />
  )
}
