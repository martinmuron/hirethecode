import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { ProjectPostingForm } from '@/components/projects/project-posting-form'

export default async function NewProjectPage() {
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

  // Only companies can post projects
  if (profile.role !== 'company') {
    redirect('/dashboard')
  }

  return (
    <ProjectPostingForm 
      user={session.user} 
      companyId={profile.id}
    />
  )
}