import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { SeekerProjectForm } from '@/components/projects/seeker-project-form'

export default async function NewProjectPage() {
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

  if (profile.role !== 'seeker') {
    redirect('/dashboard')
  }

  return (
    <SeekerProjectForm
      user={user} 
      seekerId={profile.id}
    />
  )
}
