'use client'

import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { redirect } from 'next/navigation'
import { DeveloperDashboard } from '@/components/dashboard/developer-dashboard'
import { CompanyDashboard } from '@/components/dashboard/company-dashboard'
import { DashboardNav } from '@/components/navigation/dashboard-nav'
import { Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser()
  const profileData = useQuery(api.profiles.getCurrentWithProfile)
  const subscription = useQuery(api.subscriptions.get)

  // Loading state
  if (!clerkLoaded || profileData === undefined) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  // Not authenticated
  if (!clerkUser) {
    redirect('/sign-in')
  }

  // No profile - needs setup
  if (!profileData?.profile) {
    redirect('/profile/setup')
  }

  const { profile } = profileData

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <DashboardNav />
      <main className="container py-8">
        {profile.role === 'developer' && <DeveloperDashboard />}
        {profile.role === 'company' && <CompanyDashboard />}
        {profile.role === 'admin' && <DeveloperDashboard />}
      </main>
    </div>
  )
}
