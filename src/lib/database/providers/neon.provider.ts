import { db } from '@/lib/db'
import { 
  profiles, projects, subscriptions, notifications, projectApplications, companyProfiles, 
  developerContacts, developerProfiles, skills, developerSkills, companySkills, projectSkills,
  seekerProfiles
} from '@/lib/db/schema'
import { eq, and, sql, inArray, gte, lte, desc, desc, asc, count, or } from 'drizzle-orm'
import type { 
  IDatabaseProvider, 
  IUserRepository, 
  IProfileRepository,
  IProjectRepository, 
  ISubscriptionRepository, 
  INotificationRepository,
  IApplicationRepository,
  ApplicationWithApplicantDetails,
  IDeveloperContactRepository,
  IDeveloperProfileRepository,
  ISeekerProfileRepository,
  SeekerProfile, ProjectWithSeekerData, ProjectSkillsBulkData,
  CreateSeekerProfileData, UpdateSeekerProfileData,
  ISkillRepository,
  IDeveloperSkillRepository,
  ICompanyProfileRepository,
  ICompanySkillRepository,
  IAdminStatsRepository, DeveloperStatusStats, ProjectStatusStats, AdminDashboardStats,
  User, Profile, Project, Subscription, Notification, ProjectApplication, ApplicationWithDetails, 
  CompanyProfile, CompanySkill, CompanySkillWithDetails,
  DeveloperContact, DeveloperProfile, Skill, DeveloperSkill, DeveloperSkillWithDetails, DeveloperSearchResult,
  ProjectSkillWithDetails, DeveloperMatchCandidate,
  CreateUserData, UpdateUserData, CreateProfileData, UpdateProfileData,
  CreateProjectData, UpdateProjectData, CreateSubscriptionData, UpdateSubscriptionData,
  CreateNotificationData, CreateApplicationData, UpdateApplicationData,
  CreateDeveloperContactData, UpdateDeveloperContactData,
  CreateDeveloperProfileData, UpdateDeveloperProfileData, CreateSkillData, UpdateSkillData,
  CreateCompanyProfileData, UpdateCompanyProfileData, CreateCompanySkillData, UpdateCompanySkillData,
  CompanySkillWithImportance, DeveloperSmartMatchData, CompanySmartMatchData,
  ProjectFilters, DeveloperFilters,
  AdminDeveloperFilters, AdminDeveloperData, AdminDeveloperWithSkills,
  CompanyDashboardProject, ApplicationStats, CompanyApplicationWithDetails, CompanyDashboardData,
  CompanyProjectWithDetails, ProjectApplicationWithDeveloper, CompanyProjectWithApplications, CompanyProjectsData,
  DeveloperFullProfile, DeveloperPageData,
  DeveloperMatchData, CompanyMatchData
} from '../interfaces/database.interface'

class NeonUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    // With Clerk, users are managed externally
    // This is mainly for legacy compatibility
    return null
  }

  async findByEmail(email: string): Promise<User | null> {
    return null
  }

  async create(data: CreateUserData): Promise<User> {
    throw new Error('Users are managed by Clerk')
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    throw new Error('Users are managed by Clerk')
  }

  async delete(id: string): Promise<void> {
    throw new Error('Users are managed by Clerk')
  }
}

class NeonProfileRepository implements IProfileRepository {
  async findById(id: string): Promise<Profile | null> {
    const result = await db.select()
      .from(profiles)
      .where(eq(profiles.id, id))
      .limit(1)
    
    return result[0] || null
  }

  async findByUserId(userId: string): Promise<Profile | null> {
    return this.findById(userId) // Same thing for profiles
  }

  async create(data: CreateProfileData): Promise<Profile> {
    const result = await db.insert(profiles)
      .values(data)
      .returning()
    
    return result[0]
  }

  async update(id: string, data: UpdateProfileData): Promise<Profile> {
    const result = await db.update(profiles)
      .set(data)
      .where(eq(profiles.id, id))
      .returning()
    
    return result[0]
  }

  async delete(id: string): Promise<void> {
    await db.delete(profiles).where(eq(profiles.id, id))
  }

  async findByRole(role: string): Promise<Profile[]> {
    return await db.select()
      .from(profiles)
      .where(eq(profiles.role, role as any))
  }

  async findDeveloperWithFullDetails(developerId: string): Promise<DeveloperFullProfile | null> {
    // Get basic profile data
    const profile = await this.findById(developerId)
    
    if (!profile || profile.role !== 'developer') {
      return null
    }

    // Get developer profile and skills in parallel
    const [developerProfile, skillsData] = await Promise.all([
      db.select()
        .from(developerProfiles)
        .where(eq(developerProfiles.userId, developerId))
        .limit(1)
        .then(result => result[0] || null),
      
      db.select({
        skill: skills,
        level: developerSkills.level
      })
        .from(developerSkills)
        .innerJoin(skills, eq(developerSkills.skillId, skills.id))
        .where(eq(developerSkills.userId, developerId))
    ])

    return {
      profile,
      developerProfile,
      skills: skillsData.map(ds => ({
        id: ds.skill.id,
        slug: ds.skill.slug,
        label: ds.skill.label,
        level: ds.level
      }))
    }
  }
}

class NeonProjectRepository implements IProjectRepository {
  async findById(id: string): Promise<Project | null> {
    const result = await db.select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1)
    
