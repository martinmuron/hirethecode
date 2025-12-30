export interface IDatabaseProvider {
  // User operations
  users: IUserRepository
  profiles: IProfileRepository
  projects: IProjectRepository
  subscriptions: ISubscriptionRepository
  notifications: INotificationRepository
  applications: IApplicationRepository
  developerContacts: IDeveloperContactRepository
  developerProfiles: IDeveloperProfileRepository
  seekerProfiles: ISeekerProfileRepository
  skills: ISkillRepository
  developerSkills: IDeveloperSkillRepository
  companySkills: ICompanySkillRepository
  adminStats: IAdminStatsRepository

  getCompanyDashboardData(companyId: string): Promise<CompanyDashboardData>
  getCompanyProjectsData(companyId: string): Promise<CompanyProjectsData>
  getDeveloperPageData(developerId: string, currentUserId: string): Promise<DeveloperPageData | null>
  
  // Transaction support
  transaction<T>(fn: (tx: IDatabaseProvider) => Promise<T>): Promise<T>
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  create(data: CreateUserData): Promise<User>
  update(id: string, data: UpdateUserData): Promise<User>
  delete(id: string): Promise<void>
}

export interface IProfileRepository {
  findById(id: string): Promise<Profile | null>
  findByUserId(userId: string): Promise<Profile | null>
  create(data: CreateProfileData): Promise<Profile>
  update(id: string, data: UpdateProfileData): Promise<Profile>
  upsert(userId: string, data: CreateDeveloperProfileData): Promise<DeveloperProfile>
  delete(id: string): Promise<void>
  findByRole(role: string): Promise<Profile[]>
  findDeveloperWithFullDetails(developerId: string): Promise<DeveloperFullProfile | null>
}

export interface IProjectRepository {
  findById(id: string): Promise<Project | null>
  findBySeekerId(seekerId: string): Promise<Project[]>
  findByStatus(status: string): Promise<Project[]>
  create(data: CreateProjectData): Promise<Project>
  update(id: string, data: UpdateProjectData): Promise<Project>
  delete(id: string): Promise<void>
  search(filters: ProjectFilters): Promise<Project[]>
  findProjectSkills(projectId: string): Promise<ProjectSkillWithDetails[]>
  findSmartMatchCandidates(requiredSkillIds: number[]): Promise<DeveloperMatchCandidate[]>
  findOpenProjectsWithSeekers(): Promise<ProjectWithSeekerData[]>
  findSkillsForProjects(projectIds: string[]): Promise<ProjectSkillsBulkData[]>
  findProjectsByCompanyId(companyId: string, limit?: number): Promise<CompanyDashboardProject[]>
  findAllProjectsByCompanyId(companyId: string): Promise<CompanyProjectWithDetails[]>
  findOpenProjectsCountBySeekerId(seekerId: string): Promise<int>
}

export interface ISeekerProfileRepository {
  findByUserId(userId: string): Promise<SeekerProfile | null>
  create(data: CreateSeekerProfileData): Promise<SeekerProfile>
  update(userId: string, data: UpdateSeekerProfileData): Promise<SeekerProfile>
  upsert(userId: string, data: CreateSeekerProfileData): Promise<SeekerProfile>
  delete(userId: string): Promise<void>
}

export interface ISubscriptionRepository {
  findByUserId(userId: string): Promise<Subscription | null>
  create(data: CreateSubscriptionData): Promise<Subscription>
  update(id: string, data: UpdateSubscriptionData): Promise<Subscription>
  delete(id: string): Promise<void>
}

export interface INotificationRepository {
  findByUserId(userId: string): Promise<Notification[]>
  findUnreadByUserId(userId: string): Promise<Notification[]>
  findUnreadCountByUserId(userId: string): Promise<int>
  create(data: CreateNotificationData): Promise<Notification>
  markAsRead(id: string): Promise<void>
  markAllAsRead(userId: string): Promise<void>
  delete(id: string): Promise<void>
}

