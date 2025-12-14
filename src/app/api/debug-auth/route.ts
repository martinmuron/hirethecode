import { auth, currentUser } from '@clerk/nextjs/server'
import { headers } from 'next/headers' // Add this import
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { userId, sessionId } = auth()
    const user = await currentUser()
    const headers = await headers()
    
    return NextResponse.json({
      authUserId: userId,
      sessionId: sessionId,
      currentUserId: user?.id,
      currentUserEmail: user?.emailAddresses?.[0]?.emailAddress,
      hasAuthHeaders: {
        authorization: headersList.has('authorization'),
        cookie: headersList.has('cookie'),
        cookies: headersList.get('cookie')?.includes('__clerk') || false,
      },
    })
  } catch (error) {
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 })
  }
}