    return result[0] || null
  }

  async findBySeekerId(seekerId: string): Promise<Project[]> {
    return await db.select()
      .from(projects)
      .where(eq(projects.seekerId, seekerId))
  }

  async findByStatus(status: string): Promise<Project[]> {
    return await db.select()
      .from(projects)
      .where(eq(projects.status, status as any))
  }

  async create(data: CreateProjectData): Promise<Project> {
    const result = await db.insert(projects)
      .values(data)
      .returning()
    
    return result[0]
  }

  async update(id: string, data: UpdateProjectData): Promise<Project> {
    const result = await db.update(projects)
      .set(data)
      .where(eq(projects.id, id))
      .returning()
    
    return result[0]
  }

  async delete(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id))
  }

  async search(filters: ProjectFilters): Promise<Project[]> {
    let query = db.select().from(projects)
    
    if (filters.status) {
      query = query.where(eq(projects.status, filters.status as any))
    }
    
    if (filters.budgetMin) {
      query = query.where(sql`${projects.budgetMin} >= ${filters.budgetMin}`)
    }
    
    if (filters.budgetMax) {
      query = query.where(sql`${projects.budgetMax} <= ${filters.budgetMax}`)
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit)
    }
    
    if (filters.offset) {
      query = query.offset(filters.offset)
    }
    
    return await query
  }

  async findProjectSkills(projectId: string): Promise<ProjectSkillWithDetails[]> {
    const result = await db.select({
      skillId: projectSkills.skillId,
      skill: skills
    })
      .from(projectSkills)
      .innerJoin(skills, eq(projectSkills.skillId, skills.id))
      .where(eq(projectSkills.projectId, projectId))

    return result
  }

  async findSmartMatchCandidates(requiredSkillIds: number[]): Promise<DeveloperMatchCandidate[]> {
    const result = await db.select({
      developer: {
        id: profiles.id,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
        createdAt: profiles.createdAt,
      },
      profile: {
        headline: developerProfiles.headline,
        bio: developerProfiles.bio,
        rate: developerProfiles.rate,
        availability: developerProfiles.availability,
        country: developerProfiles.country,
        portfolioUrl: developerProfiles.portfolioUrl,
        githubUrl: developerProfiles.githubUrl,
      },
      skill: {
        id: skills.id,
        label: skills.label,
        slug: skills.slug
      },
      skillLevel: developerSkills.level,
    })
      .from(profiles)
      .innerJoin(developerProfiles, eq(profiles.id, developerProfiles.userId))
      .innerJoin(developerSkills, eq(profiles.id, developerSkills.userId))
      .innerJoin(skills, eq(developerSkills.skillId, skills.id))
      .where(
        and(
          eq(profiles.role, 'developer'),
          eq(developerProfiles.approved, 'approved'),
          inArray(developerSkills.skillId, requiredSkillIds)
        )
      )

    return result
  }

  async findOpenProjectsWithSeekers(): Promise<ProjectWithSeekerData[]> {
    const result = await db.select({
      // Project fields
      projectId: projects.id,
      title: projects.title,
      description: projects.description,
      budgetMin: projects.budgetMin,
      budgetMax: projects.budgetMax,
      currency: projects.currency,
      timeline: projects.timeline,
      locationPref: projects.locationPref,
      status: projects.status,
      complexity: projects.complexity,
      recommendedFor: projects.recommendedFor,
      createdAt: projects.createdAt,
      
      // Seeker profile fields
      seekerId: profiles.id,
      seekerDisplayName: profiles.displayName,
      seekerAvatarUrl: profiles.avatarUrl,
      
      // Seeker organization name (from seekerProfiles if available)
      organizationName: seekerProfiles.organizationName,
    })
      .from(projects)
      .innerJoin(profiles, eq(projects.seekerId, profiles.id))
      .leftJoin(seekerProfiles, eq(profiles.id, seekerProfiles.userId))
      .where(
        and(
          eq(projects.status, 'open'),
          eq(profiles.role, 'seeker')
        )
      )
      .orderBy(desc(projects.createdAt))

    return result
  }

  async findSkillsForProjects(projectIds: string[]): Promise<ProjectSkillsBulkData[]> {
    const result = await db.select({
      projectId: projectSkills.projectId,
      skillId: skills.id,
      skillSlug: skills.slug,
      skillLabel: skills.label,
    })
      .from(projectSkills)
      .innerJoin(skills, eq(projectSkills.skillId, skills.id))
      .where(inArray(projectSkills.projectId, projectIds))

    return result
  }

  async findProjectsByCompanyId(companyId: string, limit: number = 10): Promise<CompanyDashboardProject[]> {
    const result = await db.select({
      id: projects.id,
      title: projects.title,
      description: projects.description,
      status: projects.status,
      createdAt: projects.createdAt,
    })
      .from(projects)
      .where(eq(projects.seekerId, companyId)) // Note: using seekerId for consistency
      .orderBy(desc(projects.createdAt))
      .limit(limit)

    return result
  }

  async findAllProjectsByCompanyId(companyId: string): Promise<CompanyProjectWithDetails[]> {
    const result = await db.select({
      id: projects.id,
      title: projects.title,
      description: projects.description,
      budgetMin: projects.budgetMin,
      budgetMax: projects.budgetMax,
      currency: projects.currency,
      timeline: projects.timeline,
      status: projects.status,
      createdAt: projects.createdAt,
    })
      .from(projects)
      .where(eq(projects.seekerId, companyId)) // Note: using seekerId for consistency
      .orderBy(desc(projects.createdAt))

    return result
  }

  async findOpenProjectsCountBySeekerId(seekerId: string): Promise<int> {
    return await db.select({ count: sql<number>`count(*)` })
      .from(projects)
      .where(and(
        eq(projects.seekerId, id),
        eq(projects.status, 'open')
      ))
  }
}

class NeonSubscriptionRepository implements ISubscriptionRepository {
  async findByUserId(userId: string): Promise<Subscription | null> {
    const result = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1)
    
    return result[0] || null
  }

  async create(data: CreateSubscriptionData): Promise<Subscription> {
    const result = await db.insert(subscriptions)
      .values(data)
      .returning()
    
    return result[0]
  }

  async update(id: string, data: UpdateSubscriptionData): Promise<Subscription> {
    const result = await db.update(subscriptions)
      .set(data)
      .where(eq(subscriptions.id, id))
      .returning()
    
    return result[0]
  }

  async delete(id: string): Promise<void> {
    await db.delete(subscriptions).where(eq(subscriptions.id, id))
  }
}

class NeonNotificationRepository implements INotificationRepository {
  async findByUserId(userId: string): Promise<Notification[]> {
    return await db.select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
  }

  async findUnreadByUserId(userId: string): Promise<Notification[]> {
    return await db.select()
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ))
  }

  async findUnreadCountByUserId(userId: string): Promise<int> {
    return await db.select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(
        eq(notifications.userId, id),
        eq(notifications.isRead, false)
      ))
  }

  async create(data: CreateNotificationData): Promise<Notification> {
    const result = await db.insert(notifications)
      .values(data)
      .returning()
    
    return result[0]
  }

  async markAsRead(id: string): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
  }

  async markAllAsRead(userId: string): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId))
  }

  async delete(id: string): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id))
  }
}

class NeonApplicationRepository implements IApplicationRepository {
  async findById(id: string): Promise<ProjectApplication | null> {
    const result = await db.select()
      .from(projectApplications)
      .where(eq(projectApplications.id, id))
      .limit(1)
    
    return result[0] || null
  }

