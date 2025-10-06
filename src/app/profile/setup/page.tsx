import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { ProfileSetupForm } from '@/components/profile/profile-setup-form'

export default async function ProfileSetupPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect('/auth/sign-in')
  }

  const profile = await db.select()
  .from(profiles)
  .where(eq(profiles.id, session.user.id))
  .limit(1)

  console.log(`PROFILE > SETUP > profile: ${JSON.stringify(profile, null, "  ")}`)

  let name = null;
  let role = null;
  if(profile) {
    name = profile[0].displayName
    role = profile[0].role
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container max-w-md mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Welcome to Hire the Code!</h1>
          <p className="text-muted-foreground mt-2">
            Let&apos;s set up your profile to get started
          </p>
        </div>
        
        <ProfileSetupForm 
          userEmail={session.user.email} 
          userId={session.user.id} 
          role={role}
          name={name}
        />
      </div>
    </div>
  )
}
