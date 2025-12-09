import { v } from 'convex/values'
import { query, mutation, internalMutation } from './_generated/server'

// Get notifications for current user
export const list = query({
  args: {
    limit: v.optional(v.number()),
    unreadOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .first()

    if (!user) return []

    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .first()

    if (!profile) return []

    let notificationsQuery = ctx.db
      .query('notifications')
      .withIndex('by_user_id', (q) => q.eq('userId', profile._id))

    const notifications = await notificationsQuery.order('desc').collect()

    // Filter unread if specified
    let filtered = args.unreadOnly
      ? notifications.filter((n) => !n.isRead)
      : notifications

    // Apply limit
    if (args.limit) {
      filtered = filtered.slice(0, args.limit)
    }

    return filtered
  },
})

// Get unread notification count
export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return 0

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .first()

    if (!user) return 0

    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .first()

    if (!profile) return 0

    const notifications = await ctx.db
      .query('notifications')
      .withIndex('by_user_and_read', (q) =>
        q.eq('userId', profile._id).eq('isRead', false)
      )
      .collect()

    return notifications.length
  },
})

// Create notification
export const create = mutation({
  args: {
    userId: v.id('profiles'),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal('application_status'),
      v.literal('new_message'),
      v.literal('project_update'),
      v.literal('system')
    ),
    data: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('notifications', {
      userId: args.userId,
      title: args.title,
      message: args.message,
      type: args.type,
      isRead: false,
      data: args.data,
      createdAt: Date.now(),
    })
  },
})

// Mark notification as read
export const markRead = mutation({
  args: { id: v.id('notifications') },
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

    const notification = await ctx.db.get(args.id)
    if (!notification || notification.userId !== profile._id) {
      throw new Error('Notification not found')
    }

    await ctx.db.patch(args.id, { isRead: true })
    return args.id
  },
})

// Mark all notifications as read
export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
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

    const notifications = await ctx.db
      .query('notifications')
      .withIndex('by_user_and_read', (q) =>
        q.eq('userId', profile._id).eq('isRead', false)
      )
      .collect()

    for (const notification of notifications) {
      await ctx.db.patch(notification._id, { isRead: true })
    }

    return notifications.length
  },
})

// Delete notification
export const remove = mutation({
  args: { id: v.id('notifications') },
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

    const notification = await ctx.db.get(args.id)
    if (!notification || notification.userId !== profile._id) {
      throw new Error('Notification not found')
    }

    await ctx.db.delete(args.id)
  },
})

// Internal mutation for creating notifications from server
export const createInternal = internalMutation({
  args: {
    userId: v.id('profiles'),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal('application_status'),
      v.literal('new_message'),
      v.literal('project_update'),
      v.literal('system')
    ),
    data: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('notifications', {
      userId: args.userId,
      title: args.title,
      message: args.message,
      type: args.type,
      isRead: false,
      data: args.data,
      createdAt: Date.now(),
    })
  },
})
