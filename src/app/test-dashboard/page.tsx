import { auth } from '@clerk/nextjs/server'

export default async function TestDashboard() {
  const { userId } = auth()
  
  return (
    <div className="p-8">
      <h1>Test Dashboard</h1>
      <p>User ID: {userId || 'Not signed in'}</p>
      <p>Status: {userId ? 'Signed in' : 'Not signed in'}</p>
    </div>
  )
}
