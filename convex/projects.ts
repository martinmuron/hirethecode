import { v } from 'convex/values'
import { query, mutation, action } from './_generated/server'
import { api } from './_generated/api'

// List projects with filters
export const list = query({
  args: {
    status: v.optional(
      v.union(v.literal('open'), v.literal('in_progress'), v.literal('closed'))
    ),
    skillSlug: v.optional(v.string()),
    budgetMin: v.optional(v.number()),
    budgetMax: v.optional(v.number()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.id('projects')),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20

    // Filter by status
    const projects = args.status
      ? await ctx.db
          .query('projects')
          .withIndex('by_status', (q) => q.eq('status', args.status!))
          .order('desc')
          .collect()
      : await ctx.db.query('projects').order('desc').collect()

    // Get full data for each project
    const projectsWithData = await Promise.all(
      projects.map(async (project) => {
        // Get company info
        const companyProfile = await ctx.db.get(project.companyId)
        if (!companyProfile) return null

        const companyData = await ctx.db
          .query('companyProfiles')
          .withIndex('by_profile_id', (q) => q.eq('profileId', project.companyId))
          .first()

        // Get skills
        const projectSkills = await ctx.db
          .query('projectSkills')
          .withIndex('by_project_id', (q) => q.eq('projectId', project._id))
          .collect()

        const skills = await Promise.all(
          projectSkills.map(async (ps) => {
            return await ctx.db.get(ps.skillId)
          })
        )

        // Get application count
        const applications = await ctx.db
          .query('projectApplications')
          .withIndex('by_project_id', (q) => q.eq('projectId', project._id))
          .collect()

        return {
          ...project,
          company: companyData,
          skills: skills.filter(Boolean),
          applicationCount: applications.length,
        }
      })
    )

    // Filter out nulls
    let filtered = projectsWithData.filter(Boolean) as NonNullable<
      (typeof projectsWithData)[number]
    >[]

    // Filter by budget
    if (args.budgetMin !== undefined) {
      filtered = filtered.filter(
        (p) => p.budgetMax !== undefined && p.budgetMax >= args.budgetMin!
      )
    }
    if (args.budgetMax !== undefined) {
      filtered = filtered.filter(
        (p) => p.budgetMin !== undefined && p.budgetMin <= args.budgetMax!
      )
    }

    // Filter by skill
    if (args.skillSlug) {
      filtered = filtered.filter((p) =>
        p.skills.some((s) => s && s.slug === args.skillSlug)
      )
    }

    // Apply pagination
    const results = filtered.slice(0, limit)
    const hasMore = filtered.length > limit

    return {
      projects: results,
      hasMore,
      nextCursor: hasMore ? results[results.length - 1]?._id : undefined,
    }
  },
})

// Get single project
export const get = query({
  args: { id: v.id('projects') },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id)
    if (!project) return null

    // Get company info
    const companyProfile = await ctx.db.get(project.companyId)
    const companyData = companyProfile
      ? await ctx.db
          .query('companyProfiles')
          .withIndex('by_profile_id', (q) => q.eq('profileId', project.companyId))
          .first()
      : null

    // Get skills
    const projectSkills = await ctx.db
      .query('projectSkills')
      .withIndex('by_project_id', (q) => q.eq('projectId', args.id))
      .collect()

    const skills = await Promise.all(
      projectSkills.map(async (ps) => {
        return await ctx.db.get(ps.skillId)
      })
    )

    // Get applications
    const applications = await ctx.db
      .query('projectApplications')
      .withIndex('by_project_id', (q) => q.eq('projectId', args.id))
      .collect()

    return {
      ...project,
      company: companyData,
      skills: skills.filter(Boolean),
      applicationCount: applications.length,
    }
  },
})

// Get company's projects
export const getByCompany = query({
  args: { companyId: v.optional(v.id('profiles')) },
  handler: async (ctx, args) => {
    let profileId = args.companyId

    // If no companyId provided, get current user's company
    if (!profileId) {
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

      profileId = profile._id
    }

    const projects = await ctx.db
      .query('projects')
      .withIndex('by_company_id', (q) => q.eq('companyId', profileId!))
      .order('desc')
      .collect()

    // Get full data for each project
    return Promise.all(
      projects.map(async (project) => {
        // Get skills
        const projectSkills = await ctx.db
          .query('projectSkills')
          .withIndex('by_project_id', (q) => q.eq('projectId', project._id))
          .collect()

        const skills = await Promise.all(
          projectSkills.map(async (ps) => {
            return await ctx.db.get(ps.skillId)
          })
        )

        // Get applications with developer info
        const projectApplications = await ctx.db
          .query('projectApplications')
          .withIndex('by_project_id', (q) => q.eq('projectId', project._id))
          .collect()

        const applicationsWithDevs = await Promise.all(
          projectApplications.map(async (app) => {
            const developerProfile = await ctx.db.get(app.developerId)
            if (!developerProfile) return null

            const developerUser = await ctx.db.get(developerProfile.userId)
            const developerData = await ctx.db
              .query('developerProfiles')
              .withIndex('by_profile_id', (q) => q.eq('profileId', app.developerId))
              .first()

            return {
              ...app,
              developer: {
                user: developerUser,
                profile: developerProfile,
                developerProfile: developerData,
              },
            }
          })
        )

        return {
          ...project,
          skills: skills.filter(Boolean),
          applicationCount: projectApplications.length,
          applications: applicationsWithDevs.filter(Boolean),
        }
      })
    )
  },
})