export interface IApplicationRepository {
  findById(id: string): Promise<ProjectApplication | null>
  findByProjectId(projectId: string): Promise<ProjectApplication[]>
  findByDeveloperId(developerId: string): Promise<ProjectApplication[]>
  findByCompanyId(companyId: string): Promise<ProjectApplication[]>
  create(data: CreateApplicationData): Promise<ProjectApplication>
  update(id: string, data: UpdateApplicationData): Promise<ProjectApplication>
  delete(id: string): Promise<void>
  updateStatus(id: string, status: 'pending' | 'accepted' | 'rejected'): Promise<void>
  // Complex query for the applications/status route
  findApplicationWithDetails(applicationId: string): Promise<ApplicationWithDetails | null>
  findByProjectAndUser(projectId: string, userId: string): Promise<ProjectApplication | null>
  findApplicationsWithApplicantDetails(projectId: string): Promise<ApplicationWithApplicantDetails[]>
  getApplicationStatsByProjectIds(projectIds: string[]): Promise<ApplicationStats[]>
  getRecentApplicationsForCompany(companyId: string, limit?: number): Promise<CompanyApplicationWithDetails[]>
  findApplicationsForProjects(projectIds: string[]): Promise<ProjectApplicationWithDeveloper[]>
}

export interface ApplicationWithApplicantDetails {
  application: ProjectApplication
  applicant: {
    id: string
    displayName?: string
    avatarUrl?: string
    role: string
  }
}

export interface IDeveloperContactRepository {
  findById(id: string): Promise<DeveloperContact | null>
  findByCompanyId(companyId: string): Promise<DeveloperContact[]>
  findByDeveloperId(developerId: string): Promise<DeveloperContact[]>
  create(data: CreateDeveloperContactData): Promise<DeveloperContact>
  update(id: string, data: UpdateDeveloperContactData): Promise<DeveloperContact>
  delete(id: string): Promise<void>
  updateStatus(id: string, status: 'sent' | 'read' | 'replied'): Promise<void>
  findContactsBetween(companyId: string, developerId: string): Promise<DeveloperContact[]>
}

export interface IDeveloperProfileRepository {
  findByUserId(userId: string): Promise<DeveloperProfile | null>
  create(data: CreateDeveloperProfileData): Promise<DeveloperProfile>
  update(userId: string, data: UpdateDeveloperProfileData): Promise<DeveloperProfile>
  delete(userId: string): Promise<void>
  findApprovedDevelopers(filters: DeveloperFilters): Promise<DeveloperSearchResult[]>
  findMatchingDevelopers(skillIds: number[]): Promise<DeveloperMatchData[]>
  getTotalSkillsCount(userId: string): Promise<number>
  findDevelopersForAdmin(filters: AdminDeveloperFilters): Promise<AdminDeveloperData[]>
  getTotalDevelopersCount(filters: AdminDeveloperFilters): Promise<number>
  updateApprovalStatus(userId: string, status: 'approved' | 'rejected' | 'pending'): Promise<DeveloperProfile>
  findDevelopersForCompanyMatch(skillIds: number[]): Promise<DeveloperSmartMatchData[]>
}

export interface ISkillRepository {
  findById(id: number): Promise<Skill | null>
  findAll(): Promise<Skill[]>
  findBySlug(slug: string): Promise<Skill | null>
  create(data: CreateSkillData): Promise<Skill>
  update(id: number, data: UpdateSkillData): Promise<Skill>
  delete(id: number): Promise<void>
}

export interface IDeveloperSkillRepository {
  findByUserId(userId: string): Promise<DeveloperSkillWithDetails[]>
  addSkillToUser(userId: string, skillId: number, level: string): Promise<DeveloperSkill>
  removeSkillFromUser(userId: string, skillId: number): Promise<void>
  updateSkillLevel(userId: string, skillId: number, level: string): Promise<DeveloperSkill>
  removeAllForUser(userId: string): Promise<void>
  replaceAllForUser(userId: string, skills: Array<{skillId: number, level: string}>): Promise<void>
  findSkillsWithDetailsForDeveloper(developerId: string): Promise<DeveloperSkillWithDetails[]>
}

export interface ICompanyProfileRepository {
  findByUserId(userId: string): Promise<CompanyProfile | null>
  create(data: CreateCompanyProfileData): Promise<CompanyProfile>
  update(userId: string, data: UpdateCompanyProfileData): Promise<CompanyProfile>
  upsert(userId: string, data: CreateCompanyProfileData): Promise<CompanyProfile>
  delete(userId: string): Promise<void>
  findMatchingCompanies(skillIds: number[]): Promise<CompanyMatchData[]>
  getTotalSkillsCount(userId: string): Promise<number>
}

