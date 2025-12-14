import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing auth...')
    const user = await currentUser()
    
    console.log('User result:', user)
    console.log('Request headers:', Object.fromEntries(request.headers.entries()))
    
    return NextResponse.json({ 
      user,
      hasUser: !!user,
      cookies: request.headers.get('cookie'),
    })
  } catch (error) {
    console.error('Auth test error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