// Create project
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    budgetMin: v.optional(v.number()),
    budgetMax: v.optional(v.number()),
    currency: v.optional(v.string()),
    timeline: v.optional(v.string()),
    locationPref: v.optional(v.string()),
    skillIds: v.optional(v.array(v.id('skills'))),
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
      throw new Error('Only companies can create projects')
    }

    const now = Date.now()

    const projectId = await ctx.db.insert('projects', {
      companyId: profile._id,
      title: args.title,
      description: args.description,
      budgetMin: args.budgetMin,
      budgetMax: args.budgetMax,
      currency: args.currency ?? 'USD',
      timeline: args.timeline,
      locationPref: args.locationPref,
      status: 'open',
      createdAt: now,
      updatedAt: now,
    })

    // Add skills
    if (args.skillIds) {
      for (const skillId of args.skillIds) {
        await ctx.db.insert('projectSkills', {
          projectId,
          skillId,
        })
      }
    }

    return projectId
  },
})

// Update project
export const update = mutation({
  args: {
    id: v.id('projects'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    budgetMin: v.optional(v.number()),
    budgetMax: v.optional(v.number()),
    currency: v.optional(v.string()),
    timeline: v.optional(v.string()),
    locationPref: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal('open'), v.literal('in_progress'), v.literal('closed'))
    ),
    skillIds: v.optional(v.array(v.id('skills'))),
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

    const project = await ctx.db.get(args.id)
    if (!project) {
      throw new Error('Project not found')
    }

    // Check ownership
    if (project.companyId !== profile._id) {
      throw new Error('Not authorized to update this project')
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    }

    if (args.title !== undefined) updates.title = args.title
    if (args.description !== undefined) updates.description = args.description
    if (args.budgetMin !== undefined) updates.budgetMin = args.budgetMin
    if (args.budgetMax !== undefined) updates.budgetMax = args.budgetMax
    if (args.currency !== undefined) updates.currency = args.currency
    if (args.timeline !== undefined) updates.timeline = args.timeline
    if (args.locationPref !== undefined) updates.locationPref = args.locationPref
    if (args.status !== undefined) updates.status = args.status

    await ctx.db.patch(args.id, updates)

    // Update skills if provided
    if (args.skillIds !== undefined) {
      // Delete existing skills
      const existingSkills = await ctx.db
        .query('projectSkills')
        .withIndex('by_project_id', (q) => q.eq('projectId', args.id))
        .collect()

      for (const skill of existingSkills) {
        await ctx.db.delete(skill._id)
      }

      // Add new skills
      for (const skillId of args.skillIds) {
        await ctx.db.insert('projectSkills', {
          projectId: args.id,
          skillId,
        })
      }
    }

    return args.id
  },
})

// Delete project
export const remove = mutation({
  args: { id: v.id('projects') },
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

    const project = await ctx.db.get(args.id)
    if (!project) {
      throw new Error('Project not found')
    }

    // Check ownership
    if (project.companyId !== profile._id) {
      throw new Error('Not authorized to delete this project')
    }

    // Delete project skills
    const projectSkills = await ctx.db
      .query('projectSkills')
      .withIndex('by_project_id', (q) => q.eq('projectId', args.id))
      .collect()

    for (const skill of projectSkills) {
      await ctx.db.delete(skill._id)
    }

    // Delete applications
    const applications = await ctx.db
      .query('projectApplications')
      .withIndex('by_project_id', (q) => q.eq('projectId', args.id))
      .collect()

    for (const app of applications) {
      await ctx.db.delete(app._id)
    }

    // Delete project
    await ctx.db.delete(args.id)
  },
})

// Count open projects
export const countOpen = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db
      .query('projects')
      .withIndex('by_status', (q) => q.eq('status', 'open'))
      .collect()
    return projects.length
  },
})