export interface ICompanySkillRepository {
  findByUserId(userId: string): Promise<CompanySkillWithDetails[]>
  replaceAllForUser(userId: string, skills: Array<{label: string, importance: string}>): Promise<void>
  addSkillToUser(userId: string, skillId: number, importance: string): Promise<CompanySkill>
  removeAllForUser(userId: string): Promise<void>
  findSkillsWithDetailsForCompany(companyId: string): Promise<CompanySkillWithImportance[]>
  findCompaniesWithMatchingSkills(skillIds: number[]): Promise<CompanySmartMatchData[]>
}

export interface IAdminStatsRepository {
  getTotalUsersCount(): Promise<number>
  getPendingDevelopersCount(): Promise<number>
  getApprovedDevelopersCount(): Promise<number>
  getRejectedDevelopersCount(): Promise<number>
  getTotalCompaniesCount(): Promise<number>
  getActiveProjectsCount(): Promise<number>
  getTotalProjectsCount(): Promise<number>
  getClosedProjectsCount(): Promise<number>
  getActiveSubscriptionsCount(): Promise<number>
  getRecentSignupsCount(days?: number): Promise<number>
  getDeveloperStatsByStatus(): Promise<DeveloperStatusStats>
  getProjectStatsByStatus(): Promise<ProjectStatusStats>
  getAdminDashboardStats(): Promise<AdminDashboardStats>
}


// Data types
export interface User {
  id: string
  email: string
  name?: string
  image?: string
  createdAt: Date
}

export interface Profile {
  id: string
  role: 'developer' | 'company' | 'seeker' | 'admin'
  displayName?: string
  avatarUrl?: string
  timezone?: string
  createdAt: Date
}

export interface Project {
  id: string
  seekerId: string
  title: string
  description: string
  budgetMin?: number
  budgetMax?: number
  currency: string
  timeline?: string
  status: 'open' | 'in_progress' | 'closed'
  createdAt: Date
  updatedAt: Date
}

export interface Subscription {
  id: string
  userId: string
  stripeCustomerId: string
  productTier: string
  status: string
  currentPeriodEnd: Date
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: string
  isRead: boolean
  data?: any
  createdAt: Date
}

export interface ProjectApplication {
  id: string
  projectId: string
  developerId: string
  message: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: Date
}

export interface ApplicationWithDetails {
  id: string
  projectId: string
  developerId: string
  companyId: string
  projectTitle: string
  companyName: string
  companyProfileName?: string
}

export interface DeveloperContact {
  id: string
  companyId: string
  developerId: string
  message: string
  status: 'sent' | 'read' | 'replied'
  createdAt: Date
}

export interface DeveloperProfile {
  userId: string
  headline?: string
  bio?: string
  rate?: number
  availability: 'available' | 'busy' | 'unavailable'
  approved: 'approved' | 'pending' | 'rejected'
  portfolioUrl?: string
  githubUrl?: string
  websiteUrl?: string
  country?: string
}

export interface Skill {
  id: number
  slug: string
  label: string
}

