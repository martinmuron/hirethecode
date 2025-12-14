import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasPublicKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    hasSecretKey: !!process.env.CLERK_SECRET_KEY,
    publicKeyPrefix: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.slice(0, 10),
    secretKeyPrefix: process.env.CLERK_SECRET_KEY?.slice(0, 10),
  })
}
