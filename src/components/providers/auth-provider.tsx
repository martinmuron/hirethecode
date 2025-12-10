'use client'

import { ClerkProvider, useUser } from '@clerk/nextjs'
import { useEffect } from 'react'

function UserSync() {
  const { user, isLoaded } = useUser()

  useEffect(() => {
    if (isLoaded && user) {
      // Sync user to our database
      fetch('/api/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          name: user.fullName,
          image: user.imageUrl,
        })
      }).catch(console.error)
    }
  }, [user, isLoaded])

  return null
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <ClerkProvider>
      <UserSync />
      {children}
    </ClerkProvider>
  )
}
