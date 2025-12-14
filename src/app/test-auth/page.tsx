import { auth } from '@clerk/nextjs/server'

export default async function TestAuthPage() {
  const { userId } = auth()
  
  return (
    <div className="p-8">
      <h1>Auth Test</h1>
      <p>User ID: {userId || 'Not signed in'}</p>
    </div>
  )
}
