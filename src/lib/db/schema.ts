import { relations } from 'drizzle-orm'
import {
  pgTable,
  uuid,
  text,
  timestamp,
  decimal,
  bigserial,
  bigint,
  primaryKey,
  index,
  boolean,
  jsonb,
} from 'drizzle-orm/pg-core'

// Users table (from NextAuth)
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  password: text('password'), // For credentials auth
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const accounts = pgTable('accounts', {
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: bigint('expires_at', { mode: 'number' }),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (account) => ({
  compoundKey: primaryKey(account.provider, account.providerAccountId),
}))

export const sessions = pgTable('sessions', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

// Profiles table
export const profiles = pgTable('profiles', {
  id: text('id').primaryKey(),
  role: text('role', { enum: ['developer', 'company', 'admin'] }).notNull(),
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  timezone: text('timezone'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Developer profiles
export const developerProfiles = pgTable('developer_profiles', {
  userId: text('user_id').primaryKey().references(() => profiles.id, { onDelete: 'cascade' }),
  headline: text('headline'),
  bio: text('bio'),
  rate: decimal('rate', { precision: 10, scale: 2 }),
  availability: text('availability', { enum: ['available', 'busy', 'unavailable'] }).default('available'),
  portfolioUrl: text('portfolio_url'),
  githubUrl: text('github_url'),
  websiteUrl: text('website_url'),
  country: text('country'),
})

// Company profiles
export const companyProfiles = pgTable('company_profiles', {
  userId: text('user_id').primaryKey().references(() => profiles.id, { onDelete: 'cascade' }),
  companyName: text('company_name').notNull(),
  logoUrl: text('logo_url'),
  about: text('about'),
  websiteUrl: text('website_url'),
  industry: text('industry'),
  size: text('size'),
})

// Skills
export const skills = pgTable('skills', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  slug: text('slug').notNull().unique(),
  label: text('label').notNull(),
})

// Developer skills junction table
export const developerSkills = pgTable('developer_skills', {
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  skillId: bigint('skill_id', { mode: 'number' }).notNull().references(() => skills.id, { onDelete: 'cascade' }),
  level: text('level', { enum: ['beginner', 'intermediate', 'advanced', 'expert'] }).notNull(),
}, (table) => ({
  pk: primaryKey(table.userId, table.skillId),
}))

// Projects
export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: text('company_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  budgetMin: decimal('budget_min', { precision: 10, scale: 2 }),
  budgetMax: decimal('budget_max', { precision: 10, scale: 2 }),
  currency: text('currency').notNull().default('USD'),
  timeline: text('timeline'),
  locationPref: text('location_pref'),
  status: text('status', { enum: ['open', 'in_progress', 'closed'] }).notNull().default('open'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Project skills junction table
export const projectSkills = pgTable('project_skills', {
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  skillId: bigint('skill_id', { mode: 'number' }).notNull().references(() => skills.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey(table.projectId, table.skillId),
}))

// Project intake (for smart matching)
export const projectIntake = pgTable('project_intake', {
  id: uuid('id').defaultRandom().primaryKey(),
  submittedBy: uuid('submitted_by').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  skills: text('skills').array().notNull(),
  budgetMin: decimal('budget_min', { precision: 10, scale: 2 }),
  budgetMax: decimal('budget_max', { precision: 10, scale: 2 }),
  contactEmail: text('contact_email').notNull(),
  contactName: text('contact_name').notNull(),
  companyName: text('company_name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Subscriptions (mirrors Stripe data)
export const subscriptions = pgTable('subscriptions', {
  id: text('id').primaryKey(), // Stripe subscription ID
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  stripeCustomerId: text('stripe_customer_id').notNull(),
  productTier: text('product_tier').notNull(),
  status: text('status').notNull(),
  currentPeriodEnd: timestamp('current_period_end').notNull(),
})

// Notifications
export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type', { enum: ['application_status', 'new_message', 'project_update', 'system'] }).notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  data: jsonb('data'), // Additional structured data
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Indexes will be added inline with table definitions in a future update

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles),
  accounts: many(accounts),
  sessions: many(sessions),
}))

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, { fields: [profiles.id], references: [users.id] }),
  developerProfile: one(developerProfiles),
  companyProfile: one(companyProfiles),
  developerSkills: many(developerSkills),
  projects: many(projects),
  subscription: one(subscriptions),
}))

export const developerProfilesRelations = relations(developerProfiles, ({ one }) => ({
  profile: one(profiles, { fields: [developerProfiles.userId], references: [profiles.id] }),
}))

export const companyProfilesRelations = relations(companyProfiles, ({ one }) => ({
  profile: one(profiles, { fields: [companyProfiles.userId], references: [profiles.id] }),
}))

export const skillsRelations = relations(skills, ({ many }) => ({
  developerSkills: many(developerSkills),
  projectSkills: many(projectSkills),
}))

export const developerSkillsRelations = relations(developerSkills, ({ one }) => ({
  profile: one(profiles, { fields: [developerSkills.userId], references: [profiles.id] }),
  skill: one(skills, { fields: [developerSkills.skillId], references: [skills.id] }),
}))

export const projectsRelations = relations(projects, ({ one, many }) => ({
  company: one(profiles, { fields: [projects.companyId], references: [profiles.id] }),
  projectSkills: many(projectSkills),
}))

export const projectSkillsRelations = relations(projectSkills, ({ one }) => ({
  project: one(projects, { fields: [projectSkills.projectId], references: [projects.id] }),
  skill: one(skills, { fields: [projectSkills.skillId], references: [skills.id] }),
}))

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  profile: one(profiles, { fields: [subscriptions.userId], references: [profiles.id] }),
}))

// Project applications
export const projectApplications = pgTable('project_applications', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  developerId: text('developer_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  status: text('status', { enum: ['pending', 'accepted', 'rejected'] }).default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey(table.projectId, table.developerId),
}))

export const projectApplicationsRelations = relations(projectApplications, ({ one }) => ({
  project: one(projects, { fields: [projectApplications.projectId], references: [projects.id] }),
  developer: one(profiles, { fields: [projectApplications.developerId], references: [profiles.id] }),
}))

// Developer contacts
export const developerContacts = pgTable('developer_contacts', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: text('company_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  developerId: text('developer_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  status: text('status', { enum: ['sent', 'read', 'replied'] }).default('sent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const developerContactsRelations = relations(developerContacts, ({ one }) => ({
  company: one(profiles, { fields: [developerContacts.companyId], references: [profiles.id] }),
  developer: one(profiles, { fields: [developerContacts.developerId], references: [profiles.id] }),
}))

// Type exports
export type User = typeof users.$inferSelect
export type Profile = typeof profiles.$inferSelect
export type DeveloperProfile = typeof developerProfiles.$inferSelect
export type CompanyProfile = typeof companyProfiles.$inferSelect
export type Skill = typeof skills.$inferSelect
export type DeveloperSkill = typeof developerSkills.$inferSelect
export type Project = typeof projects.$inferSelect
export type ProjectSkill = typeof projectSkills.$inferSelect
export type ProjectApplication = typeof projectApplications.$inferSelect
export type DeveloperContact = typeof developerContacts.$inferSelect
export type Subscription = typeof subscriptions.$inferSelect
export type Notification = typeof notifications.$inferSelect
