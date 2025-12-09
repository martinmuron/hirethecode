'use client'

import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { redirect } from 'next/navigation'
import { ProfileSetupForm } from '@/components/profile/profile-setup-form'
import { Loader2 } from 'lucide-react'

export default function ProfileSetupPage() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser()
  const hasProfile = useQuery(api.profiles.hasProfile)

  // Loading state
  if (!clerkLoaded || hasProfile === undefined) {
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

  // Already has profile
  if (hasProfile) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
      <div className="container max-w-md mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Welcome to Hire the Code!
          </h1>
          <p className="text-gray-500 mt-2">
            Let&apos;s set up your profile to get started
          </p>
        </div>

        <ProfileSetupForm />
      </div>
    </div>
  )
}
