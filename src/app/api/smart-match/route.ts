import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { 
  profiles, 
  companySkills, 
  developerSkills, 
  skills, 
  developerProfiles,
  companyProfiles 
} from '@/lib/db/schema'
import { eq, and, inArray, sql } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser()

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const userProfile = await db.select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1)

    if (!userProfile.length) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const profile = userProfile[0]

    if (profile.role === 'company') {
      return await getCompanyMatches(profile.id)
    } else if (profile.role === 'developer') {
      return await getDeveloperMatches(profile.id)
    } else {
      return NextResponse.json({ error: 'Invalid role for smart matching' }, { status: 403 })
    }

  } catch (error) {
    console.error('Error in smart match:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getCompanyMatches(companyId: string) {
  // Get company's skill requirements
  const companyRequiredSkills = await db.select({
    skillId: companySkills.skillId,
    importance: companySkills.importance,
    skill: skills
  })
    .from(companySkills)
    .innerJoin(skills, eq(companySkills.skillId, skills.id))
    .where(eq(companySkills.userId, companyId))

  if (companyRequiredSkills.length === 0) {
    return NextResponse.json({ 
      matches: [],
      message: 'No skill requirements defined. Please add skills to your company profile to get smart matches.'
    })
  }

  const requiredSkillIds = companyRequiredSkills.map(cs => cs.skillId)

  // Get company preferences
  const companyProfile = await db.select()
    .from(companyProfiles)
    .where(eq(companyProfiles.userId, companyId))
    .limit(1)

  // Get developers with matching skills
  const matchingDevelopers = await db.select({
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
        inArray(developerSkills.skillId, requiredSkillIds)
      )
    )

  // Group by developer and calculate match scores
  const developerMatches = new Map()

  matchingDevelopers.forEach(match => {
    const developerId = match.developer.id
    
    if (!developerMatches.has(developerId)) {
      developerMatches.set(developerId, {
        developer: match.developer,
        profile: match.profile,
        skills: [],
        matchingSkills: [],
        matchScore: 0,
        availabilityScore: 0,
        experienceScore: 0,
        importanceScore: 0
      })
    }

    const devMatch = developerMatches.get(developerId)
    devMatch.skills.push({
      id: match.skill.id,
      label: match.skill.label,
      slug: match.skill.slug,
      level: match.skillLevel
    })

    // Check if this skill is required by the company
    const companySkill = companyRequiredSkills.find(cs => cs.skillId === match.skill.id)
    if (companySkill) {
      devMatch.matchingSkills.push({
        id: match.skill.id,
        label: match.skill.label,
        level: match.skillLevel,
        importance: companySkill.importance
      })
    }
  })

  // Calculate scores for each developer
  const scoredMatches = Array.from(developerMatches.values()).map(match => {
    const totalRequiredSkills = companyRequiredSkills.length
    const matchingSkillsCount = match.matchingSkills.length
    
    // Skill match score (35% of total score)
    const skillMatchRatio = matchingSkillsCount / totalRequiredSkills
    match.matchScore = Math.round(skillMatchRatio * 35)

    // Importance score (25% of total score) - bonus for required skills
    const requiredSkillsMatch = match.matchingSkills.filter((s: any) => s.importance === 'required').length
    const preferredSkillsMatch = match.matchingSkills.filter((s: any) => s.importance === 'preferred').length
    const niceToHaveSkillsMatch = match.matchingSkills.filter((s: any) => s.importance === 'nice_to_have').length
    
    match.importanceScore = Math.min(25, 
      (requiredSkillsMatch * 8) + (preferredSkillsMatch * 5) + (niceToHaveSkillsMatch * 2)
    )

    // Availability score (25% of total score)
    switch (match.profile.availability) {
      case 'available':
        match.availabilityScore = 25
        break
      case 'busy':
        match.availabilityScore = 15
        break
      case 'unavailable':
        match.availabilityScore = 5
        break
      default:
        match.availabilityScore = 10
    }

    // Experience score (15% of total score) - based on skill levels
    const expertSkills = match.matchingSkills.filter((s: any) => s.level === 'expert').length
    const advancedSkills = match.matchingSkills.filter((s: any) => s.level === 'advanced').length
    const intermediateSkills = match.matchingSkills.filter((s: any) => s.level === 'intermediate').length
    
    match.experienceScore = Math.min(15, 
      (expertSkills * 5) + (advancedSkills * 3) + (intermediateSkills * 2)
    )

    // Total score
    match.totalScore = match.matchScore + match.availabilityScore + match.experienceScore + match.importanceScore
    match.matchPercentage = Math.round((matchingSkillsCount / totalRequiredSkills) * 100)

    return match
  })

  // Sort by total score and take top 20
  const topMatches = scoredMatches
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 20)
    .map(match => ({
      developer: match.developer,
      profile: match.profile,
      skills: match.skills,
      matchingSkills: match.matchingSkills,
      scores: {
        total: match.totalScore,
        skill: match.matchScore,
        availability: match.availabilityScore,
        experience: match.experienceScore,
        importance: match.importanceScore
      },
      matchPercentage: match.matchPercentage,
      recommendationReason: generateDeveloperRecommendationReason(match, companyRequiredSkills.length)
    }))

  return NextResponse.json({
    userRole: 'company',
    requiredSkills: companyRequiredSkills.map(cs => ({ ...cs.skill, importance: cs.importance })),
    matches: topMatches,
    totalMatches: scoredMatches.length,
    companyPreferences: companyProfile.length > 0 ? {
      experienceLevel: companyProfile[0].experienceLevel,
      workStyle: companyProfile[0].workStyle,
      industry: companyProfile[0].industry
    } : null
  })
}

