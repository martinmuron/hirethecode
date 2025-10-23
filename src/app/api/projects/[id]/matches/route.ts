import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { 
  projects, 
  projectSkills, 
  skills,
  profiles,
  developerProfiles,
  developerSkills,
  companyProfiles,
  companySkills
} from '@/lib/db/schema'
import { eq, and, inArray, sql } from 'drizzle-orm'

interface MatchResult {
  type: 'developer' | 'company'
  profile: any // Profile data
  matchScore: number
  matchedSkills: string[]
  totalSkills: number
  availabilityStatus?: string
  hourlyRate?: { min?: number; max?: number }
  teamSize?: number
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const projectId = params.id

    // Get project details and verify ownership
    const project = await db.select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1)

    if (!project.length) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Verify user is the project owner (seeker)
    if (project[0].seekerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get project skills
    const projectSkillsData = await db
      .select({
        skillId: projectSkills.skillId,
        skillLabel: skills.label,
      })
      .from(projectSkills)
      .innerJoin(skills, eq(projectSkills.skillId, skills.id))
      .where(eq(projectSkills.projectId, projectId))

    if (!projectSkillsData.length) {
      return NextResponse.json({
        matches: [],
        message: 'No skills defined for this project'
      })
    }

    const projectSkillIds = projectSkillsData.map(s => s.skillId)
    const projectSkillLabels = projectSkillsData.map(s => s.skillLabel)

    // Find matching developers
    const developerMatches = await findDeveloperMatches(projectSkillIds, projectSkillLabels)
    
    // Find matching companies  
    const companyMatches = await findCompanyMatches(projectSkillIds, projectSkillLabels)

    // Combine and sort all matches by score
    const allMatches: MatchResult[] = [
      ...developerMatches,
      ...companyMatches
    ].sort((a, b) => b.matchScore - a.matchScore)

    return NextResponse.json({
      project: {
        id: project[0].id,
        title: project[0].title,
        requiredSkills: projectSkillLabels,
      },
      matches: allMatches,
      summary: {
        total: allMatches.length,
        developers: developerMatches.length,
        companies: companyMatches.length,
        topMatchScore: allMatches[0]?.matchScore || 0,
      }
    })

  } catch (error) {
    console.error('Error finding project matches:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function findDeveloperMatches(projectSkillIds: number[], projectSkillLabels: string[]): Promise<MatchResult[]> {
  // Get developers with matching skills
  const developersWithSkills = await db
    .select({
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
        inArray(developerSkills.skillId, projectSkillIds),
        eq(profiles.role, 'developer'),
        eq(developerProfiles.approved, 'approved') // Only approved developers
      )
    )

  // Group by developer and calculate match scores
  const developerMatchMap = new Map<string, MatchResult>()

  for (const dev of developersWithSkills) {
    if (!developerMatchMap.has(dev.userId)) {
      // Get total skills for this developer
      const totalSkillsResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(developerSkills)
        .where(eq(developerSkills.userId, dev.userId))

      const totalSkills = totalSkillsResult[0]?.count || 0

      developerMatchMap.set(dev.userId, {
        type: 'developer',
        profile: {
          id: dev.userId,
          displayName: dev.displayName,
          avatarUrl: dev.avatarUrl,
          headline: dev.headline,
          rate: dev.rate,
          availability: dev.availability,
          country: dev.country,
        },
        matchScore: 0,
        matchedSkills: [],
        totalSkills,
        availabilityStatus: dev.availability,
        hourlyRate: dev.rate ? { min: parseFloat(dev.rate.toString()), max: parseFloat(dev.rate.toString()) } : undefined,
      })
    }

    const match = developerMatchMap.get(dev.userId)!
    match.matchedSkills.push(dev.skillLabel)
  }

  // Calculate match scores for developers
  return Array.from(developerMatchMap.values()).map(match => {
    const skillOverlap = match.matchedSkills.length / projectSkillLabels.length
    const skillCoverage = match.matchedSkills.length / Math.max(match.totalSkills, 1)
    
    // Calculate base score (0-100)
    let score = (skillOverlap * 70) + (skillCoverage * 30)
    
    // Boost score based on availability
    if (match.availabilityStatus === 'available') {
      score *= 1.2
    } else if (match.availabilityStatus === 'busy') {
      score *= 0.8
    }
    
    match.matchScore = Math.min(Math.round(score), 100)
    return match
  })
}

async function findCompanyMatches(projectSkillIds: number[], projectSkillLabels: string[]): Promise<MatchResult[]> {
  // Get companies with matching skills
  const companiesWithSkills = await db
    .select({
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
        inArray(companySkills.skillId, projectSkillIds),
        eq(profiles.role, 'company')
      )
    )

  // Group by company and calculate match scores
  const companyMatchMap = new Map<string, MatchResult>()

  for (const comp of companiesWithSkills) {
    if (!companyMatchMap.has(comp.userId)) {
      // Get total skills for this company
      const totalSkillsResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(companySkills)
        .where(eq(companySkills.userId, comp.userId))

      const totalSkills = totalSkillsResult[0]?.count || 0

      companyMatchMap.set(comp.userId, {
        type: 'company',
        profile: {
          id: comp.userId,
          displayName: comp.displayName,
          avatarUrl: comp.avatarUrl,
          companyName: comp.companyName,
          about: comp.about,
          actualTeamSize: comp.actualTeamSize,
          currentCapacity: comp.currentCapacity,
          maxProjects: comp.maxProjects,
        },
        matchScore: 0,
        matchedSkills: [],
        totalSkills,
        teamSize: comp.actualTeamSize,
        hourlyRate: comp.hourlyRateMin || comp.hourlyRateMax ? {
          min: comp.hourlyRateMin ? parseFloat(comp.hourlyRateMin.toString()) : undefined,
          max: comp.hourlyRateMax ? parseFloat(comp.hourlyRateMax.toString()) : undefined,
        } : undefined,
      })
    }

    const match = companyMatchMap.get(comp.userId)!
    match.matchedSkills.push(comp.skillLabel)
  }

  // Calculate match scores for companies
  return Array.from(companyMatchMap.values()).map(match => {
    const skillOverlap = match.matchedSkills.length / projectSkillLabels.length
    const skillCoverage = match.matchedSkills.length / Math.max(match.totalSkills, 1)
    
    // Calculate base score (0-100)
    let score = (skillOverlap * 70) + (skillCoverage * 30)
    
    // Boost score based on capacity
    const profile = match.profile
    if (profile.currentCapacity < profile.maxProjects) {
      score *= 1.1 // Available capacity bonus
    }
    
    // Boost for larger teams (can handle bigger projects)
    if (profile.actualTeamSize && profile.actualTeamSize > 5) {
      score *= 1.05
    }
    
    match.matchScore = Math.min(Math.round(score), 100)
    return match
  })
}
