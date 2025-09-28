import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config' // Make sure this path is correct

export async function GET(request: NextRequest) {
  try {
    console.log('Testing auth...')
    const session = await getServerSession(authOptions)
    
    console.log('Session result:', session)
    console.log('Request headers:', Object.fromEntries(request.headers.entries()))
    
    return NextResponse.json({ 
      session,
      hasSession: !!session,
      cookies: request.headers.get('cookie'),
    })
  } catch (error) {
    console.error('Auth test error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
