'use client'

import { useSession } from 'next-auth/react'

export default function TestSession() {
  const { data: session, status } = useSession()
  
  return (
    <div className="p-4">
      <h1>Session Test</h1>
      <p>Status: {status}</p>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  )
}