  async findByProjectId(projectId: string): Promise<ProjectApplication[]> {
    return await db.select()
      .from(projectApplications)
      .where(eq(projectApplications.projectId, projectId))
  }

  async findByDeveloperId(developerId: string): Promise<ProjectApplication[]> {
    return await db.select()
      .from(projectApplications)
      .where(eq(projectApplications.developerId, developerId))
  }

  async findByCompanyId(companyId: string): Promise<ProjectApplication[]> {
    return await db.select()
      .from(projectApplications)
      .innerJoin(projects, eq(projectApplications.projectId, projects.id))
      .where(eq(projects.seekerId, companyId))
  }

  async create(data: CreateApplicationData): Promise<ProjectApplication> {
    const result = await db.insert(projectApplications)
      .values(data)
      .returning()
    
    return result[0]
  }

  async update(id: string, data: UpdateApplicationData): Promise<ProjectApplication> {
    const result = await db.update(projectApplications)
      .set(data)
      .where(eq(projectApplications.id, id))
      .returning()
    
    return result[0]
  }

  async delete(id: string): Promise<void> {
    await db.delete(projectApplications).where(eq(projectApplications.id, id))
  }

  async updateStatus(id: string, status: 'pending' | 'accepted' | 'rejected'): Promise<void> {
    await db.update(projectApplications)
      .set({ status })
      .where(eq(projectApplications.id, id))
  }

  async findApplicationWithDetails(applicationId: string): Promise<ApplicationWithDetails | null> {
    const result = await db.select({
      id: projectApplications.id,
      projectId: projectApplications.projectId,
      developerId: projectApplications.developerId,
      companyId: projects.seekerId, // Note: using seekerId instead of companyId
      projectTitle: projects.title,
      companyName: profiles.displayName,
      companyProfileName: companyProfiles.companyName
    })
      .from(projectApplications)
      .innerJoin(projects, eq(projectApplications.projectId, projects.id))
      .innerJoin(profiles, eq(projects.seekerId, profiles.id))
      .leftJoin(companyProfiles, eq(profiles.id, companyProfiles.userId))
      .where(eq(projectApplications.id, applicationId))
      .limit(1)

    return result[0] || null
  }

  async findByProjectAndUser(projectId: string, userId: string): Promise<ProjectApplication | null> {
    const result = await db.select()
      .from(projectApplications)
      .where(and(
        eq(projectApplications.projectId, projectId),
        eq(projectApplications.developerId, userId)
      ))
      .limit(1)
    
    return result[0] || null
  }

  async findApplicationsWithApplicantDetails(projectId: string): Promise<ApplicationWithApplicantDetails[]> {
    const result = await db.select({
      application: projectApplications,
      applicant: profiles,
    })
      .from(projectApplications)
      .innerJoin(profiles, eq(projectApplications.developerId, profiles.id))
      .where(eq(projectApplications.projectId, projectId))

    return result.map(({ application, applicant }) => ({
      application,
      applicant: {
        id: applicant.id,
        displayName: applicant.displayName,
        avatarUrl: applicant.avatarUrl,
        role: applicant.role
      }
    }))
  }

  async getApplicationStatsByProjectIds(projectIds: string[]): Promise<ApplicationStats[]> {
    if (projectIds.length === 0) return []

    const result = await db.select({
      projectId: projectApplications.projectId,
      status: projectApplications.status,
      count: count()
    })
      .from(projectApplications)
      .where(inArray(projectApplications.projectId, projectIds))
      .groupBy(projectApplications.projectId, projectApplications.status)

    return result
  }

  async getRecentApplicationsForCompany(companyId: string, limit: number = 10): Promise<CompanyApplicationWithDetails[]> {
    const result = await db.select({
      id: projectApplications.id,
      projectId: projectApplications.projectId,
      projectTitle: projects.title,
      status: projectApplications.status,
      createdAt: projectApplications.createdAt,
      developer: {
        id: profiles.id,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
      },
      developerProfile: {
        headline: developerProfiles.headline,
        rate: developerProfiles.rate,
        availability: developerProfiles.availability,
      }
    })
      .from(projectApplications)
      .innerJoin(projects, eq(projectApplications.projectId, projects.id))
      .innerJoin(profiles, eq(projectApplications.developerId, profiles.id))
      .leftJoin(developerProfiles, eq(profiles.id, developerProfiles.userId))
      .where(eq(projects.seekerId, companyId)) // Note: using seekerId for consistency
      .orderBy(desc(projectApplications.createdAt))
      .limit(limit)

    return result.map(row => ({
      id: row.id,
      projectId: row.projectId,
      projectTitle: row.projectTitle,
      status: row.status,
      createdAt: row.createdAt,
      developer: row.developer,
      developerProfile: {
        headline: row.developerProfile.headline,
        rate: row.developerProfile.rate,
        availability: row.developerProfile.availability || 'unavailable'
      }
    }))
  }

  async findApplicationsForProjects(projectIds: string[]): Promise<ProjectApplicationWithDeveloper[]> {
    if (projectIds.length === 0) return []

    const result = await db.select({
      id: projectApplications.id,
      projectId: projectApplications.projectId,
      message: projectApplications.message,
      status: projectApplications.status,
      createdAt: projectApplications.createdAt,
      developer: {
        id: profiles.id,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
        // Note: Can't get email from Clerk users table since users are managed externally
        email: sql<string>`NULL`, // Placeholder - email comes from Clerk
      },
      developerProfile: {
        headline: developerProfiles.headline,
        rate: developerProfiles.rate,
        availability: developerProfiles.availability,
      }
    })
      .from(projectApplications)
      .innerJoin(profiles, eq(projectApplications.developerId, profiles.id))
      .leftJoin(developerProfiles, eq(profiles.id, developerProfiles.userId))
      .where(
        and(
          inArray(projectApplications.projectId, projectIds),
          eq(profiles.role, 'developer')
        )
      )
      .orderBy(desc(projectApplications.createdAt))

    return result.map(row => ({
      id: row.id,
      projectId: row.projectId,
      message: row.message,
      status: row.status,
      createdAt: row.createdAt,
      developer: {
        id: row.developer.id,
        displayName: row.developer.displayName,
        avatarUrl: row.developer.avatarUrl,
        email: undefined // Will need to be fetched from Clerk if needed
      },
      developerProfile: {
        headline: row.developerProfile.headline,
        rate: row.developerProfile.rate,
        availability: row.developerProfile.availability || 'unavailable'
      }
    }))
  }
}

