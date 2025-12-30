import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { SubscriptionService } from '@/lib/stripe/subscription'
import { db } from '@/lib/database'

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's subscription to find customer ID
    const userSubscription = await db.subscriptions.findByUserId(user.id)

    if (!userSubscription) {
      return NextResponse.json({ 
        error: 'No subscription found. Please subscribe first.' 
      }, { status: 404 })
    }

    const customerId = userSubscription.stripeCustomerId

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
