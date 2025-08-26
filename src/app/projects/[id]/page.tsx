import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { projects, profiles, projectSkills, skills, companyProfiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { ProjectDetail } from '@/components/projects/project-detail'
import { notFound } from 'next/navigation'

interface ProjectPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params
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

  // Get project with company details
  const projectData = await db.select({
    project: projects,
    company: profiles,
    companyProfile: companyProfiles,
  })
    .from(projects)
    .innerJoin(profiles, eq(projects.companyId, profiles.id))
    .leftJoin(companyProfiles, eq(projects.companyId, companyProfiles.userId))
    .where(eq(projects.id, id))
    .limit(1)

  if (!projectData.length) {
    notFound()
  }

  const { project, company, companyProfile } = projectData[0]

  // Get project skills
  const projectSkillsData = await db.select({
    skill: skills
  })
    .from(projectSkills)
    .innerJoin(skills, eq(projectSkills.skillId, skills.id))
    .where(eq(projectSkills.projectId, project.id))

  const projectWithDetails = {
    ...project,
    createdAt: project.createdAt.toISOString(),
    company: {
      ...company,
      companyName: companyProfile?.companyName || null,
      about: companyProfile?.about || null,
      websiteUrl: companyProfile?.websiteUrl || null,
      industry: companyProfile?.industry || null,
      size: companyProfile?.size || null,
    },
    skills: projectSkillsData.map(ps => ps.skill)
  }

  return (
    <ProjectDetail 
      project={projectWithDetails}
      user={session.user} 
      userRole={profile.role}
      userId={profile.id}
      isOwner={profile.id === project.companyId}
    />
  )
}