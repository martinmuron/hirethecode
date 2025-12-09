'use client'

import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { redirect } from 'next/navigation'
import { BillingDashboard } from '@/components/billing/billing-dashboard'
import { Loader2 } from 'lucide-react'

export default function BillingPage() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser()
  const profile = useQuery(api.profiles.getCurrent)

  // Loading state
  if (!clerkLoaded || profile === undefined) {
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

  // No profile
  if (!profile) {
    redirect('/profile/setup')
  }

  return <BillingDashboard />
}
