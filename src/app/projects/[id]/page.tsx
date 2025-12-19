import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { projects, profiles, projectSkills, skills, seekerProfiles } from '@/lib/db/schema'
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

  // Get project with seeker details (UPDATED from company to seeker)
  const projectData = await db.select({
    project: projects,
    seeker: profiles,
    seekerProfile: seekerProfiles,
  })
    .from(projects)
    .innerJoin(profiles, eq(projects.seekerId, profiles.id)) // UPDATED: seekerId instead of companyId
    .leftJoin(seekerProfiles, eq(projects.seekerId, seekerProfiles.userId))
    .where(eq(projects.id, id))
    .limit(1)

  if (!projectData.length) {
    notFound()
  }

  const { project, seeker, seekerProfile } = projectData[0]

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
    seeker: { // UPDATED: seeker instead of company
      ...seeker,
      organizationName: seekerProfile?.organizationName || null,
      industry: seekerProfile?.industry || null,
      companySize: seekerProfile?.companySize || null,
    },
    skills: projectSkillsData.map(ps => ps.skill)
  }

  return (
    <ProjectDetail 
      project={projectWithDetails}
      user={user} 
      userRole={profile.role as 'developer' | 'company' | 'admin' | 'seeker'} // Added seeker
      userId={profile.id}
      isOwner={profile.id === project.seekerId} // UPDATED: seekerId instead of companyId
    />
  )
}
