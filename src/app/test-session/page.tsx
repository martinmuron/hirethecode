'use client'

import { useUser } from '@clerk/nextjs'

export default function TestSession() {
  const { user } = useUser()
  
  return (
    <div className="p-4">
      <h1>User Test</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  )
}
