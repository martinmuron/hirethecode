import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  // Users - synced from Clerk
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_clerk_id', ['clerkId'])
    .index('by_email', ['email']),

  // Profiles - role assignment
  profiles: defineTable({
    userId: v.id('users'),
    role: v.union(v.literal('developer'), v.literal('company'), v.literal('admin')),
    displayName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    timezone: v.optional(v.string()),
    createdAt: v.number(),
  }).index('by_user_id', ['userId']),

  // Developer-specific profile data
  developerProfiles: defineTable({
    profileId: v.id('profiles'),
    headline: v.optional(v.string()),
    bio: v.optional(v.string()),
    rate: v.optional(v.number()),
    availability: v.union(
      v.literal('available'),
      v.literal('busy'),
      v.literal('unavailable')
    ),
    portfolioUrl: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    country: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_profile_id', ['profileId'])
    .index('by_availability', ['availability'])
    .index('by_rate', ['rate']),

  // Company-specific profile data
  companyProfiles: defineTable({
    profileId: v.id('profiles'),
    companyName: v.string(),
    logoUrl: v.optional(v.string()),
    about: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    industry: v.optional(v.string()),
    size: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_profile_id', ['profileId']),

  // Skills catalog
  skills: defineTable({
    slug: v.string(),
    label: v.string(),
  }).index('by_slug', ['slug']),

  // Developer skills junction
  developerSkills: defineTable({
    profileId: v.id('profiles'),
    skillId: v.id('skills'),
    level: v.union(
      v.literal('beginner'),
      v.literal('intermediate'),
      v.literal('advanced'),
      v.literal('expert')
    ),
  })
    .index('by_profile_id', ['profileId'])
    .index('by_skill_id', ['skillId']),

  // Projects posted by companies
  projects: defineTable({
    companyId: v.id('profiles'),
    title: v.string(),
    description: v.string(),
    budgetMin: v.optional(v.number()),
    budgetMax: v.optional(v.number()),
    currency: v.string(),
    timeline: v.optional(v.string()),
    locationPref: v.optional(v.string()),
    status: v.union(
      v.literal('open'),
      v.literal('in_progress'),
      v.literal('closed')
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_company_id', ['companyId'])
    .index('by_status', ['status'])
    .index('by_created_at', ['createdAt']),

  // Project skills junction
  projectSkills: defineTable({
    projectId: v.id('projects'),
    skillId: v.id('skills'),
  })
    .index('by_project_id', ['projectId'])
    .index('by_skill_id', ['skillId']),

  // Project intake for smart matching
  projectIntake: defineTable({
    submittedBy: v.id('profiles'),
    title: v.string(),
    description: v.string(),
    skills: v.array(v.string()),
    budgetMin: v.optional(v.number()),
    budgetMax: v.optional(v.number()),
    contactEmail: v.string(),
    contactName: v.string(),
    companyName: v.string(),
    createdAt: v.number(),
  }).index('by_submitted_by', ['submittedBy']),

  // Developer applications to projects
  projectApplications: defineTable({
    projectId: v.id('projects'),
    developerId: v.id('profiles'),
    message: v.string(),
    status: v.union(
      v.literal('pending'),
      v.literal('accepted'),
      v.literal('rejected')
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_project_id', ['projectId'])
    .index('by_developer_id', ['developerId'])
    .index('by_status', ['status']),

  // Company contacts to developers
  developerContacts: defineTable({
    companyId: v.id('profiles'),
    developerId: v.id('profiles'),
    message: v.string(),
    status: v.union(
      v.literal('sent'),
      v.literal('read'),
      v.literal('replied')
    ),
    createdAt: v.number(),
  })
    .index('by_developer_id', ['developerId'])
    .index('by_company_id', ['companyId']),

  // Stripe subscriptions mirror
  subscriptions: defineTable({
    profileId: v.id('profiles'),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    productTier: v.string(),
    status: v.string(),
    currentPeriodEnd: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_profile_id', ['profileId'])
    .index('by_stripe_customer_id', ['stripeCustomerId'])
    .index('by_stripe_subscription_id', ['stripeSubscriptionId']),

  // In-app notifications
  notifications: defineTable({
    userId: v.id('profiles'),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal('application_status'),
      v.literal('new_message'),
      v.literal('project_update'),
      v.literal('system')
    ),
    isRead: v.boolean(),
    data: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index('by_user_id', ['userId'])
    .index('by_user_and_read', ['userId', 'isRead']),
})
