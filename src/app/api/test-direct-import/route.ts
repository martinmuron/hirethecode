import { currentUser } from '@clerk/nextjs/server'


export async function GET() {
  console.log('=== DIRECT IMPORT TEST ===')
  const user = await currentUser()
  console.log('Direct import user:', user)
  
  return Response.json({ hasUser: !!user, user })
}
