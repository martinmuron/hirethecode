import { v } from 'convex/values'
import { query, mutation } from './_generated/server'

// Get profile by ID
export const get = query({
  args: { id: v.id('profiles') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

// Get profile by user ID
export const getByUserId = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('profiles')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .first()
  },
})

// Get current user's profile
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

    return await ctx.db
      .query('profiles')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .first()
  },
})

// Get current user with profile (combined query)
export const getCurrentWithProfile = query({
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

    return { user, profile }
  },
})

// Create profile (during setup)
export const create = mutation({
  args: {
    role: v.union(v.literal('developer'), v.literal('company'), v.literal('admin')),
    displayName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .first()

    if (!user) {
      throw new Error('User not found')
    }

    // Check if profile already exists
    const existing = await ctx.db
      .query('profiles')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .first()

    if (existing) {
      throw new Error('Profile already exists')
    }

    const profileId = await ctx.db.insert('profiles', {
      userId: user._id,
      role: args.role,
      displayName: args.displayName,
      avatarUrl: user.imageUrl,
      createdAt: Date.now(),
    })

    // Create role-specific profile
    if (args.role === 'developer') {
      await ctx.db.insert('developerProfiles', {
        profileId,
        availability: 'available',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    } else if (args.role === 'company') {
      await ctx.db.insert('companyProfiles', {
        profileId,
        companyName: args.displayName || 'My Company',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    }

    return profileId
  },
})

// Update profile
export const update = mutation({
  args: {
    displayName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .first()

    if (!user) {
      throw new Error('User not found')
    }

    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .first()

    if (!profile) {
      throw new Error('Profile not found')
    }

    const updates: Record<string, unknown> = {}
    if (args.displayName !== undefined) updates.displayName = args.displayName
    if (args.avatarUrl !== undefined) updates.avatarUrl = args.avatarUrl
    if (args.timezone !== undefined) updates.timezone = args.timezone

    await ctx.db.patch(profile._id, updates)
    return profile._id
  },
})

// Check if user has profile
export const hasProfile = query({
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

    return !!profile
  },
})

// Get profile with role-specific data
export const getFullProfile = query({
  args: { profileId: v.id('profiles') },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId)
    if (!profile) return null

    const user = await ctx.db.get(profile.userId)

    let roleProfile = null
    if (profile.role === 'developer') {
      roleProfile = await ctx.db
        .query('developerProfiles')
        .withIndex('by_profile_id', (q) => q.eq('profileId', args.profileId))
        .first()
    } else if (profile.role === 'company') {
      roleProfile = await ctx.db
        .query('companyProfiles')
        .withIndex('by_profile_id', (q) => q.eq('profileId', args.profileId))
        .first()
    }

    return { user, profile, roleProfile }
  },
})

// Get profile by ID with user email (for Stripe subscription emails)
export const getById = query({
  args: { profileId: v.id('profiles') },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId)
    if (!profile) return null

    const user = await ctx.db.get(profile.userId)

    return {
      ...profile,
      email: user?.email,
    }
  },
})
