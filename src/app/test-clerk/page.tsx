'use client'

import { useUser, SignIn, SignOutButton } from '@clerk/nextjs'

export default function TestClerkPage() {
  const { user, isLoaded, isSignedIn } = useUser()

  if (!isLoaded) return <div>Loading...</div>

  if (!isSignedIn) {
    return (
      <div className="p-8">
        <h1>Test Clerk Auth</h1>
        <SignIn />
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1>Test Clerk Auth - Success!</h1>
      <p>User ID: {user.id}</p>
      <p>Email: {user.emailAddresses[0]?.emailAddress}</p>
      <p>Name: {user.fullName}</p>
      <SignOutButton>
        <button className="bg-red-500 text-white p-2 rounded">Sign Out</button>
      </SignOutButton>
    </div>
  )
}
