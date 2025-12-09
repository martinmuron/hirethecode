import { v } from 'convex/values'
import { query, mutation } from './_generated/server'

// Apply to a project
export const create = mutation({
  args: {
    projectId: v.id('projects'),
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

    if (!profile || profile.role !== 'developer') {
      throw new Error('Only developers can apply to projects')
    }

    // Check if project exists and is open
    const project = await ctx.db.get(args.projectId)
    if (!project) {
      throw new Error('Project not found')
    }
    if (project.status !== 'open') {
      throw new Error('Project is not accepting applications')
    }

    // Check if already applied
    const existing = await ctx.db
      .query('projectApplications')
      .withIndex('by_project_id', (q) => q.eq('projectId', args.projectId))
      .filter((q) => q.eq(q.field('developerId'), profile._id))
      .first()

    if (existing) {
      throw new Error('You have already applied to this project')
    }

    const now = Date.now()

    return await ctx.db.insert('projectApplications', {
      projectId: args.projectId,
      developerId: profile._id,
      message: args.message,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    })
  },
})

// Get applications for a project (company only)
export const getByProject = query({
  args: { projectId: v.id('projects') },
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

    // Verify project ownership
    const project = await ctx.db.get(args.projectId)
    if (!project || project.companyId !== profile._id) {
      return []
    }

    const applications = await ctx.db
      .query('projectApplications')
      .withIndex('by_project_id', (q) => q.eq('projectId', args.projectId))
      .collect()

    // Get developer info for each application
    return Promise.all(
      applications.map(async (app) => {
        const developerProfile = await ctx.db.get(app.developerId)
        if (!developerProfile) return null

        const developerUser = await ctx.db.get(developerProfile.userId)
        const developerData = await ctx.db
          .query('developerProfiles')
          .withIndex('by_profile_id', (q) => q.eq('profileId', app.developerId))
          .first()

        // Get developer skills
        const developerSkills = await ctx.db
          .query('developerSkills')
          .withIndex('by_profile_id', (q) => q.eq('profileId', app.developerId))
          .collect()

        const skills = await Promise.all(
          developerSkills.map(async (ds) => {
            const skill = await ctx.db.get(ds.skillId)
            return skill ? { ...skill, level: ds.level } : null
          })
        )

        return {
          ...app,
          developer: {
            user: developerUser,
            profile: developerProfile,
            developerProfile: developerData,
            skills: skills.filter(Boolean),
          },
        }
      })
    ).then((results) => results.filter(Boolean))
  },
})

// Get developer's applications
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

    const applications = await ctx.db
      .query('projectApplications')
      .withIndex('by_developer_id', (q) => q.eq('developerId', profile._id))
      .collect()

    // Get project info for each application
    return Promise.all(
      applications.map(async (app) => {
        const project = await ctx.db.get(app.projectId)
        if (!project) return null

        const companyData = await ctx.db
          .query('companyProfiles')
          .withIndex('by_profile_id', (q) => q.eq('profileId', project.companyId))
          .first()

        // Get project skills
        const projectSkills = await ctx.db
          .query('projectSkills')
          .withIndex('by_project_id', (q) => q.eq('projectId', app.projectId))
          .collect()

        const skills = await Promise.all(
          projectSkills.map(async (ps) => {
            return await ctx.db.get(ps.skillId)
          })
        )

        return {
          ...app,
          project: {
            ...project,
            company: companyData,
            skills: skills.filter(Boolean),
          },
        }
      })
    ).then((results) => results.filter(Boolean))
  },
})

// Update application status (company only)
export const updateStatus = mutation({
  args: {
    applicationId: v.id('projectApplications'),
    status: v.union(v.literal('pending'), v.literal('accepted'), v.literal('rejected')),
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

    const application = await ctx.db.get(args.applicationId)
    if (!application) {
      throw new Error('Application not found')
    }

    // Verify project ownership
    const project = await ctx.db.get(application.projectId)
    if (!project || project.companyId !== profile._id) {
      throw new Error('Not authorized to update this application')
    }

    await ctx.db.patch(args.applicationId, {
      status: args.status,
      updatedAt: Date.now(),
    })

    return args.applicationId
  },
})

// Check if developer has applied to project
export const hasApplied = query({
  args: { projectId: v.id('projects') },
  handler: async (ctx, args) => {
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

    const application = await ctx.db
      .query('projectApplications')
      .withIndex('by_project_id', (q) => q.eq('projectId', args.projectId))
      .filter((q) => q.eq(q.field('developerId'), profile._id))
      .first()

    return !!application
  },
})

// Get application status for a project
export const getStatus = query({
  args: { projectId: v.id('projects') },
  handler: async (ctx, args) => {
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

    const application = await ctx.db
      .query('projectApplications')
      .withIndex('by_project_id', (q) => q.eq('projectId', args.projectId))
      .filter((q) => q.eq(q.field('developerId'), profile._id))
      .first()

    return application ? application.status : null
  },
})

// Get all applications for company (alias for getRecent with no limit)
export const getForCompany = query({
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

    // Get all company projects
    const projects = await ctx.db
      .query('projects')
      .withIndex('by_company_id', (q) => q.eq('companyId', profile._id))
      .collect()

    // Get applications for all projects
    const allApplications = []

    for (const project of projects) {
      const applications = await ctx.db
        .query('projectApplications')
        .withIndex('by_project_id', (q) => q.eq('projectId', project._id))
        .collect()

      for (const app of applications) {
        const developerProfile = await ctx.db.get(app.developerId)
        if (!developerProfile) continue

        const developerUser = await ctx.db.get(developerProfile.userId)
        const developerData = await ctx.db
          .query('developerProfiles')
          .withIndex('by_profile_id', (q) => q.eq('profileId', app.developerId))
          .first()

        allApplications.push({
          ...app,
          project,
          developer: {
            user: developerUser,
            profile: developerProfile,
            developerProfile: developerData,
          },
        })
      }
    }

    // Sort by createdAt descending
    allApplications.sort((a, b) => b.createdAt - a.createdAt)

    return allApplications
  },
})

// Get recent applications for company dashboard
export const getRecent = query({
  args: { limit: v.optional(v.number()) },
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

    if (!profile || profile.role !== 'company') return []

    // Get all company projects
    const projects = await ctx.db
      .query('projects')
      .withIndex('by_company_id', (q) => q.eq('companyId', profile._id))
      .collect()

    // Get applications for all projects
    const allApplications = []

    for (const project of projects) {
      const applications = await ctx.db
        .query('projectApplications')
        .withIndex('by_project_id', (q) => q.eq('projectId', project._id))
        .collect()

      for (const app of applications) {
        const developerProfile = await ctx.db.get(app.developerId)
        if (!developerProfile) continue

        const developerUser = await ctx.db.get(developerProfile.userId)
        const developerData = await ctx.db
          .query('developerProfiles')
          .withIndex('by_profile_id', (q) => q.eq('profileId', app.developerId))
          .first()

        allApplications.push({
          application: app,
          project,
          developer: {
            user: developerUser,
            profile: developerProfile,
            developerProfile: developerData,
          },
        })
      }
    }

    // Sort by createdAt and limit
    allApplications.sort((a, b) => b.application.createdAt - a.application.createdAt)

    return allApplications.slice(0, args.limit ?? 10)
  },
})
