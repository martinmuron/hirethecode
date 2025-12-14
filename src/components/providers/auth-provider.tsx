'use client'

import { ClerkProvider, useUser } from '@clerk/nextjs'
import { useEffect } from 'react'

function UserSync() {
  const { user, isLoaded } = useUser()

  useEffect(() => {
    console.log('UserSync: isLoaded =', isLoaded, 'user =', user?.id) // Debug log
    if (isLoaded && user) {
      console.log('UserSync: Attempting to sync user', user.id) // Debug log
      fetch('/api/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          name: user.fullName,
          image: user.imageUrl,
        })
      }).then(res => {
          console.log('UserSync: API response status:', res.status)
          return res.text()
      })
        .then(data => console.log('UserSync: API response:', data))
        .catch(err => console.error('User Sync: API error:', err))
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
