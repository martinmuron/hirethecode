import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/database'
import { ProjectManagementDashboard } from '@/components/company/project-management-dashboard'

export default async function CompanyProjectsPage() {
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

  const projectsData = await db.getCompanyProjectsData(userProfile.id)

  return (
    <ProjectManagementDashboard 
      user={user}
      projects={projectsData.projects}
      companyId={userProfile.id}
    />
  )
}
