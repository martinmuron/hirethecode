import { v } from 'convex/values'
import { query, mutation, internalMutation } from './_generated/server'

// Get user by Clerk ID
export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .first()
  },
})

// Get user by email
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first()
  },
})

// Get current user (requires auth)
export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .first()

    return user
  },
})

// Create user (called from Clerk webhook)
export const create = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existing = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .first()

    if (existing) {
      return existing._id
    }

    return await ctx.db.insert('users', {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      createdAt: Date.now(),
    })
  },
})

// Update user (called from Clerk webhook)
export const update = mutation({
  args: {
    clerkId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .first()

    if (!user) {
      throw new Error('User not found')
    }

    const updates: Record<string, unknown> = {}
    if (args.email !== undefined) updates.email = args.email
    if (args.name !== undefined) updates.name = args.name
    if (args.imageUrl !== undefined) updates.imageUrl = args.imageUrl

    await ctx.db.patch(user._id, updates)
    return user._id
  },
})

// Delete user (called from Clerk webhook)
export const deleteUser = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .first()

    if (user) {
      await ctx.db.delete(user._id)
    }
  },
})

// Internal mutation for seeding/migration
export const createInternal = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('users', {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      createdAt: args.createdAt ?? Date.now(),
    })
  },
})
