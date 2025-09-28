import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import { headers, cookies } from "next/headers"

export async function GET() {
  const headersList = await headers()
  const cookieStore = await cookies()

  console.log('=== DEBUG ROUTE IMPORT DEBUG ===')
  console.log('authOptions in debug route:', typeof authOptions)
  console.log('authOptions keys:', Object.keys(authOptions))
  console.log('authOptions.session:', authOptions.session)
  console.log('authOptions.providers length:', authOptions.providers.length)
  console.log('authOptions.secret:', authOptions.secret ? 'present' : 'missing')
  
  
  console.log("=== FULL AUTH DEBUG ===")
  
  // Check environment
  console.log("NODE_ENV:", process.env.NODE_ENV)
  console.log("NEXTAUTH_SECRET exists:", !!process.env.NEXTAUTH_SECRET)
  console.log("NEXTAUTH_SECRET length:", process.env.NEXTAUTH_SECRET?.length || 0)
  console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL)
  
  // Check cookies
  console.log("All cookies:")
  cookieStore.getAll().forEach(cookie => {
    console.log(`  ${cookie.name}: ${cookie.value.substring(0, 50)}...`)
  })
  
  // Check headers
  console.log("Cookie header:", headersList.get('cookie'))
  console.log("Host:", headersList.get('host'))
  
  // Try getting session
  const session = await getServerSession(authOptions)
  console.log("Session result:", session)
  
  return Response.json({
    hasSecret: !!process.env.NEXTAUTH_SECRET,
    secretLength: process.env.NEXTAUTH_SECRET?.length || 0,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    nodeEnv: process.env.NODE_ENV,
    cookies: cookieStore.getAll().map(c => ({ name: c.name, hasValue: !!c.value })),
    hasSession: !!session,
    session
  })
}