class NeonDeveloperContactRepository implements IDeveloperContactRepository {
  async findById(id: string): Promise<DeveloperContact | null> {
    const result = await db.select()
      .from(developerContacts)
      .where(eq(developerContacts.id, id))
      .limit(1)
    
    return result[0] || null
  }

  async findByCompanyId(companyId: string): Promise<DeveloperContact[]> {
    return await db.select()
      .from(developerContacts)
      .where(eq(developerContacts.companyId, companyId))
  }

  async findByDeveloperId(developerId: string): Promise<DeveloperContact[]> {
    return await db.select()
      .from(developerContacts)
      .where(eq(developerContacts.developerId, developerId))
  }

  async create(data: CreateDeveloperContactData): Promise<DeveloperContact> {
    const result = await db.insert(developerContacts)
      .values(data)
      .returning()
    
    return result[0]
  }

  async update(id: string, data: UpdateDeveloperContactData): Promise<DeveloperContact> {
    const result = await db.update(developerContacts)
      .set(data)
      .where(eq(developerContacts.id, id))
      .returning()
    
    return result[0]
  }

  async delete(id: string): Promise<void> {
    await db.delete(developerContacts).where(eq(developerContacts.id, id))
  }

  async updateStatus(id: string, status: 'sent' | 'read' | 'replied'): Promise<void> {
    await db.update(developerContacts)
      .set({ status })
      .where(eq(developerContacts.id, id))
  }

  async findContactsBetween(companyId: string, developerId: string): Promise<DeveloperContact[]> {
    return await db.select()
      .from(developerContacts)
      .where(and(
        eq(developerContacts.companyId, companyId),
        eq(developerContacts.developerId, developerId)
      ))
      .orderBy(sql`${developerContacts.createdAt} DESC`)
  }
}

class NeonDeveloperProfileRepository implements IDeveloperProfileRepository {
  async findByUserId(userId: string): Promise<DeveloperProfile | null> {
    const result = await db.select()
      .from(developerProfiles)
      .where(eq(developerProfiles.userId, userId))
      .limit(1)
    
    return result[0] || null
  }

  async create(data: CreateDeveloperProfileData): Promise<DeveloperProfile> {
    const result = await db.insert(developerProfiles)
      .values(data)
      .returning()
    
    return result[0]
  }

  async update(userId: string, data: UpdateDeveloperProfileData): Promise<DeveloperProfile> {
    const result = await db.update(developerProfiles)
      .set(data)
      .where(eq(developerProfiles.userId, userId))
      .returning()
    
    return result[0]
  }

  async upsert(userId: string, data: CreateDeveloperProfileData): Promise<DeveloperProfile> {
    // Use Drizzle's onConflictDoUpdate for true upsert
    const result = await db.insert(developerProfiles)
      .values(data)
      .onConflictDoUpdate({
        target: developerProfiles.userId,
        set: {
          headline: data.headline,
          bio: data.bio,
          rate: data.rate,
          availability: data.availability || 'available',
          portfolioUrl: data.portfolioUrl,
          githubUrl: data.githubUrl,
          websiteUrl: data.websiteUrl,
          country: data.country,
        }
      })
      .returning()
    
    return result[0]
  }

  async delete(userId: string): Promise<void> {
    await db.delete(developerProfiles).where(eq(developerProfiles.userId, userId))
  }

  async findApprovedDevelopers(filters: DeveloperFilters): Promise<DeveloperSearchResult[]> {
    // Build filter conditions
    let conditions = [
      eq(profiles.role, 'developer'),
      eq(developerProfiles.approved, 'approved')
    ]

    // Apply availability filter
    if (filters.availability && filters.availability !== 'all') {
      conditions.push(eq(developerProfiles.availability, filters.availability))
    }

    // Apply rate filter
    if (filters.rateRange && filters.rateRange !== 'all') {
      const [min, max] = filters.rateRange.split('-').map(r => r.replace('+', ''))
      if (max) {
        conditions.push(
          and(
            gte(sql`CAST(${developerProfiles.rate} AS DECIMAL)`, min),
            lte(sql`CAST(${developerProfiles.rate} AS DECIMAL)`, max)
          )!
        )
      } else if (min) {
        conditions.push(
          gte(sql`CAST(${developerProfiles.rate} AS DECIMAL)`, min)
        )
      }
    }

    // Execute the query with sorting
    let orderByClause
    switch (filters.sort) {
      case 'rate-low':
        orderByClause = asc(sql`CAST(${developerProfiles.rate} AS DECIMAL)`)
        break
      case 'rate-high':
        orderByClause = desc(sql`CAST(${developerProfiles.rate} AS DECIMAL)`)
        break
      case 'available':
        orderByClause = sql`CASE ${developerProfiles.availability} WHEN 'available' THEN 1 WHEN 'busy' THEN 2 ELSE 3 END`
        break
      default: // recent
        orderByClause = desc(profiles.createdAt)
    }

    const developers = await db.select({
      profile: profiles,
      developerProfile: developerProfiles,
    })
      .from(profiles)
      .leftJoin(developerProfiles, eq(profiles.id, developerProfiles.userId))
      .where(and(...conditions))
      .orderBy(orderByClause)
      .limit(filters.limit || 50)
      .offset(filters.offset || 0)

    // Get skills for each developer
    const developersWithSkills = await Promise.all(
      developers.map(async ({ profile, developerProfile }) => {
        const skillsData = await db.select({
          skill: skills,
          level: developerSkills.level
        })
          .from(developerSkills)
          .innerJoin(skills, eq(developerSkills.skillId, skills.id))
          .where(eq(developerSkills.userId, profile.id))

        // Filter by skill if specified
        if (filters.skill && filters.skill !== 'all') {
          const hasSkill = skillsData.some(ds => 
            ds.skill.label.toLowerCase() === filters.skill!.toLowerCase()
          )
          if (!hasSkill) return null
        }

        return {
          id: profile.id,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
          headline: developerProfile?.headline,
          bio: developerProfile?.bio,
          rate: developerProfile?.rate,
          availability: developerProfile?.availability || 'unavailable',
          portfolioUrl: developerProfile?.portfolioUrl,
          githubUrl: developerProfile?.githubUrl,
          websiteUrl: developerProfile?.websiteUrl,
          country: developerProfile?.country,
          skills: skillsData.map(ds => ({
            skill: ds.skill,
            level: ds.level
          }))
        }
      })
    )

    // Filter out null results (developers without required skill)
    return developersWithSkills.filter(dev => dev !== null) as DeveloperSearchResult[]
  }

