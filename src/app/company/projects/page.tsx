import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { profiles, projects, projectApplications, users, developerProfiles } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { ProjectManagementDashboard } from '@/components/company/project-management-dashboard'

export default async function CompanyProjectsPage() {
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

  // Only companies can access this page
  if (profile.role !== 'company') {
    redirect('/dashboard')
  }

  // Get company's projects with application counts
  const companyProjects = await db.select({
    id: projects.id,
    title: projects.title,
    description: projects.description,
    budgetMin: projects.budgetMin,
    budgetMax: projects.budgetMax,
    currency: projects.currency,
    timeline: projects.timeline,
    status: projects.status,
    createdAt: projects.createdAt,
  })
    .from(projects)
    .where(eq(projects.companyId, profile.id))
    .orderBy(desc(projects.createdAt))

  // Get all project IDs for this company
  const projectIds = companyProjects.map(p => p.id)

  // Get applications for all company projects
  const applications = projectIds.length > 0 ? await db.select({
    id: projectApplications.id,
    projectId: projectApplications.projectId,
    message: projectApplications.message,
    status: projectApplications.status,
    createdAt: projectApplications.createdAt,
    developer: {
      id: profiles.id,
      displayName: profiles.displayName,
      avatarUrl: profiles.avatarUrl,
      email: users.email,
    },
    developerProfile: {
      headline: developerProfiles.headline,
      rate: developerProfiles.rate,
      availability: developerProfiles.availability,
    }
  })
    .from(projectApplications)
    .innerJoin(profiles, eq(projectApplications.developerId, profiles.id))
    .leftJoin(developerProfiles, eq(profiles.id, developerProfiles.userId))
    .where(eq(profiles.role, 'developer'))
    .orderBy(desc(projectApplications.createdAt)) : []

  // Group applications by project
  const projectsWithApplications = companyProjects.map(project => ({
    ...project,
    applications: applications.filter(app => app.projectId === project.id),
    applicationCount: applications.filter(app => app.projectId === project.id).length,
    pendingCount: applications.filter(app => 
      app.projectId === project.id && app.status === 'pending'
    ).length,
  }))

  return (
    <ProjectManagementDashboard 
      user={user}
      projects={projectsWithApplications}
      companyId={profile.id}
    />
  )
}
