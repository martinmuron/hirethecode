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
      <div className="min-h-screen bg-[#fbfbfd] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#86868b]" />
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
    <div className="min-h-screen bg-[#fbfbfd]">
      <DashboardNav />
      <main className="pt-20 pb-12">
        <div className="max-w-[1200px] mx-auto px-6">
          {profile.role === 'developer' && <DeveloperDashboard />}
          {profile.role === 'company' && <CompanyDashboard />}
          {profile.role === 'admin' && <DeveloperDashboard />}
        </div>
      </main>
    </div>
  )
}