async function getDeveloperMatches(developerId: string) {
  // Get developer's skills
  const developerSkillsData = await db.select({
    skillId: developerSkills.skillId,
    level: developerSkills.level,
    skill: skills
  })
    .from(developerSkills)
    .innerJoin(skills, eq(developerSkills.skillId, skills.id))
    .where(eq(developerSkills.userId, developerId))

  if (developerSkillsData.length === 0) {
    return NextResponse.json({ 
      matches: [],
      message: 'No skills found in your profile. Please add skills to get smart matches.'
    })
  }

  const developerSkillIds = developerSkillsData.map(ds => ds.skillId)

  // Get companies looking for these skills
  const matchingCompanies = await db.select({
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
        inArray(companySkills.skillId, developerSkillIds)
      )
    )

  // Group by company and calculate match scores
  const companyMatches = new Map()

  matchingCompanies.forEach(match => {
    const companyId = match.company.id
    
    if (!companyMatches.has(companyId)) {
      companyMatches.set(companyId, {
        company: match.company,
        companyProfile: match.companyProfile,
        matchingSkills: [],
        skillDemand: [],
        matchScore: 0,
        importanceScore: 0,
        cultureScore: 0
      })
    }

    const companyMatch = companyMatches.get(companyId)
    
    // Find developer's skill level for this skill
    const devSkill = developerSkillsData.find(ds => ds.skillId === match.skill.id)
    if (devSkill) {
      companyMatch.matchingSkills.push({
        id: match.skill.id,
        label: match.skill.label,
        developerLevel: devSkill.level,
        importance: match.skillImportance
      })
      
      companyMatch.skillDemand.push({
        skill: match.skill.label,
        importance: match.skillImportance
      })
    }
  })

  // Calculate scores for each company
  const scoredMatches = Array.from(companyMatches.values()).map(match => {
    // Skill match score (40% of total score)
    const matchingSkillsCount = match.matchingSkills.length
    const developerTotalSkills = developerSkillsData.length
    const skillMatchRatio = Math.min(1, matchingSkillsCount / Math.max(1, developerTotalSkills * 0.7)) // They want at least 70% of dev skills
    match.matchScore = Math.round(skillMatchRatio * 40)

    // Importance score (35% of total score) - higher score for companies that value dev's skills highly
    const requiredSkillsMatch = match.matchingSkills.filter((s: any) => s.importance === 'required').length
    const preferredSkillsMatch = match.matchingSkills.filter((s: any) => s.importance === 'preferred').length
    const niceToHaveSkillsMatch = match.matchingSkills.filter((s: any) => s.importance === 'nice_to_have').length
    
    match.importanceScore = Math.min(35, 
      (requiredSkillsMatch * 10) + (preferredSkillsMatch * 7) + (niceToHaveSkillsMatch * 3)
    )

    // Culture/fit score (25% of total score) - based on company attributes
    let cultureScore = 15 // Base score
    
    // Bonus for specific attributes
    if (match.companyProfile.workStyle === 'remote' || match.companyProfile.workStyle === 'flexible') {
      cultureScore += 5
    }
    if (match.companyProfile.size === 'startup' || match.companyProfile.size === 'scale-up') {
      cultureScore += 5
    }
    
    match.cultureScore = Math.min(25, cultureScore)

    // Total score
    match.totalScore = match.matchScore + match.importanceScore + match.cultureScore
    match.matchPercentage = Math.round((matchingSkillsCount / developerTotalSkills) * 100)

    return match
  })

  // Sort by total score and take top 20
  const topMatches = scoredMatches
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 20)
    .map(match => ({
      company: match.company,
      companyProfile: match.companyProfile,
      matchingSkills: match.matchingSkills,
      skillDemand: match.skillDemand,
      scores: {
        total: match.totalScore,
        skill: match.matchScore,
        importance: match.importanceScore,
        culture: match.cultureScore
      },
      matchPercentage: match.matchPercentage,
      recommendationReason: generateCompanyRecommendationReason(match)
    }))

  return NextResponse.json({
    userRole: 'developer',
    developerSkills: developerSkillsData.map(ds => ({ ...ds.skill, level: ds.level })),
    matches: topMatches,
    totalMatches: scoredMatches.length
  })
}