  async findMatchingDevelopers(skillIds: number[]): Promise<DeveloperMatchData[]> {
    const result = await db.select({
      userId: developerSkills.userId,
      skillId: developerSkills.skillId,
      skillLabel: skills.label,
      skillLevel: developerSkills.level,
      displayName: profiles.displayName,
      avatarUrl: profiles.avatarUrl,
      headline: developerProfiles.headline,
      rate: developerProfiles.rate,
      availability: developerProfiles.availability,
      approved: developerProfiles.approved,
      country: developerProfiles.country,
    })
      .from(developerSkills)
      .innerJoin(skills, eq(developerSkills.skillId, skills.id))
      .innerJoin(profiles, eq(developerSkills.userId, profiles.id))
      .innerJoin(developerProfiles, eq(developerSkills.userId, developerProfiles.userId))
      .where(
        and(
          inArray(developerSkills.skillId, skillIds),
          eq(profiles.role, 'developer'),
          eq(developerProfiles.approved, 'approved')
        )
      )

    return result
  }

  async getTotalSkillsCount(userId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(developerSkills)
      .where(eq(developerSkills.userId, userId))

    return result[0]?.count || 0
  }

  async findDevelopersForAdmin(filters: AdminDeveloperFilters): Promise<AdminDeveloperData[]> {
    // Build where conditions
    let whereConditions = eq(profiles.role, 'developer')
    
    if (filters.status && filters.status !== 'all') {
      whereConditions = and(
        whereConditions,
        eq(developerProfiles.approved, filters.status)
      )
    }

    const result = await db.select({
      // Profile info
      profileId: profiles.id,
      displayName: profiles.displayName,
      avatarUrl: profiles.avatarUrl,
      timezone: profiles.timezone,
      profileCreatedAt: profiles.createdAt,
      
      // Developer profile info
      headline: developerProfiles.headline,
      bio: developerProfiles.bio,
      rate: developerProfiles.rate,
      availability: developerProfiles.availability,
      approved: developerProfiles.approved,
      portfolioUrl: developerProfiles.portfolioUrl,
      githubUrl: developerProfiles.githubUrl,
      websiteUrl: developerProfiles.websiteUrl,
      country: developerProfiles.country,
    })
      .from(profiles)
      .innerJoin(developerProfiles, eq(profiles.id, developerProfiles.userId))
      .where(whereConditions)
      .orderBy(desc(profiles.createdAt))
      .limit(filters.limit || 10)
      .offset(filters.offset || 0)

    return result
  }

  async getTotalDevelopersCount(filters: AdminDeveloperFilters): Promise<number> {
    // Build where conditions (same as above)
    let whereConditions = eq(profiles.role, 'developer')
    
    if (filters.status && filters.status !== 'all') {
      whereConditions = and(
        whereConditions,
        eq(developerProfiles.approved, filters.status)
      )
    }

    const [totalResult] = await db.select({ count: count() })
      .from(profiles)
      .innerJoin(developerProfiles, eq(profiles.id, developerProfiles.userId))
      .where(whereConditions)

    return totalResult.count
  }

  async updateApprovalStatus(userId: string, status: 'approved' | 'rejected' | 'pending'): Promise<DeveloperProfile> {
    const [updatedDeveloper] = await db.update(developerProfiles)
      .set({ approved: status })
      .where(eq(developerProfiles.userId, userId))
      .returning()

    if (!updatedDeveloper) {
      throw new Error('Developer not found')
    }

    return updatedDeveloper
  }

  async findDevelopersForCompanyMatch(skillIds: number[]): Promise<DeveloperSmartMatchData[]> {
    const result = await db.select({
      developer: {
        id: profiles.id,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
        createdAt: profiles.createdAt,
      },
      profile: {
        headline: developerProfiles.headline,
        bio: developerProfiles.bio,
        rate: developerProfiles.rate,
        availability: developerProfiles.availability,
        country: developerProfiles.country,
        portfolioUrl: developerProfiles.portfolioUrl,
        githubUrl: developerProfiles.githubUrl,
      },
      skill: {
        id: skills.id,
        label: skills.label,
        slug: skills.slug
      },
      skillLevel: developerSkills.level
    })
      .from(profiles)
      .innerJoin(developerProfiles, eq(profiles.id, developerProfiles.userId))
      .innerJoin(developerSkills, eq(profiles.id, developerSkills.userId))
      .innerJoin(skills, eq(developerSkills.skillId, skills.id))
      .where(
        and(
          eq(profiles.role, 'developer'),
          eq(developerProfiles.approved, 'approved'),
          inArray(developerSkills.skillId, skillIds)
        )
      )

    return result
  }

}

class NeonSeekerProfileRepository implements ISeekerProfileRepository {
  async findByUserId(userId: string): Promise<SeekerProfile | null> {
    const result = await db.select()
      .from(seekerProfiles)
      .where(eq(seekerProfiles.userId, userId))
      .limit(1)
    
    return result[0] || null
  }

  async create(data: CreateSeekerProfileData): Promise<SeekerProfile> {
    const result = await db.insert(seekerProfiles)
      .values(data)
      .returning()
    
    return result[0]
  }

  async update(userId: string, data: UpdateSeekerProfileData): Promise<SeekerProfile> {
    const result = await db.update(seekerProfiles)
      .set(data)
      .where(eq(seekerProfiles.userId, userId))
      .returning()
    
    return result[0]
  }

  async upsert(userId: string, data: CreateSeekerProfileData): Promise<SeekerProfile> {
    const existing = await this.findByUserId(userId)
    
    if (existing) {
      return await this.update(userId, data)
    } else {
      return await this.create(data)
    }
  }

  async delete(userId: string): Promise<void> {
    await db.delete(seekerProfiles).where(eq(seekerProfiles.userId, userId))
  }
}

class NeonSkillRepository implements ISkillRepository {
  async findById(id: number): Promise<Skill | null> {
    const result = await db.select()
      .from(skills)
      .where(eq(skills.id, id))
      .limit(1)
    
    return result[0] || null
  }

  async findAll(): Promise<Skill[]> {
    return await db.select().from(skills)
  }