export interface DeveloperSkill {
  userId: string
  skillId: number
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

export interface DeveloperSkillWithDetails {
  skill: Skill
  level: string
}

export interface DeveloperSearchResult {
  id: string
  displayName?: string
  avatarUrl?: string
  headline?: string
  bio?: string
  rate?: number
  availability: 'available' | 'busy' | 'unavailable'
  portfolioUrl?: string
  githubUrl?: string
  websiteUrl?: string
  country?: string
  skills: DeveloperSkillWithDetails[]
}

export interface CompanyProfile {
  userId: string
  companyName: string
  logoUrl?: string
  about?: string
  websiteUrl?: string
  industry?: string
  size?: string
  experienceLevel?: 'junior' | 'mid' | 'senior' | 'lead' | 'any'
  workStyle?: 'remote' | 'hybrid' | 'onsite' | 'flexible'
  workEnvironment?: string
  benefits?: string
  teamSize?: string
  growth?: string
  actualTeamSize?: number
  hourlyRateMin?: number
  hourlyRateMax?: number
  currentCapacity?: number
  maxProjects?: number
}

export interface CompanySkill {
  userId: string
  skillId: number
  importance: 'nice_to_have' | 'preferred' | 'required'
  createdAt: Date
}

export interface CompanySkillWithDetails {
  skill: Skill
  importance: string
}

export interface ProjectSkillWithDetails {
  skillId: number
  skill: Skill
}

export interface DeveloperMatchCandidate {
  developer: {
    id: string
    displayName?: string
    avatarUrl?: string
    createdAt: Date
  }
  profile: {
    headline?: string
    bio?: string
    rate?: number
    availability: 'available' | 'busy' | 'unavailable'
    country?: string
    portfolioUrl?: string
    githubUrl?: string
  }
  skill: Skill
  skillLevel: string
}

export interface DeveloperMatchData {
  userId: string
  skillId: number
  skillLabel: string
  skillLevel: string
  displayName?: string
  avatarUrl?: string
  headline?: string
  rate?: number
  availability: 'available' | 'busy' | 'unavailable'
  approved: 'approved' | 'pending' | 'rejected'
  country?: string
}

export interface CompanyMatchData {
  userId: string
  skillId: number
  skillLabel: string
  skillImportance: string
  displayName?: string
  avatarUrl?: string
  companyName: string
  about?: string
  actualTeamSize?: number
  hourlyRateMin?: number
  hourlyRateMax?: number
  currentCapacity?: number
  maxProjects?: number
}

export interface SeekerProfile {
  userId: string
  organizationName?: string
  industry?: string
  budgetMin?: number
  budgetMax?: number
  currency?: string
  companySize?: 'individual' | 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
  typicalProjectTypes?: string[]
  createdAt: Date
}

export interface ProjectWithSeekerData {
  projectId: string
  title: string
  description: string
  budgetMin?: number
  budgetMax?: number
  currency: string
  timeline?: string
  locationPref?: string
  status: string
  complexity?: string
  recommendedFor?: string
  createdAt: Date
  seekerId: string
  seekerDisplayName?: string
  seekerAvatarUrl?: string
  organizationName?: string
}

export interface ProjectSkillsBulkData {
  projectId: string
  skillId: number
  skillSlug: string
  skillLabel: string
}

export interface AdminDeveloperFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'all'
  page?: number
  limit?: number
  offset?: number
}

export interface AdminDeveloperData {
  profileId: string
  displayName?: string
  avatarUrl?: string
  timezone?: string
  profileCreatedAt: Date
  headline?: string
  bio?: string
  rate?: number
  availability: 'available' | 'busy' | 'unavailable'
  approved: 'approved' | 'pending' | 'rejected'
  portfolioUrl?: string
  githubUrl?: string
  websiteUrl?: string
  country?: string
}

export interface AdminDeveloperWithSkills extends AdminDeveloperData {
  skills: Array<{
    skillId: number
    skillSlug: string
    skillLabel: string
    level: string
  }>
}

export interface DeveloperStatusStats {
  pending: number
  approved: number
  rejected: number
  total: number
}

export interface ProjectStatusStats {
  open: number
  in_progress: number
  closed: number
  total: number
}

export interface AdminDashboardStats {
  totalUsers: number
  totalDevelopers: number
  pendingDevelopers: number
  approvedDevelopers: number
  rejectedDevelopers: number
  totalCompanies: number
  totalProjects: number
  activeProjects: number
  closedProjects: number
  activeSubscriptions: number
  recentSignups: number
  estimatedMonthlyRevenue: number
  developerApprovalRate: number
  projectCompletionRate: number
}

export interface CompanySkillWithImportance {
  skillId: number
  importance: 'nice_to_have' | 'preferred' | 'required'
  skill: Skill
}

export interface DeveloperSmartMatchData {
  developer: {
    id: string
    displayName?: string
    avatarUrl?: string
    createdAt: Date
  }
  profile: {
    headline?: string
    bio?: string
    rate?: number
    availability: 'available' | 'busy' | 'unavailable'
    country?: string
    portfolioUrl?: string
    githubUrl?: string
  }
  skill: Skill
  skillLevel: string
}

export interface CompanySmartMatchData {
  company: {
    id: string
    displayName?: string
    avatarUrl?: string
    createdAt: Date
  }
  companyProfile: {
    companyName: string
    logoUrl?: string
    about?: string
    industry?: string
    size?: string
    workStyle?: 'remote' | 'hybrid' | 'onsite' | 'flexible'
    experienceLevel?: 'junior' | 'mid' | 'senior' | 'lead' | 'any'
  }
  skill: Skill
  skillImportance: string
}

