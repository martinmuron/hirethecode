import { v } from 'convex/values'
import { query, mutation } from './_generated/server'

// Get company profile by profile ID
export const getProfile = query({
  args: { profileId: v.id('profiles') },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId)
    if (!profile || profile.role !== 'company') return null

    const user = await ctx.db.get(profile.userId)
    if (!user) return null

    const companyProfile = await ctx.db
      .query('companyProfiles')
      .withIndex('by_profile_id', (q) => q.eq('profileId', args.profileId))
      .first()

    if (!companyProfile) return null

    return {
      user,
      profile,
      companyProfile,
    }
  },
})

// Get current user's company profile
export const getCurrentProfile = query({
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

    if (!profile || profile.role !== 'company') return null

    const companyProfile = await ctx.db
      .query('companyProfiles')
      .withIndex('by_profile_id', (q) => q.eq('profileId', profile._id))
      .first()

    if (!companyProfile) return null

    return {
      user,
      profile,
      companyProfile,
    }
  },
})

// Update company profile
export const updateProfile = mutation({
  args: {
    companyName: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    about: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    industry: v.optional(v.string()),
    size: v.optional(v.string()),
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
      throw new Error('Company profile not found')
    }

    const companyProfile = await ctx.db
      .query('companyProfiles')
      .withIndex('by_profile_id', (q) => q.eq('profileId', profile._id))
      .first()

    if (!companyProfile) {
      throw new Error('Company profile data not found')
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    }

    if (args.companyName !== undefined) updates.companyName = args.companyName
    if (args.logoUrl !== undefined) updates.logoUrl = args.logoUrl
    if (args.about !== undefined) updates.about = args.about
    if (args.websiteUrl !== undefined) updates.websiteUrl = args.websiteUrl
    if (args.industry !== undefined) updates.industry = args.industry
    if (args.size !== undefined) updates.size = args.size

    await ctx.db.patch(companyProfile._id, updates)
    return companyProfile._id
  },
})

// Get company stats (projects, applications, etc.)
export const getStats = query({
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

    if (!profile || profile.role !== 'company') return null

    // Get projects
    const projects = await ctx.db
      .query('projects')
      .withIndex('by_company_id', (q) => q.eq('companyId', profile._id))
      .collect()

    const totalProjects = projects.length
    const activeProjects = projects.filter((p) => p.status === 'open').length
    const closedProjects = projects.filter((p) => p.status === 'closed').length

    // Get applications for company's projects
    let totalApplications = 0
    let pendingApplications = 0

    for (const project of projects) {
      const applications = await ctx.db
        .query('projectApplications')
        .withIndex('by_project_id', (q) => q.eq('projectId', project._id))
        .collect()
      totalApplications += applications.length
      pendingApplications += applications.filter((a) => a.status === 'pending').length
    }

    // Get developer contacts
    const contacts = await ctx.db
      .query('developerContacts')
      .withIndex('by_company_id', (q) => q.eq('companyId', profile._id))
      .collect()

    return {
      totalProjects,
      activeProjects,
      closedProjects,
      totalApplications,
      pendingApplications,
      totalContacts: contacts.length,
    }
  },
})

// Count total companies
export const count = query({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db
      .query('profiles')
      .filter((q) => q.eq(q.field('role'), 'company'))
      .collect()
    return profiles.length
  },
})
