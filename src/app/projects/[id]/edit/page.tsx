import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { 
  profiles, 
  projects,
  projectSkills,
  skills
} from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { ProjectEditForm } from '@/components/projects/project-edit-form'

interface EditProjectPageProps {
  params: {
    id: string
  }
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
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

  // Only companies can edit projects
  if (profile.role !== 'company') {
    redirect('/dashboard')
  }

  // Get the project - ensure it belongs to the company
  const { id } = await params
  const projectData = await db.select()
    .from(projects)
    .where(and(
      eq(projects.id, id),
      eq(projects.companyId, profile.id)
    ))
    .limit(1)

  if (!projectData.length) {
    notFound()
  }

  const requiredSkills = await db.select({
    skill: skills
  })
  .from(projectSkills)
  .innerJoin(skills, eq(projectSkills.skillId, skills.id))
  .where(eq(projectSkills.projectId, projectData[0].id))

  return (
    <ProjectEditForm 
      user={session.user} 
      companyId={profile.id}
      project={{ 
        ...projectData[0], 
        requiredSkills: requiredSkills.map(skill => skill.skill.label)
      }} 
    />
  )
}
