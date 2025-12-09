'use client'

import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { redirect } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { ProjectPostingForm } from '@/components/projects/project-posting-form'

export default function NewProjectPage() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser()
  const profile = useQuery(api.profiles.getCurrent)

  if (!clerkLoaded || profile === undefined) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!clerkUser) {
    redirect('/sign-in')
  }

  if (!profile) {
    redirect('/profile/setup')
  }

  // Only companies can post projects
  if (profile.role !== 'company') {
    redirect('/dashboard')
  }

  return <ProjectPostingForm />
}
