import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/database'
import { BillingDashboard } from '@/components/billing/billing-dashboard'

export default async function BillingPage() {
  const user = await currentUser()
  
  if (!user) {
    redirect('/auth/sign-in')
  }

  // Get user profile
  const userProfile = await db.profiles.findByUserId(user. id)

  if (!userProfile) {
    redirect('/profile/setup')
  }

  return (
    <BillingDashboard 
      user={user}
      userRole={userProfile.role}
    />
  )
}