  async findBySlug(slug: string): Promise<Skill | null> {
    const result = await db.select()
      .from(skills)
      .where(eq(skills.slug, slug))
      .limit(1)
    
    return result[0] || null
  }

  async create(data: CreateSkillData): Promise<Skill> {
    const result = await db.insert(skills)
      .values(data)
      .returning()
    
    return result[0]
  }

  async update(id: number, data: UpdateSkillData): Promise<Skill> {
    const result = await db.update(skills)
      .set(data)
      .where(eq(skills.id, id))
      .returning()
    
    return result[0]
  }

  async delete(id: number): Promise<void> {
    await db.delete(skills).where(eq(skills.id, id))
  }

  async findOrCreateByLabel(label: string): Promise<Skill> {
    const existing = await db.select()
      .from(skills)
      .where(eq(skills.label, label.trim()))
      .limit(1)

    if (existing.length > 0) {
      return existing[0]
    }

    const result = await db.insert(skills)
      .values({
        label: label.trim(),
        slug: label.trim().toLowerCase().replace(/[^a-z0-9]/g, '-')
      })
      .returning()

    return result[0]
  }
}

class NeonDeveloperSkillRepository implements IDeveloperSkillRepository {
  async findByUserId(userId: string): Promise<DeveloperSkillWithDetails[]> {
    const result = await db.select({
      skill: skills,
      level: developerSkills.level
    })
      .from(developerSkills)
      .innerJoin(skills, eq(developerSkills.skillId, skills.id))
      .where(eq(developerSkills.userId, userId))

    return result
  }

  async addSkillToUser(userId: string, skillId: number, level: string): Promise<DeveloperSkill> {
    const result = await db.insert(developerSkills)
      .values({ userId, skillId, level: level as any })
      .returning()
    
    return result[0]
  }

  async removeSkillFromUser(userId: string, skillId: number): Promise<void> {
    await db.delete(developerSkills)
      .where(and(
        eq(developerSkills.userId, userId),
        eq(developerSkills.skillId, skillId)
      ))
  }

  async updateSkillLevel(userId: string, skillId: number, level: string): Promise<DeveloperSkill> {
    const result = await db.update(developerSkills)
      .set({ level: level as any })
      .where(and(
        eq(developerSkills.userId, userId),
        eq(developerSkills.skillId, skillId)
      ))
      .returning()
    
    return result[0]
  }

  async removeAllForUser(userId: string): Promise<void> {
    await db.delete(developerSkills)
      .where(eq(developerSkills.userId, userId))
  }

  async replaceAllForUser(
    userId: string, 
    skillsData: Array<{skillId: number, level: string}>
  ): Promise<void> {
    // Remove all existing skills
    await this.removeAllForUser(userId)

    // Add new skills
    for (const skillData of skillsData) {
      try {
        // Verify skill exists
        const skill = await db.select()
          .from(skills)
          .where(eq(skills.id, skillData.skillId))
          .limit(1)

        if (skill.length > 0) {
          await this.addSkillToUser(userId, skillData.skillId, skillData.level)
        } else {
          console.warn(`Skill with ID ${skillData.skillId} not found, skipping`)
        }
      } catch (skillError) {
        console.error(`Error processing skill ${skillData.skillId}:`, skillError)
      }
    }
  }

  async findSkillsForDevelopers(userIds: string[]): Promise<Map<string, Array<{skillId: number, skillSlug: string, skillLabel: string, level: string}>>> {
    const result = await db.select({
      userId: developerSkills.userId,
      skillId: skills.id,
      skillSlug: skills.slug,
      skillLabel: skills.label,
      level: developerSkills.level,
    })
      .from(developerSkills)
      .innerJoin(skills, eq(developerSkills.skillId, skills.id))
      .where(inArray(developerSkills.userId, userIds))

    // Group by userId
    const skillsByUser = new Map<string, Array<{skillId: number, skillSlug: string, skillLabel: string, level: string}>>()
    
    for (const skill of result) {
      if (!skillsByUser.has(skill.userId)) {
        skillsByUser.set(skill.userId, [])
      }
      skillsByUser.get(skill.userId)!.push({
        skillId: skill.skillId,
        skillSlug: skill.skillSlug,
        skillLabel: skill.skillLabel,
        level: skill.level
      })
    }

    return skillsByUser
  }

  async findSkillsWithDetailsForDeveloper(developerId: string): Promise<DeveloperSkillWithDetails[]> {
    const result = await db.select({
      skill: skills,
      level: developerSkills.level,
      skillId: developerSkills.skillId
    })
      .from(developerSkills)
      .innerJoin(skills, eq(developerSkills.skillId, skills.id))
      .where(eq(developerSkills.userId, developerId))

    return result.map(r => ({
      skill: r.skill,
      level: r.level
    }))
  }
}

class NeonCompanyProfileRepository implements ICompanyProfileRepository {
  async findByUserId(userId: string): Promise<CompanyProfile | null> {
    const result = await db.select()
      .from(companyProfiles)
      .where(eq(companyProfiles.userId, userId))
      .limit(1)
    
    return result[0] || null
  }

  async create(data: CreateCompanyProfileData): Promise<CompanyProfile> {
    const result = await db.insert(companyProfiles)
      .values(data)
      .returning()
    
    return result[0]
  }

  async update(userId: string, data: UpdateCompanyProfileData): Promise<CompanyProfile> {
    const result = await db.update(companyProfiles)
      .set(data)
      .where(eq(companyProfiles.userId, userId))
      .returning()
    
    return result[0]
  }

  async upsert(userId: string, data: CreateCompanyProfileData): Promise<CompanyProfile> {
    const existing = await this.findByUserId(userId)
    
    if (existing) {
      return await this.update(userId, data)
    } else {
      return await this.create(data)
    }
  }

  async delete(userId: string): Promise<void> {
    await db.delete(companyProfiles).where(eq(companyProfiles.userId, userId))
  }

