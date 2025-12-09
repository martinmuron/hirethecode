'use client'

import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { redirect } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { DeveloperSearch } from '@/components/developers/developer-search'
import { DashboardNav } from '@/components/navigation/dashboard-nav'

export default function DevelopersPage() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser()
  const profile = useQuery(api.profiles.getCurrent)

  if (!clerkLoaded || profile === undefined) {
    return (
      <div className="min-h-screen bg-[#fbfbfd] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#86868b]" />
      </div>
    )
  }

  if (!clerkUser) {
    redirect('/sign-in')
  }

  if (!profile) {
    redirect('/profile/setup')
  }

  return (
    <div className="min-h-screen bg-[#fbfbfd]">
      <DashboardNav />
      <main className="pt-20 pb-12">
        <div className="max-w-[1200px] mx-auto px-6">
          <DeveloperSearch />
        </div>
      </main>
    </div>
  )
}
