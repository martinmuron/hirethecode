import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
  typescript: true,
})

export const STRIPE_CONFIG = {
  // Subscription plans
  plans: {
    developer: {
      monthlyPriceId: process.env.STRIPE_DEVELOPER_MONTHLY_PRICE_ID || 'price_1SKOMHKebwJ6BBax5QlYOHMv',
      yearlyPriceId: process.env.STRIPE_DEVELOPER_YEARLY_PRICE_ID || 'price_1SKOMsKebwJ6BBaxhflhjxGc',
      monthlyPrice: 99,
      yearlyPrice: 990, // $99 * 10 months (2 months free)
    },
    company: {
      monthlyPriceId: process.env.STRIPE_COMPANY_MONTHLY_PRICE_ID || 'price_1SKONeKebwJ6BBaxkuxXimaY',
      yearlyPriceId: process.env.STRIPE_COMPANY_YEARLY_PRICE_ID || 'price_1SKOOZKebwJ6BBaxNYeXJnl7',
      monthlyPrice: 499,
      yearlyPrice: 4990, // $499 * 10 months (2 months free)
    }
  },
  
  // Webhook endpoints
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  
  // Success/Cancel URLs
  successUrl: `${process.env.NEXTAUTH_URL}/billing/success`,
  cancelUrl: `${process.env.NEXTAUTH_URL}/billing/cancel`,
}

export type StripePlan = 'developer' | 'company'
export type StripeBillingInterval = 'monthly' | 'yearly'
