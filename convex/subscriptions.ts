import { v } from 'convex/values'
import { query, mutation, internalMutation } from './_generated/server'

// Get subscription for current user
export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .first()

    if (!user) return null

    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .first()

    if (!profile) return null

    return await ctx.db
      .query('subscriptions')
      .withIndex('by_profile_id', (q) => q.eq('profileId', profile._id))
      .first()
  },
})

// Alias for get (used by dashboard components)
export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .first()

    if (!user) return null

    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .first()

    if (!profile) return null

    return await ctx.db
      .query('subscriptions')
      .withIndex('by_profile_id', (q) => q.eq('profileId', profile._id))
      .first()
  },
})

// Get subscription by profile ID
export const getByProfileId = query({
  args: { profileId: v.id('profiles') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('subscriptions')
      .withIndex('by_profile_id', (q) => q.eq('profileId', args.profileId))
      .first()
  },
})

// Get subscription by Stripe customer ID
export const getByStripeCustomerId = query({
  args: { stripeCustomerId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('subscriptions')
      .withIndex('by_stripe_customer_id', (q) =>
        q.eq('stripeCustomerId', args.stripeCustomerId)
      )
      .first()
  },
})

// Get subscription by Stripe subscription ID
export const getByStripeSubscriptionId = query({
  args: { stripeSubscriptionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('subscriptions')
      .withIndex('by_stripe_subscription_id', (q) =>
        q.eq('stripeSubscriptionId', args.stripeSubscriptionId)
      )
      .first()
  },
})

// Create subscription (called from Stripe webhook)
export const create = mutation({
  args: {
    profileId: v.id('profiles'),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    productTier: v.string(),
    status: v.string(),
    currentPeriodEnd: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Check if subscription already exists
    const existing = await ctx.db
      .query('subscriptions')
      .withIndex('by_stripe_subscription_id', (q) =>
        q.eq('stripeSubscriptionId', args.stripeSubscriptionId)
      )
      .first()

    if (existing) {
      // Update existing subscription
      await ctx.db.patch(existing._id, {
        status: args.status,
        productTier: args.productTier,
        currentPeriodEnd: args.currentPeriodEnd,
        updatedAt: now,
      })
      return existing._id
    }

    return await ctx.db.insert('subscriptions', {
      profileId: args.profileId,
      stripeCustomerId: args.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      productTier: args.productTier,
      status: args.status,
      currentPeriodEnd: args.currentPeriodEnd,
      createdAt: now,
      updatedAt: now,
    })
  },
})

// Update subscription (called from Stripe webhook)
export const update = mutation({
  args: {
    stripeSubscriptionId: v.string(),
    status: v.optional(v.string()),
    productTier: v.optional(v.string()),
    currentPeriodEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query('subscriptions')
      .withIndex('by_stripe_subscription_id', (q) =>
        q.eq('stripeSubscriptionId', args.stripeSubscriptionId)
      )
      .first()

    if (!subscription) {
      throw new Error('Subscription not found')
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    }

    if (args.status !== undefined) updates.status = args.status
    if (args.productTier !== undefined) updates.productTier = args.productTier
    if (args.currentPeriodEnd !== undefined)
      updates.currentPeriodEnd = args.currentPeriodEnd

    await ctx.db.patch(subscription._id, updates)
    return subscription._id
  },
})

// Delete subscription (called from Stripe webhook)
export const remove = mutation({
  args: { stripeSubscriptionId: v.string() },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query('subscriptions')
      .withIndex('by_stripe_subscription_id', (q) =>
        q.eq('stripeSubscriptionId', args.stripeSubscriptionId)
      )
      .first()

    if (subscription) {
      await ctx.db.delete(subscription._id)
    }
  },
})

// Check if current user has active subscription
export const hasActiveSubscription = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return false

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .first()

    if (!user) return false

    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .first()

    if (!profile) return false

    const subscription = await ctx.db
      .query('subscriptions')
      .withIndex('by_profile_id', (q) => q.eq('profileId', profile._id))
      .first()

    if (!subscription) return false

    return (
      subscription.status === 'active' &&
      subscription.currentPeriodEnd > Date.now()
    )
  },
})

// Internal mutation for creating subscription from webhook
export const createFromWebhook = internalMutation({
  args: {
    profileId: v.id('profiles'),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    productTier: v.string(),
    status: v.string(),
    currentPeriodEnd: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    return await ctx.db.insert('subscriptions', {
      ...args,
      createdAt: now,
      updatedAt: now,
    })
  },
})

// Internal mutation for updating subscription from webhook
export const updateFromWebhook = internalMutation({
  args: {
    stripeSubscriptionId: v.string(),
    status: v.optional(v.string()),
    productTier: v.optional(v.string()),
    currentPeriodEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query('subscriptions')
      .withIndex('by_stripe_subscription_id', (q) =>
        q.eq('stripeSubscriptionId', args.stripeSubscriptionId)
      )
      .first()

    if (!subscription) return null

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    }

    if (args.status !== undefined) updates.status = args.status
    if (args.productTier !== undefined) updates.productTier = args.productTier
    if (args.currentPeriodEnd !== undefined)
      updates.currentPeriodEnd = args.currentPeriodEnd

    await ctx.db.patch(subscription._id, updates)
    return subscription._id
  },
})
