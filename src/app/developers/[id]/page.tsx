'use client'

import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { redirect, notFound } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { DeveloperProfile } from '@/components/developers/developer-profile'
import { Id } from '@convex/_generated/dataModel'
import { use } from 'react'

interface DeveloperPageProps {
  params: Promise<{
    id: string
  }>
}

export default function DeveloperPage({ params }: DeveloperPageProps) {
  const { id } = use(params)
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

  return <DeveloperProfile developerId={id as Id<'profiles'>} />
}