  async findMatchingCompanies(skillIds: number[]): Promise<CompanyMatchData[]> {
    const result = await db.select({
      userId: companySkills.userId,
      skillId: companySkills.skillId,
      skillLabel: skills.label,
      skillImportance: companySkills.importance,
      displayName: profiles.displayName,
      avatarUrl: profiles.avatarUrl,
      companyName: companyProfiles.companyName,
      about: companyProfiles.about,
      actualTeamSize: companyProfiles.actualTeamSize,
      hourlyRateMin: companyProfiles.hourlyRateMin,
      hourlyRateMax: companyProfiles.hourlyRateMax,
      currentCapacity: companyProfiles.currentCapacity,
      maxProjects: companyProfiles.maxProjects,
    })
      .from(companySkills)
      .innerJoin(skills, eq(companySkills.skillId, skills.id))
      .innerJoin(profiles, eq(companySkills.userId, profiles.id))
      .innerJoin(companyProfiles, eq(companySkills.userId, companyProfiles.userId))
      .where(
        and(
          inArray(companySkills.skillId, skillIds),
          eq(profiles.role, 'company')
        )
      )

    return result
  }

  async getTotalSkillsCount(userId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(companySkills)
      .where(eq(companySkills.userId, userId))

    return result[0]?.count || 0
  }
}

class NeonCompanySkillRepository implements ICompanySkillRepository {
  async findByUserId(userId: string): Promise<CompanySkillWithDetails[]> {
    const result = await db.select({
      skill: skills,
      importance: companySkills.importance
    })
      .from(companySkills)
      .innerJoin(skills, eq(companySkills.skillId, skills.id))
      .where(eq(companySkills.userId, userId))

    return result
  }

  async addSkillToUser(userId: string, skillId: number, importance: string): Promise<CompanySkill> {
    const result = await db.insert(companySkills)
      .values({ 
        userId, 
        skillId, 
        importance: importance as any,
        createdAt: new Date()
      })
      .returning()
    
    return result[0]
  }

  async removeAllForUser(userId: string): Promise<void> {
    await db.delete(companySkills)
      .where(eq(companySkills.userId, userId))
  }

  async replaceAllForUser(
    userId: string, 
    skillsData: Array<{label: string, importance: string}>
  ): Promise<void> {
    // Remove all existing skills
    await this.removeAllForUser(userId)

    // Add new skills
    for (const skillData of skillsData) {
      try {
        // Find or create skill
        let skill = await db.select()
          .from(skills)
          .where(eq(skills.label, skillData.label.trim()))
          .limit(1)

        let skillId: number

        if (skill.length > 0) {
          skillId = skill[0].id
        } else {
          const newSkill = await db.insert(skills)
            .values({
              label: skillData.label.trim(),
              slug: skillData.label.trim().toLowerCase().replace(/[^a-z0-9]/g, '-')
            })
            .returning({ id: skills.id })

          skillId = newSkill[0].id
        }

        // Add skill to user
        await this.addSkillToUser(userId, skillId, skillData.importance)
      } catch (skillError) {
        console.error(`Error processing skill ${skillData.label}:`, skillError)
      }
    }
  }

  async findSkillsWithDetailsForCompany(companyId: string): Promise<CompanySkillWithImportance[]> {
    const result = await db.select({
      skillId: companySkills.skillId,
      importance: companySkills.importance,
      skill: skills
    })
      .from(companySkills)
      .innerJoin(skills, eq(companySkills.skillId, skills.id))
      .where(eq(companySkills.userId, companyId))

    return result
  }

  async findCompaniesWithMatchingSkills(skillIds: number[]): Promise<CompanySmartMatchData[]> {
    const result = await db.select({
      company: {
        id: profiles.id,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
        createdAt: profiles.createdAt,
      },
      companyProfile: {
        companyName: companyProfiles.companyName,
        logoUrl: companyProfiles.logoUrl,
        about: companyProfiles.about,
        industry: companyProfiles.industry,
        size: companyProfiles.size,
        workStyle: companyProfiles.workStyle,
        experienceLevel: companyProfiles.experienceLevel,
      },
      skill: {
        id: skills.id,
        label: skills.label,
        slug: skills.slug
      },
      skillImportance: companySkills.importance
    })
      .from(profiles)
      .innerJoin(companyProfiles, eq(profiles.id, companyProfiles.userId))
      .innerJoin(companySkills, eq(profiles.id, companySkills.userId))
      .innerJoin(skills, eq(companySkills.skillId, skills.id))
      .where(
        and(
          eq(profiles.role, 'company'),
          inArray(companySkills.skillId, skillIds)
        )
      )

    return result
  }
}

class NeonAdminStatsRepository implements IAdminStatsRepository {
  async getTotalUsersCount(): Promise<number> {
    // Since users are managed by Clerk, we'll count profiles instead
    const [result] = await db.select({ count: count() }).from(profiles)
    return result?.count || 0
  }

  async getPendingDevelopersCount(): Promise<number> {
    const [result] = await db.select({ count: count() })
      .from(profiles)
      .innerJoin(developerProfiles, eq(profiles.id, developerProfiles.userId))
      .where(
        and(
          eq(profiles.role, 'developer'),
          eq(developerProfiles.approved, 'pending')
        )
      )
    return result?.count || 0
  }

  async getApprovedDevelopersCount(): Promise<number> {
    const [result] = await db.select({ count: count() })
      .from(profiles)
      .innerJoin(developerProfiles, eq(profiles.id, developerProfiles.userId))
      .where(
        and(
          eq(profiles.role, 'developer'),
          eq(developerProfiles.approved, 'approved')
        )
      )
    return result?.count || 0
  }

  async getRejectedDevelopersCount(): Promise<number> {
    const [result] = await db.select({ count: count() })
      .from(profiles)
      .innerJoin(developerProfiles, eq(profiles.id, developerProfiles.userId))
      .where(
        and(
          eq(profiles.role, 'developer'),
          eq(developerProfiles.approved, 'rejected')
        )
      )
    return result?.count || 0
  }

  async getTotalCompaniesCount(): Promise<number> {
    const [result] = await db.select({ count: count() })
      .from(profiles)
      .innerJoin(companyProfiles, eq(profiles.id, companyProfiles.userId))
      .where(eq(profiles.role, 'company'))
    return result?.count || 0
  }

  async getActiveProjectsCount(): Promise<number> {
    const [result] = await db.select({ count: count() })
      .from(projects)
      .where(
        or(
          eq(projects.status, 'open'),
          eq(projects.status, 'in_progress')
        )
      )
    return result?.count || 0
  }

