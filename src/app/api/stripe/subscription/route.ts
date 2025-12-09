import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@convex/_generated/api'
import { SubscriptionService } from '@/lib/stripe/subscription'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function GET(req: NextRequest) {
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
      return NextResponse.json({
        hasSubscription: false,
        subscription: null
      })
    }

    const subscription = await SubscriptionService.getSubscriptionStatus(profile._id)

    if (!subscription) {
      return NextResponse.json({
        hasSubscription: false,
        subscription: null
      })
    }

    return NextResponse.json({
      hasSubscription: true,
      subscription: {
        id: subscription._id,
        status: subscription.status,
        productTier: subscription.productTier,
        currentPeriodEnd: subscription.currentPeriodEnd,
        isActive: subscription.isActive,
        isCanceling: subscription.isCanceling,
      }
    })

  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
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

    await SubscriptionService.cancelSubscription(profile._id)

    return NextResponse.json({
      success: true,
      message: 'Subscription canceled. Access will continue until the end of your billing period.'
    })

  } catch (error) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
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

    await SubscriptionService.reactivateSubscription(profile._id)

    return NextResponse.json({
      success: true,
      message: 'Subscription reactivated successfully.'
    })

  } catch (error) {
    console.error('Error reactivating subscription:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