function generateDeveloperRecommendationReason(match: any, totalRequiredSkills: number): string {
  const reasons = []

  if (match.matchPercentage === 100) {
    reasons.push('Perfect skill match')
  } else if (match.matchPercentage >= 80) {
    reasons.push('Excellent skill match')
  } else if (match.matchPercentage >= 60) {
    reasons.push('Good skill match')
  }

  const requiredSkillsCount = match.matchingSkills.filter((s: any) => s.importance === 'required').length
  if (requiredSkillsCount > 0) {
    reasons.push(`Matches ${requiredSkillsCount} critical skill${requiredSkillsCount > 1 ? 's' : ''}`)
  }

  if (match.profile.availability === 'available') {
    reasons.push('Available now')
  }

  const expertSkills = match.matchingSkills.filter((s: any) => s.level === 'expert').length
  if (expertSkills > 0) {
    reasons.push(`${expertSkills} expert-level skill${expertSkills > 1 ? 's' : ''}`)
  }

  return reasons.join(', ') || 'Potential match'
}

function generateCompanyRecommendationReason(match: any): string {
  const reasons = []

  const requiredSkillsCount = match.matchingSkills.filter((s: any) => s.importance === 'required').length
  if (requiredSkillsCount > 0) {
    reasons.push(`Actively seeking ${requiredSkillsCount} of your skill${requiredSkillsCount > 1 ? 's' : ''}`)
  }

  const preferredSkillsCount = match.matchingSkills.filter((s: any) => s.importance === 'preferred').length
  if (preferredSkillsCount > 0) {
    reasons.push(`Values ${preferredSkillsCount} of your skill${preferredSkillsCount > 1 ? 's' : ''}`)
  }

  if (match.companyProfile.workStyle === 'remote' || match.companyProfile.workStyle === 'flexible') {
    reasons.push('Offers flexible work')
  }

  if (match.companyProfile.industry) {
    reasons.push(`${match.companyProfile.industry} industry`)
  }

  return reasons.join(', ') || 'Good potential match'
}
