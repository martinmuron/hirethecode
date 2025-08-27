import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { 
  profiles, 
  projects, 
  projectApplications, 
  subscriptions,
  users,
  developerProfiles 
} from '@/lib/db/schema'
import { eq, and, desc, count } from 'drizzle-orm'
import { CompanyDashboard } from '@/components/company/company-dashboard'

export default async function CompanyDashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect('/auth/sign-in')
  }

  // Get user profile
  const userProfile = await db.select()
    .from(profiles)
    .where(eq(profiles.id, session.user.id))
    .limit(1)

  if (!userProfile.length) {
    redirect('/profile/setup')
  }

  const profile = userProfile[0]

  // Only companies can access this page
  if (profile.role !== 'company') {
    redirect('/dashboard')
  }

  // Get company projects with application stats
  const companyProjects = await db.select({
    id: projects.id,
    title: projects.title,
    description: projects.description,
    status: projects.status,
    createdAt: projects.createdAt,
  })
    .from(projects)
    .where(eq(projects.companyId, profile.id))
    .orderBy(desc(projects.createdAt))
    .limit(10) // Latest 10 projects

  const projectIds = companyProjects.map(p => p.id)

  // Get application statistics
  const applicationStats = projectIds.length > 0 ? await db.select({
    projectId: projectApplications.projectId,
    status: projectApplications.status,
    count: count()
  })
    .from(projectApplications)
    .where(eq(projectApplications.projectId, projects.id))
    .groupBy(projectApplications.projectId, projectApplications.status) : []

  // Get recent applications with developer details
  const recentApplications = projectIds.length > 0 ? await db.select({
    id: projectApplications.id,
    projectId: projectApplications.projectId,
    projectTitle: projects.title,
    status: projectApplications.status,
    createdAt: projectApplications.createdAt,
    developer: {
      id: profiles.id,
      displayName: profiles.displayName,
      avatarUrl: profiles.avatarUrl,
    },
    developerProfile: {
      headline: developerProfiles.headline,
      rate: developerProfiles.rate,
      availability: developerProfiles.availability,
    }
  })
    .from(projectApplications)
    .innerJoin(projects, eq(projectApplications.projectId, projects.id))
    .innerJoin(profiles, eq(projectApplications.developerId, profiles.id))
    .leftJoin(developerProfiles, eq(profiles.id, developerProfiles.userId))
    .where(eq(projects.companyId, profile.id))
    .orderBy(desc(projectApplications.createdAt))
    .limit(10) : []

  // Get subscription status
  const subscription = await db.select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, profile.id))
    .limit(1)

  // Calculate aggregate stats
  const totalProjects = companyProjects.length
  const activeProjects = companyProjects.filter(p => p.status === 'open').length
  const totalApplications = applicationStats.reduce((sum, stat) => sum + stat.count, 0)
  const pendingApplications = applicationStats
    .filter(stat => stat.status === 'pending')
    .reduce((sum, stat) => sum + stat.count, 0)

  return (
    <CompanyDashboard 
      user={session.user}
      company={profile}
      projects={companyProjects}
      recentApplications={recentApplications}
      subscription={subscription[0] || null}
      stats={{
        totalProjects,
        activeProjects,
        totalApplications,
        pendingApplications
      }}
    />
  )
}