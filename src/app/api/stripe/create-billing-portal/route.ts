import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { SubscriptionService } from '@/lib/stripe/subscription'
import { db } from '@/lib/db'
import { subscriptions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's subscription to find customer ID
    const userSubscription = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, session.user.id))
      .limit(1)

    if (!userSubscription.length) {
      return NextResponse.json({ 
        error: 'No subscription found. Please subscribe first.' 
      }, { status: 404 })
    }

    const customerId = userSubscription[0].stripeCustomerId

    const portalSession = await SubscriptionService.createBillingPortalSession(customerId)

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