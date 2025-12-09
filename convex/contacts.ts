import { v } from 'convex/values'
import { query, mutation } from './_generated/server'

// Send contact message to developer (company only)
export const create = mutation({
  args: {
    developerId: v.id('profiles'),
    message: v.string(),
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

    if (!profile || profile.role !== 'company') {
      throw new Error('Only companies can contact developers')
    }

    // Verify developer exists
    const developerProfile = await ctx.db.get(args.developerId)
    if (!developerProfile || developerProfile.role !== 'developer') {
      throw new Error('Developer not found')
    }

    return await ctx.db.insert('developerContacts', {
      companyId: profile._id,
      developerId: args.developerId,
      message: args.message,
      status: 'sent',
      createdAt: Date.now(),
    })
  },
})

// Get contacts received by developer
export const getByDeveloper = query({
  args: {},
  handler: async (ctx) => {
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

    if (!profile || profile.role !== 'developer') return []

    const contacts = await ctx.db
      .query('developerContacts')
      .withIndex('by_developer_id', (q) => q.eq('developerId', profile._id))
      .order('desc')
      .collect()

    // Get company info for each contact
    return Promise.all(
      contacts.map(async (contact) => {
        const companyProfileData = await ctx.db.get(contact.companyId)
        if (!companyProfileData) return null

        const companyData = await ctx.db
          .query('companyProfiles')
          .withIndex('by_profile_id', (q) => q.eq('profileId', contact.companyId))
          .first()

        const companyUser = await ctx.db.get(companyProfileData.userId)

        return {
          ...contact,
          company: {
            user: companyUser,
            profile: companyProfileData,
            companyProfile: companyData,
          },
        }
      })
    ).then((results) => results.filter(Boolean))
  },
})

// Get contacts sent by company
export const getByCompany = query({
  args: {},
  handler: async (ctx) => {
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

    if (!profile || profile.role !== 'company') return []

    const contacts = await ctx.db
      .query('developerContacts')
      .withIndex('by_company_id', (q) => q.eq('companyId', profile._id))
      .order('desc')
      .collect()

    // Get developer info for each contact
    return Promise.all(
      contacts.map(async (contact) => {
        const developerProfileData = await ctx.db.get(contact.developerId)
        if (!developerProfileData) return null

        const developerData = await ctx.db
          .query('developerProfiles')
          .withIndex('by_profile_id', (q) => q.eq('profileId', contact.developerId))
          .first()

        const developerUser = await ctx.db.get(developerProfileData.userId)

        return {
          ...contact,
          developer: {
            user: developerUser,
            profile: developerProfileData,
            developerProfile: developerData,
          },
        }
      })
    ).then((results) => results.filter(Boolean))
  },
})

// Update contact status
export const updateStatus = mutation({
  args: {
    contactId: v.id('developerContacts'),
    status: v.union(v.literal('sent'), v.literal('read'), v.literal('replied')),
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

    const contact = await ctx.db.get(args.contactId)
    if (!contact) {
      throw new Error('Contact not found')
    }

    // Only developer can update to 'read' or 'replied'
    if (contact.developerId !== profile._id && contact.companyId !== profile._id) {
      throw new Error('Not authorized')
    }

    await ctx.db.patch(args.contactId, { status: args.status })
    return args.contactId
  },
})

// Mark contact as read
export const markRead = mutation({
  args: { contactId: v.id('developerContacts') },
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

    const contact = await ctx.db.get(args.contactId)
    if (!contact || contact.developerId !== profile._id) {
      throw new Error('Contact not found')
    }

    if (contact.status === 'sent') {
      await ctx.db.patch(args.contactId, { status: 'read' })
    }

    return args.contactId
  },
})

// Get unread contact count for developer
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

    if (!profile || profile.role !== 'developer') return 0

    const contacts = await ctx.db
      .query('developerContacts')
      .withIndex('by_developer_id', (q) => q.eq('developerId', profile._id))
      .filter((q) => q.eq(q.field('status'), 'sent'))
      .collect()

    return contacts.length
  },
})
