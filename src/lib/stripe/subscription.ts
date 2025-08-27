import { stripe, STRIPE_CONFIG, StripePlan, StripeBillingInterval } from './config'
import { db } from '@/lib/db'
import { subscriptions, profiles, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { EmailService } from '@/lib/email/email-service'

export class SubscriptionService {
  /**
   * Create Stripe customer if doesn't exist
   */
  static async getOrCreateCustomer(userId: string, email: string, name?: string) {
    try {
      // Check if user already has a subscription record with customer ID
      const existingSubscription = await db.select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId))
        .limit(1)

      if (existingSubscription.length > 0) {
        return existingSubscription[0].stripeCustomerId
      }

      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email,
        name: name || undefined,
        metadata: {
          userId,
        },
      })

      return customer.id
    } catch (error) {
      console.error('Error creating Stripe customer:', error)
      throw error
    }
  }

  /**
   * Create checkout session for subscription
   */
  static async createCheckoutSession(
    userId: string,
    email: string,
    plan: StripePlan,
    billingInterval: StripeBillingInterval,
    name?: string
  ) {
    try {
      const customerId = await this.getOrCreateCustomer(userId, email, name)
      
      const priceId = billingInterval === 'monthly' 
        ? STRIPE_CONFIG.plans[plan].monthlyPriceId
        : STRIPE_CONFIG.plans[plan].yearlyPriceId

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: STRIPE_CONFIG.successUrl + '?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: STRIPE_CONFIG.cancelUrl,
        metadata: {
          userId,
          plan,
          billingInterval,
        },
        subscription_data: {
          metadata: {
            userId,
            plan,
            billingInterval,
          },
        },
        allow_promotion_codes: true,
      })

      return session
    } catch (error) {
      console.error('Error creating checkout session:', error)
      throw error
    }
  }

  /**
   * Create billing portal session
   */
  static async createBillingPortalSession(customerId: string) {
    try {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
      })

      return portalSession
    } catch (error) {
      console.error('Error creating billing portal session:', error)
      throw error
    }
  }

  /**
   * Get subscription status
   */
  static async getSubscriptionStatus(userId: string) {
    try {
      const subscription = await db.select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId))
        .limit(1)

      if (!subscription.length) {
        return null
      }

      const sub = subscription[0]
      
      // Get latest subscription data from Stripe
      const stripeSubscription = await stripe.subscriptions.retrieve(sub.id)

      return {
        ...sub,
        stripeData: stripeSubscription,
        isActive: stripeSubscription.status === 'active',
        isCanceling: stripeSubscription.cancel_at_period_end,
      }
    } catch (error) {
      console.error('Error getting subscription status:', error)
      return null
    }
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(userId: string) {
    try {
      const subscription = await db.select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId))
        .limit(1)

      if (!subscription.length) {
        throw new Error('Subscription not found')
      }

      const sub = subscription[0]

      // Cancel at period end (don't cancel immediately)
      await stripe.subscriptions.update(sub.id, {
        cancel_at_period_end: true,
      })

      return true
    } catch (error) {
      console.error('Error canceling subscription:', error)
      throw error
    }
  }

  /**
   * Reactivate canceled subscription
   */
  static async reactivateSubscription(userId: string) {
    try {
      const subscription = await db.select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId))
        .limit(1)

      if (!subscription.length) {
        throw new Error('Subscription not found')
      }

      const sub = subscription[0]

      // Remove cancellation
      await stripe.subscriptions.update(sub.id, {
        cancel_at_period_end: false,
      })

      return true
    } catch (error) {
      console.error('Error reactivating subscription:', error)
      throw error
    }
  }

  /**
   * Handle successful subscription creation (called from webhook)
   */
  static async handleSubscriptionCreated(subscription: any) {
    try {
      const { customer, id, status, current_period_end, metadata } = subscription
      const { userId, plan, billingInterval } = metadata

      if (!userId) {
        console.error('No userId in subscription metadata')
        return
      }

      // Save subscription to database
      await db.insert(subscriptions).values({
        id,
        userId,
        stripeCustomerId: customer,
        productTier: plan,
        status,
        currentPeriodEnd: new Date(current_period_end * 1000),
      }).onConflictDoUpdate({
        target: subscriptions.id,
        set: {
          status,
          currentPeriodEnd: new Date(current_period_end * 1000),
        }
      })

      // Send subscription confirmation email
      try {
        const userInfo = await db.select({
          email: users.email,
          name: profiles.displayName,
          userEmail: users.name
        })
          .from(profiles)
          .innerJoin(users, eq(profiles.id, users.id))
          .where(eq(profiles.id, userId))
          .limit(1)

        if (userInfo.length > 0) {
          const { email, name, userEmail } = userInfo[0]
          const userName = name || userEmail || 'User'
          
          const planNames = {
            developer: 'Developer Pro',
            company: 'Company Enterprise'
          }
          
          const planPrices = {
            developer: billingInterval === 'yearly' ? '$990' : '$99',
            company: billingInterval === 'yearly' ? '$4990' : '$499'
          }

          await EmailService.sendSubscriptionConfirmationEmail(
            email,
            userName,
            planNames[plan as keyof typeof planNames] || 'Premium',
            planPrices[plan as keyof typeof planPrices] || 'N/A',
            billingInterval || 'monthly'
          )
        }
      } catch (emailError) {
        console.error('Failed to send subscription confirmation email:', emailError)
        // Don't fail the subscription creation if email fails
      }

      console.log(`Subscription created for user ${userId}`)
    } catch (error) {
      console.error('Error handling subscription created:', error)
      throw error
    }
  }

  /**
   * Handle subscription updates (called from webhook)
   */
  static async handleSubscriptionUpdated(subscription: any) {
    try {
      const { id, status, current_period_end, cancel_at_period_end } = subscription

      await db.update(subscriptions)
        .set({
          status,
          currentPeriodEnd: new Date(current_period_end * 1000),
        })
        .where(eq(subscriptions.id, id))

      console.log(`Subscription ${id} updated to status: ${status}`)
    } catch (error) {
      console.error('Error handling subscription updated:', error)
      throw error
    }
  }

  /**
   * Handle subscription deletion (called from webhook)
   */
  static async handleSubscriptionDeleted(subscription: any) {
    try {
      const { id } = subscription

      await db.delete(subscriptions)
        .where(eq(subscriptions.id, id))

      console.log(`Subscription ${id} deleted`)
    } catch (error) {
      console.error('Error handling subscription deleted:', error)
      throw error
    }
  }
}