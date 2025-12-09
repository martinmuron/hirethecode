import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@convex/_generated/api'
import { SubscriptionService } from '@/lib/stripe/subscription'
import { StripePlan, StripeBillingInterval } from '@/lib/stripe/config'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    const user = await currentUser()

    if (!userId || !user?.emailAddresses?.[0]?.emailAddress) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const email = user.emailAddresses[0].emailAddress

    // Get the user's profile from Convex
    const convexUser = await convex.query(api.users.getByClerkId, { clerkId: userId })
    if (!convexUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
    }

    const profile = await convex.query(api.profiles.getByUserId, { userId: convexUser._id })
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const { plan, billingInterval } = await req.json()

    if (!plan || !billingInterval) {
      return NextResponse.json({
        error: 'Missing plan or billingInterval'
      }, { status: 400 })
    }

    if (!['developer', 'company'].includes(plan)) {
      return NextResponse.json({
        error: 'Invalid plan. Must be "developer" or "company"'
      }, { status: 400 })
    }

    if (!['monthly', 'yearly'].includes(billingInterval)) {
      return NextResponse.json({
        error: 'Invalid billingInterval. Must be "monthly" or "yearly"'
      }, { status: 400 })
    }

    const checkoutSession = await SubscriptionService.createCheckoutSession(
      profile._id,
      email,
      plan as StripePlan,
      billingInterval as StripeBillingInterval,
      user.firstName || user.username || undefined
    )

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url
    })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
