import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { SubscriptionService } from '@/lib/stripe/subscription'
import { StripePlan, StripeBillingInterval } from '@/lib/stripe/config'

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
      user.id,
      user.emailAddresses[0]?.emailAddress,
      plan as StripePlan,
      billingInterval as StripeBillingInterval,
      user.fullName || 'Justin Greenough'
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
