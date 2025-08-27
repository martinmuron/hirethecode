import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_CONFIG } from '@/lib/stripe/config'
import { SubscriptionService } from '@/lib/stripe/subscription'
import { headers } from 'next/headers'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    console.error('Missing stripe-signature header')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_CONFIG.webhookSecret
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await SubscriptionService.handleSubscriptionCreated(event.data.object)
        break

      case 'customer.subscription.updated':
        await SubscriptionService.handleSubscriptionUpdated(event.data.object)
        break

      case 'customer.subscription.deleted':
        await SubscriptionService.handleSubscriptionDeleted(event.data.object)
        break

      case 'invoice.payment_succeeded':
        // Handle successful payment
        console.log('Payment succeeded for subscription:', (event.data.object as any).subscription)
        break

      case 'invoice.payment_failed':
        // Handle failed payment
        console.log('Payment failed for subscription:', (event.data.object as any).subscription)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Disable body parsing for webhooks
export const config = {
  api: {
    bodyParser: false,
  },
}