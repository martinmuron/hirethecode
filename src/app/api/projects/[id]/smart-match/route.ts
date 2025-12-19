import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/database'

interface ProjectPageProps {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: ProjectPageProps) {
  try {
    const { id } = await params
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const userProfile = await db.profiles.findByUserId(user.id)

    const adminAndCompany = new Set(['admin', 'company'])
    if (!userProfile || !adminAndCompany.has(userProfile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get project details
    const project = await db.projects.findById(id)

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Verify ownership
    if (project.seekerId !== userProfile.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const projectRequiredSkills = await db.projects.findProjectSkills(id)

    const requiredSkillIds = projectRequiredSkills.map(ps => ps.skillId)

    if (requiredSkillIds.length === 0) {
      return NextResponse.json({ 
        matches: [],
        message: 'No skills defined for this project. Please add skills to get smart matches.'
      })
    }

    const matchingDevelopers = await db.projects.findSmartMatchCandidates(requiredSkillIds)

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
          rateScore: 0,
          experienceScore: 0
        })
      }

      const devMatch = developerMatches.get(developerId)
      devMatch.skills.push({
        id: match.skill.id,
        label: match.skill.label,
        slug: match.skill.slug,
        level: match.skillLevel
      })

      // Check if this skill is required for the project
      if (requiredSkillIds.includes(match.skill.id)) {
        devMatch.matchingSkills.push({
          id: match.skill.id,
          label: match.skill.label,
          level: match.skillLevel
        })
      }
    })

    // Calculate scores for each developer
    const scoredMatches = Array.from(developerMatches.values()).map(match => {
      const totalRequiredSkills = requiredSkillIds.length
      const matchingSkillsCount = match.matchingSkills.length
      
      // Skill match score (40% of total score)
      const skillMatchRatio = matchingSkillsCount / totalRequiredSkills
      match.matchScore = Math.round(skillMatchRatio * 40)

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

      // Rate score (20% of total score) - based on project budget
      if (match.profile.rate && project.budgetMax) {
        const developerRate = parseFloat(match.profile.rate.toString())
        const projectBudget = parseFloat(project.budgetMax.toString())
        const estimatedHours = 160 // Assume ~1 month project
        const projectHourlyBudget = projectBudget / estimatedHours

        if (developerRate <= projectHourlyBudget) {
          match.rateScore = 20
        } else if (developerRate <= projectHourlyBudget * 1.2) {
          match.rateScore = 15
        } else if (developerRate <= projectHourlyBudget * 1.5) {
          match.rateScore = 10
        } else {
          match.rateScore = 5
        }
      } else {
        match.rateScore = 10 // Default score when no rate info
      }

      // Experience score (15% of total score) - based on skill levels
      const expertSkills = match.matchingSkills.filter((s: any) => s.level === 'expert').length
      const advancedSkills = match.matchingSkills.filter((s: any) => s.level === 'advanced').length
      const intermediateSkills = match.matchingSkills.filter((s: any) => s.level === 'intermediate').length
      
      match.experienceScore = Math.min(15, 
        (expertSkills * 5) + (advancedSkills * 3) + (intermediateSkills * 2)
      )

      // Total score
      match.totalScore = match.matchScore + match.availabilityScore + match.rateScore + match.experienceScore
      match.matchPercentage = Math.round((matchingSkillsCount / totalRequiredSkills) * 100)

      return match
    })

    // Sort by total score (highest first) and take top 20 matches
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
          rate: match.rateScore,
          experience: match.experienceScore
        },
        matchPercentage: match.matchPercentage
      }))

    const topMatchesWithRecommendationReason = topMatches.map(tm => {
      const recommendationReason = generateRecommendationReason(
        tm, 
        requiredSkillIds.length
      )
      return { ...tm, recommendationReason: recommendationReason }
    })

    console.log(`TOP MATCHES! ${JSON.stringify(topMatchesWithRecommendationReason, null, "  ")}`)

    return NextResponse.json({
      project: project,
      requiredSkills: projectRequiredSkills.map(ps => ps.skill),
      matches: topMatchesWithRecommendationReason,
      totalMatches: scoredMatches.length,
      searchCriteria: {
        skillsRequired: requiredSkillIds.length,
        budgetRange: project.budgetMin && project.budgetMax ? 
          `$${project.budgetMin} - $${project.budgetMax}` : 
          'Budget not specified',
        timeline: project.timeline || 'Timeline not specified'
      }
    })

  } catch (error) {
    console.error('Error in smart match:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateRecommendationReason(match: any, totalRequiredSkills: number): string {
  const reasons = []
  
  if (match.matchPercentage === 100) {
    reasons.push('Perfect skill match')
  } else if (match.matchPercentage >= 80) {
    reasons.push('Excellent skill match')
  } else if (match.matchPercentage >= 60) {
    reasons.push('Good skill match')
  }

  if (match.profile.availability === 'available') {
    reasons.push('Available now')
  }

  if (match.scores.experience >= 12) {
    reasons.push('Expert level skills')
  } else if (match.scores.experience >= 8) {
    reasons.push('Advanced skills')
  }

  if (match.scores.rate >= 18) {
    reasons.push('Within budget')
  }

  return reasons.join(', ') || 'Potential match'
}