  async getTotalProjectsCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(projects)
    return result?.count || 0
  }

  async getClosedProjectsCount(): Promise<number> {
    const [result] = await db.select({ count: count() })
      .from(projects)
      .where(eq(projects.status, 'closed'))
    return result?.count || 0
  }

  async getActiveSubscriptionsCount(): Promise<number> {
    const [result] = await db.select({ count: count() })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.status, 'active'),
          gte(subscriptions.currentPeriodEnd, new Date())
        )
      )
    return result?.count || 0
  }

  async getRecentSignupsCount(days: number = 30): Promise<number> {
    // Count recent profiles since users are managed by Clerk
    const [result] = await db.select({ count: count() })
      .from(profiles)
      .where(
        gte(profiles.createdAt, sql`NOW() - INTERVAL '${sql.raw(days.toString())} days'`)
      )
    return result?.count || 0
  }

  async getDeveloperStatsByStatus(): Promise<DeveloperStatusStats> {
    const [pending, approved, rejected, total] = await Promise.all([
      this.getPendingDevelopersCount(),
      this.getApprovedDevelopersCount(),
      this.getRejectedDevelopersCount(),
      db.select({ count: count() })
        .from(profiles)
        .where(eq(profiles.role, 'developer'))
        .then(result => result[0]?.count || 0)
    ])

    return { pending, approved, rejected, total }
  }

  async getProjectStatsByStatus(): Promise<ProjectStatusStats> {
    const [open, in_progress, closed, total] = await Promise.all([
      db.select({ count: count() })
        .from(projects)
        .where(eq(projects.status, 'open'))
        .then(result => result[0]?.count || 0),
      db.select({ count: count() })
        .from(projects)
        .where(eq(projects.status, 'in_progress'))
        .then(result => result[0]?.count || 0),
      this.getClosedProjectsCount(),
      this.getTotalProjectsCount()
    ])

    return { open, in_progress, closed, total }
  }

  async getAdminDashboardStats(): Promise<AdminDashboardStats> {
    const [
      totalUsers,
      developerStats,
      totalCompanies,
      projectStats,
      activeSubscriptions,
      recentSignups
    ] = await Promise.all([
      this.getTotalUsersCount(),
      this.getDeveloperStatsByStatus(),
      this.getTotalCompaniesCount(),
      this.getProjectStatsByStatus(),
      this.getActiveSubscriptionsCount(),
      this.getRecentSignupsCount(30)
    ])

    // Calculate estimated revenue (adjust based on your pricing model)
    const estimatedMonthlyRevenue = activeSubscriptions * 29 // $29 average per subscription

    // Calculate approval rate
    const totalDeveloperApplications = developerStats.approved + developerStats.rejected + developerStats.pending
    const developerApprovalRate = totalDeveloperApplications > 0 
      ? Math.round((developerStats.approved / totalDeveloperApplications) * 100)
      : 0

    // Calculate project completion rate
    const projectCompletionRate = projectStats.total > 0 
      ? Math.round((projectStats.closed / projectStats.total) * 100)
      : 0

    return {
      totalUsers,
      totalDevelopers: developerStats.total,
      pendingDevelopers: developerStats.pending,
      approvedDevelopers: developerStats.approved,
      rejectedDevelopers: developerStats.rejected,
      totalCompanies,
      totalProjects: projectStats.total,
      activeProjects: projectStats.open + projectStats.in_progress,
      closedProjects: projectStats.closed,
      activeSubscriptions,
      recentSignups,
      estimatedMonthlyRevenue,
      developerApprovalRate,
      projectCompletionRate
    }
  }
}

export class NeonDatabaseProvider implements IDatabaseProvider {
  users = new NeonUserRepository()
  profiles = new NeonProfileRepository()
  projects = new NeonProjectRepository()
  subscriptions = new NeonSubscriptionRepository()
  notifications = new NeonNotificationRepository()
  applications = new NeonApplicationRepository()
  developerContacts = new NeonDeveloperContactRepository()
  developerProfiles = new NeonDeveloperProfileRepository()
  seekerProfiles = new NeonSeekerProfileRepository()
  skills = new NeonSkillRepository()
  developerSkills = new NeonDeveloperSkillRepository()
  companySkills = new NeonCompanySkillRepository()
  adminStats = new NeonAdminStatsRepository()

  async getCompanyDashboardData(companyId: string): Promise<CompanyDashboardData> {
    // Get company projects
    const projects = await this.projects.findProjectsByCompanyId(companyId, 10)
    
    const projectIds = projects.map(p => p.id)

    // Get all dashboard data in parallel
    const [applicationStats, recentApplications, subscription] = await Promise.all([
      this.applications.getApplicationStatsByProjectIds(projectIds),
      this.applications.getRecentApplicationsForCompany(companyId, 10),
      this.subscriptions.findByUserId(companyId)
    ])

    // Calculate aggregate stats
    const totalProjects = projects.length
    const activeProjects = projects.filter(p => p.status === 'open').length
    const totalApplications = applicationStats.reduce((sum, stat) => sum + stat.count, 0)
    const pendingApplications = applicationStats
      .filter(stat => stat.status === 'pending')
      .reduce((sum, stat) => sum + stat.count, 0)

    return {
      projects,
      recentApplications,
      subscription,
      stats: {
        totalProjects,
        activeProjects,
        totalApplications,
        pendingApplications
      }
    }
  }

  async getCompanyProjectsData(companyId: string): Promise<CompanyProjectsData> {
    // Get all company projects
    const projects = await this.projects.findAllProjectsByCompanyId(companyId)
    
    const projectIds = projects.map(p => p.id)
    
    // Get all applications for these projects
    const applications = await this.applications.findApplicationsForProjects(projectIds)

    // Group applications by project and calculate counts
    const projectsWithApplications: CompanyProjectWithApplications[] = projects.map(project => {
      const projectApplications = applications.filter(app => app.projectId === project.id)
      
      return {
        ...project,
        applications: projectApplications,
        applicationCount: projectApplications.length,
        pendingCount: projectApplications.filter(app => app.status === 'pending').length,
      }
    })

    return {
      projects: projectsWithApplications
    }
  }

  async getDeveloperPageData(developerId: string, currentUserId: string): Promise<DeveloperPageData | null> {
    const developer = await this.profiles.findDeveloperWithFullDetails(developerId)
    
    if (!developer) {
      return null
    }

    return {
      developer,
      isOwner: currentUserId === developerId
    }
  }

  async transaction<T>(fn: (tx: IDatabaseProvider) => Promise<T>): Promise<T> {
    return await db.transaction(async (tx) => {
      // Create a transaction version of this provider
      // For now, return the same instance, but you could create a transaction-specific one
      return await fn(this)
    })
  }
}
