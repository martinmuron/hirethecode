import { db } from '@/lib/db'
import { 
  profiles, projects, subscriptions, notifications, projectApplications, companyProfiles, 
  developerContacts, developerProfiles, skills, developerSkills, companySkills, projectSkills,
  seekerProfiles
} from '@/lib/db/schema'
import { eq, and, sql, inArray, gte, lte, desc, asc } from 'drizzle-orm'
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
  ProjectFilters, DeveloperFilters,
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
  seekerProfiles = new NeonSeekerProfileRepository() // Add this line
  skills = new NeonSkillRepository()
  developerSkills = new NeonDeveloperSkillRepository()
  companySkills = new NeonCompanySkillRepository()

  async transaction<T>(fn: (tx: IDatabaseProvider) => Promise<T>): Promise<T> {
    return await db.transaction(async (tx) => {
      // Create a transaction version of this provider
      // For now, return the same instance, but you could create a transaction-specific one
      return await fn(this)
    })
  }
}
