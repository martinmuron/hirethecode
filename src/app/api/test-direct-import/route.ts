import { getServerSession } from 'next-auth/next'

// Try importing directly instead of via alias
import { authOptions } from '../../../../src/lib/auth/config'
// OR try: import { authOptions } from '../../../../src/lib/auth/config'

export async function GET() {
  console.log('=== DIRECT IMPORT TEST ===')
  const session = await getServerSession(authOptions)
  console.log('Direct import session:', session)
  
  return Response.json({ hasSession: !!session, session })
}
