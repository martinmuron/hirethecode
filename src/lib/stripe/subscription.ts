import { stripe, STRIPE_CONFIG, StripePlan, StripeBillingInterval } from './config'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@convex/_generated/api'
import { Id } from '@convex/_generated/dataModel'
import { EmailService } from '@/lib/email/email-service'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export class SubscriptionService {
  /**
   * Create Stripe customer if doesn't exist
   */
  static async getOrCreateCustomer(profileId: string, email: string, name?: string) {
    try {
      // Check if user already has a subscription record with customer ID
      const existingSubscription = await convex.query(api.subscriptions.getByProfileId, {
        profileId: profileId as Id<'profiles'>
      })

      if (existingSubscription) {
        return existingSubscription.stripeCustomerId
      }

      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email,
        name: name || undefined,
        metadata: {
          profileId,
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
    profileId: string,
    email: string,
    plan: StripePlan,
    billingInterval: StripeBillingInterval,
    name?: string
  ) {
    try {
      const customerId = await this.getOrCreateCustomer(profileId, email, name)

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
          profileId,
          plan,
          billingInterval,
        },
        subscription_data: {
          metadata: {
            profileId,
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
  static async getSubscriptionStatus(profileId: string) {
    try {
      const subscription = await convex.query(api.subscriptions.getByProfileId, {
        profileId: profileId as Id<'profiles'>
      })

      if (!subscription) {
        return null
      }

      // Get latest subscription data from Stripe
      const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId)

      return {
        ...subscription,
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
  static async cancelSubscription(profileId: string) {
    try {
      const subscription = await convex.query(api.subscriptions.getByProfileId, {
        profileId: profileId as Id<'profiles'>
      })

      if (!subscription) {
        throw new Error('Subscription not found')
      }

      // Cancel at period end (don't cancel immediately)
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
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
  static async reactivateSubscription(profileId: string) {
    try {
      const subscription = await convex.query(api.subscriptions.getByProfileId, {
        profileId: profileId as Id<'profiles'>
      })

      if (!subscription) {
        throw new Error('Subscription not found')
      }

      // Remove cancellation
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
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
      const { profileId, plan, billingInterval } = metadata

      if (!profileId) {
        console.error('No profileId in subscription metadata')
        return
      }

      // Save subscription to Convex
      await convex.mutation(api.subscriptions.create, {
        profileId: profileId as Id<'profiles'>,
        stripeCustomerId: customer,
        stripeSubscriptionId: id,
        productTier: plan,
        status,
        currentPeriodEnd: current_period_end * 1000, // Convert to milliseconds
      })

      // Send subscription confirmation email
      try {
        // Get user info from Convex
        const profile = await convex.query(api.profiles.getById, {
          profileId: profileId as Id<'profiles'>
        })

        if (profile) {
          const planNames = {
            developer: 'Developer Pro',
            company: 'Company Enterprise'
          }

          const planPrices = {
            developer: billingInterval === 'yearly' ? '$990' : '$99',
            company: billingInterval === 'yearly' ? '$4990' : '$499'
          }

          await EmailService.sendSubscriptionConfirmationEmail(
            profile.email || '',
            profile.displayName || 'User',
            planNames[plan as keyof typeof planNames] || 'Premium',
            planPrices[plan as keyof typeof planPrices] || 'N/A',
            billingInterval || 'monthly'
          )
        }
      } catch (emailError) {
        console.error('Failed to send subscription confirmation email:', emailError)
        // Don't fail the subscription creation if email fails
      }

      console.log(`Subscription created for profile ${profileId}`)
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
      const { id, status, current_period_end } = subscription

      await convex.mutation(api.subscriptions.update, {
        stripeSubscriptionId: id,
        status,
        currentPeriodEnd: current_period_end * 1000, // Convert to milliseconds
      })

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

      await convex.mutation(api.subscriptions.remove, {
        stripeSubscriptionId: id
      })

      console.log(`Subscription ${id} deleted`)
    } catch (error) {
      console.error('Error handling subscription deleted:', error)
      throw error
    }
  }
}