export interface CompanyDashboardProject {
  id: string
  title: string
  description: string
  status: string
  createdAt: Date
}

export interface ApplicationStats {
  projectId: string
  status: string
  count: number
}

export interface CompanyApplicationWithDetails {
  id: string
  projectId: string
  projectTitle: string
  status: string
  createdAt: Date
  developer: {
    id: string
    displayName?: string
    avatarUrl?: string
  }
  developerProfile: {
    headline?: string
    rate?: number
    availability: string
  }
}

export interface CompanyDashboardData {
  projects: CompanyDashboardProject[]
  recentApplications: CompanyApplicationWithDetails[]
  subscription: Subscription | null
  stats: {
    totalProjects: number
    activeProjects: number
    totalApplications: number
    pendingApplications: number
  }
}

export interface CompanyProjectWithDetails {
  id: string
  title: string
  description: string
  budgetMin?: number
  budgetMax?: number
  currency: string
  timeline?: string
  status: string
  createdAt: Date
}

export interface ProjectApplicationWithDeveloper {
  id: string
  projectId: string
  message: string
  status: string
  createdAt: Date
  developer: {
    id: string
    displayName?: string
    avatarUrl?: string
    email?: string
  }
  developerProfile: {
    headline?: string
    rate?: number
    availability: string
  }
}

export interface CompanyProjectWithApplications extends CompanyProjectWithDetails {
  applications: ProjectApplicationWithDeveloper[]
  applicationCount: number
  pendingCount: number
}

export interface CompanyProjectsData {
  projects: CompanyProjectWithApplications[]
}

export interface DeveloperFullProfile {
  profile: Profile
  developerProfile: DeveloperProfile | null
  skills: Array<{
    id: number
    slug: string
    label: string
    level: string
  }>
}

export interface DeveloperPageData {
  developer: DeveloperFullProfile
  isOwner: boolean
}

// Create/Update data types
export type CreateUserData = Omit<User, 'id' | 'createdAt'>
export type UpdateUserData = Partial<CreateUserData>
export type CreateProfileData = Omit<Profile, 'createdAt'>
export type UpdateProfileData = Partial<Omit<Profile, 'id'>>
export type CreateProjectData = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateProjectData = Partial<Omit<Project, 'id' | 'seekerId'>>
export type CreateSubscriptionData = Omit<Subscription, 'id'>
export type UpdateSubscriptionData = Partial<Omit<Subscription, 'id' | 'userId'>>
export type CreateNotificationData = Omit<Notification, 'id' | 'createdAt'>
export type CreateApplicationData = Omit<ProjectApplication, 'id' | 'createdAt'>
export type UpdateApplicationData = Partial<Omit<ProjectApplication, 'id'>>
export type CreateDeveloperContactData = Omit<DeveloperContact, 'id' | 'createdAt'>
export type UpdateDeveloperContactData = Partial<Omit<DeveloperContact, 'id'>>
export type CreateDeveloperProfileData = Omit<DeveloperProfile, 'userId'> & { userId: string }
export type UpdateDeveloperProfileData = Partial<Omit<DeveloperProfile, 'userId'>>
export type CreateSkillData = Omit<Skill, 'id'>
export type UpdateSkillData = Partial<CreateSkillData>
export type CreateCompanyProfileData = CompanyProfile
export type UpdateCompanyProfileData = Partial<Omit<CompanyProfile, 'userId'>>
export type CreateCompanySkillData = Omit<CompanySkill, 'createdAt'>
export type UpdateCompanySkillData = Partial<Omit<CompanySkill, 'userId'>>
export type CreateSeekerProfileData = SeekerProfile
export type UpdateSeekerProfileData = Partial<Omit<SeekerProfile, 'userId'>>

export interface ProjectFilters {
  role?: string
  skills?: string[]
  budgetMin?: number
  budgetMax?: number
  status?: string
  limit?: number
  offset?: number
}

export interface DeveloperFilters {
  availability?: 'available' | 'busy' | 'unavailable' | 'all'
  rateRange?: string
  skill?: string
  sort?: 'recent' | 'rate-low' | 'rate-high' | 'available'
  limit?: number
  offset?: number
}
