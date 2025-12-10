import { requireAuth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { ProfileSetupForm } from '@/components/profile/profile-setup-form'

export default async function ProfileSetupPage() {
  const user = await requireAuth()
  
  // Check if profile already exists
  const existingProfile = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1)

  if (existingProfile.length > 0) {
    redirect('/dashboard')
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
          userEmail={user.email} 
          userId={user.id} 
          role={role}
          name={name}
        />
      </div>
    </div>
  )
}
