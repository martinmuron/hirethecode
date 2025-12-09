import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@convex/_generated/api'
import { SubscriptionService } from '@/lib/stripe/subscription'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user's profile from Convex
    const convexUser = await convex.query(api.users.getByClerkId, { clerkId: userId })
    if (!convexUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const profile = await convex.query(api.profiles.getByUserId, { userId: convexUser._id })
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get user's subscription to find customer ID
    const userSubscription = await convex.query(api.subscriptions.getByProfileId, {
      profileId: profile._id
    })

    if (!userSubscription) {
      return NextResponse.json({
        error: 'No subscription found. Please subscribe first.'
      }, { status: 404 })
    }

    const portalSession = await SubscriptionService.createBillingPortalSession(
      userSubscription.stripeCustomerId
    )

    return NextResponse.json({
      url: portalSession.url
    })

  } catch (error) {
    console.error('Error creating billing portal session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
