import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { SubscriptionService } from '@/lib/stripe/subscription'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscription = await SubscriptionService.getSubscriptionStatus(session.user.id)

    if (!subscription) {
      return NextResponse.json({ 
        hasSubscription: false,
        subscription: null 
      })
    }

    return NextResponse.json({ 
      hasSubscription: true,
      subscription: {
        id: subscription.id,
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
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await SubscriptionService.cancelSubscription(session.user.id)

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
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await SubscriptionService.reactivateSubscription(session.user.id)

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