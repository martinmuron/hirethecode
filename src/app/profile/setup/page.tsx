import { currentUser } from '@clerk/nextjs/server' // Use currentUser directly
import { redirect } from 'next/navigation'
import { ProfileSetupForm } from '@/components/profile/profile-setup-form'

export default async function ProfileSetupPage() {
  const user = await currentUser()

  if(!user) {
    redirect('/auth/sign-in')
  }
  
  // Check if profile already exists
  const existingProfile = await db.profiles.findByUserId(user.id)

  if (existingProfile) {
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
          userEmail={user.emailAddresses[0]?.emailAddress || ''} 
          userId={user.id} 
          name={user.fullName || ''}
        />
      </div>
    </div>
  )
}
