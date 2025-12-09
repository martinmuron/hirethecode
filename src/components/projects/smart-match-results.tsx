'use client'

import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import { Id } from '@convex/_generated/dataModel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Star,
  MapPin,
  DollarSign,
  Clock,
  Award,
  Brain,
  Zap,
  Target,
  RefreshCw,
  Mail,
  Github,
  Briefcase,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

interface SmartMatchResultsProps {
  projectId: Id<'projects'>
}

export function SmartMatchResults({ projectId }: SmartMatchResultsProps) {
  const project = useQuery(api.projects.get, { id: projectId })
  const allDevelopers = useQuery(api.developers.search, { limit: 100 })
  const sendContact = useMutation(api.contacts.create)

  const [contactingId, setContactingId] = useState<Id<'profiles'> | null>(null)
  const [contactedIds, setContactedIds] = useState<Id<'profiles'>[]>([])

  const loading = project === undefined || allDevelopers === undefined

  // Calculate match scores based on skills overlap
  const calculateMatches = () => {
    if (!project || !allDevelopers?.developers) return []

    const projectSkillSlugs = new Set(project.skills?.map(s => s?.slug).filter(Boolean) || [])

    return allDevelopers.developers
      .map(developer => {
        const devSkillSlugs = developer.skills?.map(s => s?.slug).filter(Boolean) || []
        const matchingSkills = devSkillSlugs.filter(slug => slug && projectSkillSlugs.has(slug))
        const skillMatchPercent = projectSkillSlugs.size > 0
          ? Math.round((matchingSkills.length / projectSkillSlugs.size) * 100)
          : 0

        // Calculate scores
        const skillScore = Math.min(40, skillMatchPercent * 0.4)
        const availabilityScore = developer.developerProfile?.availability === 'available' ? 25 :
          developer.developerProfile?.availability === 'busy' ? 10 : 0
        const rateScore = developer.developerProfile?.rate ? 15 : 5
        const experienceScore = (developer.skills?.length || 0) * 2

        const totalScore = Math.round(skillScore + availabilityScore + rateScore + Math.min(15, experienceScore))

        return {
          developer,
          matchingSkills: developer.skills?.filter(s => s && matchingSkills.includes(s.slug)) || [],
          scores: {
            total: totalScore,
            skill: Math.round(skillScore),
            availability: availabilityScore,
            rate: rateScore,
            experience: Math.min(15, experienceScore)
          },
          matchPercentage: skillMatchPercent,
          recommendationReason: getRecommendationReason(skillMatchPercent, developer.developerProfile?.availability)
        }
      })
      .filter(m => m.matchPercentage > 0 || m.scores.total > 20)
      .sort((a, b) => b.scores.total - a.scores.total)
      .slice(0, 10)
  }

  const getRecommendationReason = (skillMatch: number, availability?: string | null) => {
    const reasons = []
    if (skillMatch >= 80) reasons.push('Excellent skill match')
    else if (skillMatch >= 50) reasons.push('Good skill coverage')
    if (availability === 'available') reasons.push('Currently available for new projects')
    if (reasons.length === 0) return 'Has relevant skills that could benefit your project'
    return reasons.join('. ')
  }

  const getAvailabilityColor = (availability: string | null | undefined) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200'
      case 'busy': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'unavailable': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-blue-600'
    if (percentage >= 40) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const formatRate = (rate: number | null | undefined) => {
    if (!rate) return 'Rate not specified'
    return `$${rate.toLocaleString()}/hr`
  }

  const handleContact = async (developerId: Id<'profiles'>) => {
    setContactingId(developerId)
    try {
      await sendContact({
        developerId,
        message: `I'm interested in discussing the "${project?.title}" project with you. Your skills seem like a great match!`
      })
      setContactedIds([...contactedIds, developerId])
    } catch (error) {
      console.error('Error contacting developer:', error)
    } finally {
      setContactingId(null)
    }
  }

  if (loading) {
    return (
      <Card className="bg-white border-gray-100 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            <CardTitle className="text-gray-900">Smart Matching</CardTitle>
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-gray-500">
              Analyzing developers and finding the best matches...
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const matches = calculateMatches()

  if (matches.length === 0) {
    return (
      <Card className="bg-white border-gray-100 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            <CardTitle className="text-gray-900">Smart Matching</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">
              No matching developers found
            </div>
            <div className="text-sm text-gray-400">
              Try adding more skills to your project or adjusting your requirements.
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white border-gray-100 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            <CardTitle className="text-gray-900">Smart Matching Results</CardTitle>
          </div>
          <div className="text-sm text-gray-500">
            Found {matches.length} developers matching your project requirements
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-900">Required Skills</div>
              <div className="text-gray-500">
                {project?.skills?.map(s => s?.label).filter(Boolean).join(', ') || 'None specified'}
              </div>
            </div>
            <div>
              <div className="font-medium text-gray-900">Budget Range</div>
              <div className="text-gray-500">
                {project?.budgetMin && project?.budgetMax
                  ? `${project.currency} ${project.budgetMin.toLocaleString()} - ${project.budgetMax.toLocaleString()}`
                  : 'Not specified'}
              </div>
            </div>
            <div>
              <div className="font-medium text-gray-900">Timeline</div>
              <div className="text-gray-500">{project?.timeline || 'Not specified'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {matches.map((match, index) => (
          <Card key={match.developer.id} className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16 ring-2 ring-gray-100">
                      <AvatarImage src={match.developer.profile?.avatarUrl || undefined} />
                      <AvatarFallback className="text-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        {match.developer.profile?.displayName?.charAt(0) || 'D'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
                      #{index + 1}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {match.developer.profile?.displayName || 'Developer'}
                    </h3>
                    {match.developer.developerProfile?.headline && (
                      <p className="text-gray-500">{match.developer.developerProfile.headline}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      {match.developer.developerProfile?.rate && (
                        <div className="flex items-center gap-1 text-green-600 font-medium">
                          <DollarSign className="h-3 w-3" />
                          <span>{formatRate(match.developer.developerProfile.rate)}</span>
                        </div>
                      )}
                      {match.developer.developerProfile?.country && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span>{match.developer.developerProfile.country}</span>
                        </div>
                      )}
                      {match.developer.developerProfile?.availability && (
                        <Badge
                          variant="outline"
                          className={`text-xs capitalize rounded-full ${getAvailabilityColor(match.developer.developerProfile.availability)}`}
                        >
                          {match.developer.developerProfile.availability}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-lg font-bold text-gray-900">{match.scores.total}/100</span>
                  </div>
                  <div className="text-xs text-gray-500">Match Score</div>
                  <div className={`text-sm font-medium ${getScoreColor(match.matchPercentage, 100)}`}>
                    {match.matchPercentage}% skill match
                  </div>
                </div>
              </div>

              {/* Bio */}
              {match.developer.developerProfile?.bio && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {match.developer.developerProfile.bio}
                </p>
              )}

              {/* Score Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-2 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Target className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-500">Skills</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">{match.scores.skill}/40</div>
                  <Progress value={(match.scores.skill / 40) * 100} className="h-1 mt-1" />
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-500">Availability</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">{match.scores.availability}/25</div>
                  <Progress value={(match.scores.availability / 25) * 100} className="h-1 mt-1" />
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <DollarSign className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-500">Rate</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">{match.scores.rate}/20</div>
                  <Progress value={(match.scores.rate / 20) * 100} className="h-1 mt-1" />
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Award className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-500">Experience</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">{match.scores.experience}/15</div>
                  <Progress value={(match.scores.experience / 15) * 100} className="h-1 mt-1" />
                </div>
              </div>

              {/* Matching Skills */}
              {match.matchingSkills.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm font-medium mb-2 text-gray-900">Matching Skills</div>
                  <div className="flex flex-wrap gap-2">
                    {match.matchingSkills.map((skill) => (
                      skill && (
                        <Badge key={skill._id} variant="secondary" className="text-xs rounded-full">
                          {skill.label}
                          {skill.level && (
                            <span className="ml-1 text-xs opacity-75 capitalize">
                              ({skill.level})
                            </span>
                          )}
                        </Badge>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendation Reason */}
              <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Why this match?</span>
                </div>
                <div className="text-sm text-blue-700 mt-1">
                  {match.recommendationReason}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {match.developer.developerProfile?.portfolioUrl && (
                    <Button size="sm" variant="outline" asChild className="rounded-full">
                      <a href={match.developer.developerProfile.portfolioUrl} target="_blank" rel="noopener noreferrer">
                        <Briefcase className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                  {match.developer.developerProfile?.githubUrl && (
                    <Button size="sm" variant="outline" asChild className="rounded-full">
                      <a href={match.developer.developerProfile.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild className="rounded-full">
                    <Link href={`/developers/${match.developer.id}`}>
                      View Full Profile
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-full"
                    onClick={() => handleContact(match.developer.id)}
                    disabled={contactingId === match.developer.id || contactedIds.includes(match.developer.id)}
                  >
                    <Mail className="h-3 w-3 mr-1" />
                    {contactedIds.includes(match.developer.id)
                      ? 'Contacted'
                      : contactingId === match.developer.id
                      ? 'Sending...'
                      : 'Contact Developer'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
