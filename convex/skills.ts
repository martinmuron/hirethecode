import { v } from 'convex/values'
import { query, mutation, internalMutation } from './_generated/server'

// List all skills
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('skills').collect()
  },
})

// Get skill by ID
export const get = query({
  args: { id: v.id('skills') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

// Get skill by slug
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('skills')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first()
  },
})

// Search skills by label
export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const allSkills = await ctx.db.query('skills').collect()
    const searchLower = args.query.toLowerCase()

    return allSkills.filter(
      (skill) =>
        skill.label.toLowerCase().includes(searchLower) ||
        skill.slug.toLowerCase().includes(searchLower)
    )
  },
})

// Create skill (admin only in production)
export const create = mutation({
  args: {
    slug: v.string(),
    label: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if skill already exists
    const existing = await ctx.db
      .query('skills')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first()

    if (existing) {
      return existing._id
    }

    return await ctx.db.insert('skills', {
      slug: args.slug,
      label: args.label,
    })
  },
})

// Internal mutation for seeding
export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    const skills = [
      { slug: 'javascript', label: 'JavaScript' },
      { slug: 'typescript', label: 'TypeScript' },
      { slug: 'react', label: 'React' },
      { slug: 'nextjs', label: 'Next.js' },
      { slug: 'nodejs', label: 'Node.js' },
      { slug: 'python', label: 'Python' },
      { slug: 'django', label: 'Django' },
      { slug: 'flask', label: 'Flask' },
      { slug: 'java', label: 'Java' },
      { slug: 'spring', label: 'Spring Boot' },
      { slug: 'csharp', label: 'C#' },
      { slug: 'dotnet', label: '.NET' },
      { slug: 'go', label: 'Go' },
      { slug: 'rust', label: 'Rust' },
      { slug: 'ruby', label: 'Ruby' },
      { slug: 'rails', label: 'Ruby on Rails' },
      { slug: 'php', label: 'PHP' },
      { slug: 'laravel', label: 'Laravel' },
      { slug: 'vue', label: 'Vue.js' },
      { slug: 'angular', label: 'Angular' },
      { slug: 'svelte', label: 'Svelte' },
      { slug: 'tailwindcss', label: 'Tailwind CSS' },
      { slug: 'css', label: 'CSS' },
      { slug: 'html', label: 'HTML' },
      { slug: 'sql', label: 'SQL' },
      { slug: 'postgresql', label: 'PostgreSQL' },
      { slug: 'mysql', label: 'MySQL' },
      { slug: 'mongodb', label: 'MongoDB' },
      { slug: 'redis', label: 'Redis' },
      { slug: 'graphql', label: 'GraphQL' },
      { slug: 'rest', label: 'REST API' },
      { slug: 'docker', label: 'Docker' },
      { slug: 'kubernetes', label: 'Kubernetes' },
      { slug: 'aws', label: 'AWS' },
      { slug: 'gcp', label: 'Google Cloud' },
      { slug: 'azure', label: 'Azure' },
      { slug: 'terraform', label: 'Terraform' },
      { slug: 'git', label: 'Git' },
      { slug: 'cicd', label: 'CI/CD' },
      { slug: 'testing', label: 'Testing' },
      { slug: 'agile', label: 'Agile' },
      { slug: 'scrum', label: 'Scrum' },
      { slug: 'figma', label: 'Figma' },
      { slug: 'ui-ux', label: 'UI/UX Design' },
      { slug: 'mobile', label: 'Mobile Development' },
      { slug: 'react-native', label: 'React Native' },
      { slug: 'flutter', label: 'Flutter' },
      { slug: 'swift', label: 'Swift' },
      { slug: 'kotlin', label: 'Kotlin' },
      { slug: 'machine-learning', label: 'Machine Learning' },
      { slug: 'ai', label: 'Artificial Intelligence' },
      { slug: 'data-science', label: 'Data Science' },
      { slug: 'blockchain', label: 'Blockchain' },
      { slug: 'solidity', label: 'Solidity' },
      { slug: 'web3', label: 'Web3' },
      { slug: 'security', label: 'Security' },
      { slug: 'devops', label: 'DevOps' },
      { slug: 'linux', label: 'Linux' },
      { slug: 'networking', label: 'Networking' },
    ]

    for (const skill of skills) {
      const existing = await ctx.db
        .query('skills')
        .withIndex('by_slug', (q) => q.eq('slug', skill.slug))
        .first()

      if (!existing) {
        await ctx.db.insert('skills', skill)
      }
    }
  },
})

// Get developer's skills
export const getDeveloperSkills = query({
  args: { profileId: v.id('profiles') },
  handler: async (ctx, args) => {
    const developerSkills = await ctx.db
      .query('developerSkills')
      .withIndex('by_profile_id', (q) => q.eq('profileId', args.profileId))
      .collect()

    // Fetch full skill data for each
    const skillsWithDetails = await Promise.all(
      developerSkills.map(async (ds) => {
        const skill = await ctx.db.get(ds.skillId)
        return {
          ...ds,
          skill,
        }
      })
    )

    return skillsWithDetails
  },
})

// Add skill to developer
export const addToDeveloper = mutation({
  args: {
    skillId: v.id('skills'),
    level: v.union(
      v.literal('beginner'),
      v.literal('intermediate'),
      v.literal('advanced'),
      v.literal('expert')
    ),
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

    // Check if skill already added
    const existing = await ctx.db
      .query('developerSkills')
      .withIndex('by_profile_id', (q) => q.eq('profileId', profile._id))
      .filter((q) => q.eq(q.field('skillId'), args.skillId))
      .first()

    if (existing) {
      // Update level if already exists
      await ctx.db.patch(existing._id, { level: args.level })
      return existing._id
    }

    return await ctx.db.insert('developerSkills', {
      profileId: profile._id,
      skillId: args.skillId,
      level: args.level,
    })
  },
})

// Remove skill from developer
export const removeFromDeveloper = mutation({
  args: { skillId: v.id('skills') },
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

    const developerSkill = await ctx.db
      .query('developerSkills')
      .withIndex('by_profile_id', (q) => q.eq('profileId', profile._id))
      .filter((q) => q.eq(q.field('skillId'), args.skillId))
      .first()

    if (developerSkill) {
      await ctx.db.delete(developerSkill._id)
    }
  },
})

// Update developer skills in bulk
export const updateDeveloperSkills = mutation({
  args: {
    skills: v.array(
      v.object({
        skillId: v.id('skills'),
        level: v.union(
          v.literal('beginner'),
          v.literal('intermediate'),
          v.literal('advanced'),
          v.literal('expert')
        ),
      })
    ),
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

    // Delete all existing skills
    const existingSkills = await ctx.db
      .query('developerSkills')
      .withIndex('by_profile_id', (q) => q.eq('profileId', profile._id))
      .collect()

    for (const skill of existingSkills) {
      await ctx.db.delete(skill._id)
    }

    // Add new skills
    for (const skill of args.skills) {
      await ctx.db.insert('developerSkills', {
        profileId: profile._id,
        skillId: skill.skillId,
        level: skill.level,
      })
    }
  },
})
