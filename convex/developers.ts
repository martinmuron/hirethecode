import { v } from 'convex/values'
import { query, mutation } from './_generated/server'

// Search developers with filters
export const search = query({
  args: {
    availability: v.optional(
      v.union(v.literal('available'), v.literal('busy'), v.literal('unavailable'))
    ),
    rateMin: v.optional(v.number()),
    rateMax: v.optional(v.number()),
    skillSlug: v.optional(v.string()),
    sort: v.optional(v.string()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20

    // Get all developer profiles
    const developerProfiles = args.availability
      ? await ctx.db
          .query('developerProfiles')
          .withIndex('by_availability', (q) => q.eq('availability', args.availability!))
          .collect()
      : await ctx.db.query('developerProfiles').collect()

    // Get full data for each developer
    const developersWithData = await Promise.all(
      developerProfiles.map(async (devProfile) => {
        const profile = await ctx.db.get(devProfile.profileId)
        if (!profile) return null

        const user = await ctx.db.get(profile.userId)
        if (!user) return null

        // Get skills
        const developerSkills = await ctx.db
          .query('developerSkills')
          .withIndex('by_profile_id', (q) => q.eq('profileId', profile._id))
          .collect()

        const skills = await Promise.all(
          developerSkills.map(async (ds) => {
            const skill = await ctx.db.get(ds.skillId)
            return skill ? { ...skill, level: ds.level } : null
          })
        )

        return {
          id: profile._id,
          user,
          profile,
          developerProfile: devProfile,
          skills: skills.filter(Boolean),
        }
      })
    )

    // Filter out nulls
    let filtered = developersWithData.filter(Boolean) as NonNullable<
      (typeof developersWithData)[number]
    >[]

    // Filter by rate range
    if (args.rateMin !== undefined) {
      filtered = filtered.filter(
        (d) => d.developerProfile.rate !== undefined && d.developerProfile.rate >= args.rateMin!
      )
    }
    if (args.rateMax !== undefined) {
      filtered = filtered.filter(
        (d) => d.developerProfile.rate !== undefined && d.developerProfile.rate <= args.rateMax!
      )
    }

    // Filter by skill
    if (args.skillSlug) {
      filtered = filtered.filter((d) =>
        d.skills.some((s) => s && s.slug === args.skillSlug)
      )
    }

    // Sort
    switch (args.sort) {
      case 'rate-low':
        filtered.sort((a, b) => (a.developerProfile.rate ?? 0) - (b.developerProfile.rate ?? 0))
        break
      case 'rate-high':
        filtered.sort((a, b) => (b.developerProfile.rate ?? 0) - (a.developerProfile.rate ?? 0))
      case 'available':
        filtered.sort((a, b) => {
          const order = { available: 0, busy: 1, unavailable: 2 }
          return order[a.developerProfile.availability] - order[b.developerProfile.availability]
        })
        break
      case 'recent':
      default:
        filtered.sort((a, b) => b.developerProfile.createdAt - a.developerProfile.createdAt)
    }

    // Apply pagination
    const results = filtered.slice(0, limit)
    const hasMore = filtered.length > limit

    return {
      developers: results,
      hasMore,
      nextCursor: hasMore ? results[results.length - 1]?.id : undefined,
    }
  },
})

// Get developer profile by profile ID
export const getProfile = query({
  args: { profileId: v.id('profiles') },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId)
    if (!profile || profile.role !== 'developer') return null

    const user = await ctx.db.get(profile.userId)
    if (!user) return null

    const developerProfile = await ctx.db
      .query('developerProfiles')
      .withIndex('by_profile_id', (q) => q.eq('profileId', args.profileId))
      .first()

    if (!developerProfile) return null

    // Get skills
    const developerSkills = await ctx.db
      .query('developerSkills')
      .withIndex('by_profile_id', (q) => q.eq('profileId', args.profileId))
      .collect()

    const skills = await Promise.all(
      developerSkills.map(async (ds) => {
        const skill = await ctx.db.get(ds.skillId)
        return skill ? { ...skill, level: ds.level } : null
      })
    )

    return {
      user,
      profile,
      developerProfile,
      skills: skills.filter(Boolean),
    }
  },
})

// Get current user's developer profile
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

    if (!profile || profile.role !== 'developer') return null

    const developerProfile = await ctx.db
      .query('developerProfiles')
      .withIndex('by_profile_id', (q) => q.eq('profileId', profile._id))
      .first()

    if (!developerProfile) return null

    // Get skills
    const developerSkills = await ctx.db
      .query('developerSkills')
      .withIndex('by_profile_id', (q) => q.eq('profileId', profile._id))
      .collect()

    const skills = await Promise.all(
      developerSkills.map(async (ds) => {
        const skill = await ctx.db.get(ds.skillId)
        return skill ? { ...skill, level: ds.level } : null
      })
    )

    return {
      user,
      profile,
      developerProfile,
      skills: skills.filter(Boolean),
    }
  },
})

// Update developer profile
export const updateProfile = mutation({
  args: {
    headline: v.optional(v.string()),
    bio: v.optional(v.string()),
    rate: v.optional(v.number()),
    availability: v.optional(
      v.union(v.literal('available'), v.literal('busy'), v.literal('unavailable'))
    ),
    portfolioUrl: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    country: v.optional(v.string()),
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

    if (!profile || profile.role !== 'developer') {
      throw new Error('Developer profile not found')
    }

    const developerProfile = await ctx.db
      .query('developerProfiles')
      .withIndex('by_profile_id', (q) => q.eq('profileId', profile._id))
      .first()

    if (!developerProfile) {
      throw new Error('Developer profile data not found')
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    }

    if (args.headline !== undefined) updates.headline = args.headline
    if (args.bio !== undefined) updates.bio = args.bio
    if (args.rate !== undefined) updates.rate = args.rate
    if (args.availability !== undefined) updates.availability = args.availability
    if (args.portfolioUrl !== undefined) updates.portfolioUrl = args.portfolioUrl
    if (args.githubUrl !== undefined) updates.githubUrl = args.githubUrl
    if (args.websiteUrl !== undefined) updates.websiteUrl = args.websiteUrl
    if (args.country !== undefined) updates.country = args.country

    await ctx.db.patch(developerProfile._id, updates)
    return developerProfile._id
  },
})

// Count total developers
export const count = query({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db
      .query('profiles')
      .filter((q) => q.eq(q.field('role'), 'developer'))
      .collect()
    return profiles.length
  },
})

// Get available developers count
export const countAvailable = query({
  args: {},
  handler: async (ctx) => {
    const developerProfiles = await ctx.db
      .query('developerProfiles')
      .withIndex('by_availability', (q) => q.eq('availability', 'available'))
      .collect()
    return developerProfiles.length
  },
})
