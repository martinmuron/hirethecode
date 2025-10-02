'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { 
  Search, 
  Star, 
  MapPin, 
  DollarSign, 
  Clock,
  Award,
  Brain,
  Zap,
  Target,
  RefreshCw,
  ExternalLink,
  Mail,
  Github,
  Globe,
  Briefcase
} from 'lucide-react'
import Link from 'next/link'

interface SmartMatchResultsProps {
  projectId: string
}

interface Developer {
  id: string
  displayName: string | null
  avatarUrl: string | null
  createdAt: Date
}

interface DeveloperProfile {
  headline: string | null
  bio: string | null
  rate: string | null
  availability: string | null
  approved: string | 'pending'
  country: string | null
  portfolioUrl: string | null
  githubUrl: string | null
}

interface Skill {
  id: number
  label: string
  slug: string
  level?: string
}

interface MatchResult {
  developer: Developer
  profile: DeveloperProfile
  skills: Skill[]
  matchingSkills: Skill[]
  scores: {
    total: number
    skill: number
    availability: number
    rate: number
    experience: number
  }
  matchPercentage: number
  recommendationReason: string
}

interface SmartMatchResponse {
  project: {
    id: string
    title: string
    description: string
  }
  requiredSkills: Skill[]
  matches: MatchResult[]
  totalMatches: number
  searchCriteria: {
    skillsRequired: number
    budgetRange: string
    timeline: string
  }
  message?: string
}

export function SmartMatchResults({ projectId }: SmartMatchResultsProps) {
  const [matches, setMatches] = useState<SmartMatchResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMatches = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/projects/${projectId}/smart-match`)

      console.log(`WHAT IS MY SMART MATCH RESPONSE? ${JSON.stringify(response)}`)
      
      if (!response.ok) {
        throw new Error('Failed to load smart matches')
      }

      const data = await response.json()
      setMatches(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMatches()
  }, [projectId])

  const getAvailabilityColor = (availability: string | null) => {
    switch (availability) {
      case 'available': return 'text-green-600 bg-green-50 border-green-200'
      case 'busy': return 'text-yellow-600 bg-yellow-50 border-yellow-200'  
      case 'unavailable': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-blue-600'
    if (percentage >= 40) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const formatRate = (rate: string | null) => {
    if (!rate) return 'Rate not specified'
    return `$${parseFloat(rate).toLocaleString()}/hr`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            <CardTitle>Smart Matching</CardTitle>
            <RefreshCw className="h-4 w-4 animate-spin" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-muted-foreground">
              Analyzing developers and finding the best matches...
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              <CardTitle>Smart Matching</CardTitle>
            </div>
            <Button size="sm" onClick={loadMatches}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-red-600 mb-2">Error loading matches</div>
            <div className="text-sm text-muted-foreground">{error}</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!matches || matches.matches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              <CardTitle>Smart Matching</CardTitle>
            </div>
            <Button size="sm" onClick={loadMatches}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-muted-foreground mb-2">
              No matching developers found
            </div>
            <div className="text-sm text-muted-foreground">
              {matches?.message || 'Try adding more skills to your project or adjusting your requirements.'}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              <CardTitle>Smart Matching Results</CardTitle>
            </div>
            <Button size="sm" onClick={loadMatches}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            Found {matches.totalMatches} developers matching your project requirements
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium">Required Skills</div>
              <div className="text-muted-foreground">
                {matches.requiredSkills.map(skill => skill.label).join(', ')}
              </div>
            </div>
            <div>
              <div className="font-medium">Budget Range</div>
              <div className="text-muted-foreground">{matches.searchCriteria.budgetRange}</div>
            </div>
            <div>
              <div className="font-medium">Timeline</div>
              <div className="text-muted-foreground">{matches.searchCriteria.timeline}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {matches.matches.map((match, index) => (
          <Card key={match.developer.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={match.developer.avatarUrl || undefined} />
                      <AvatarFallback className="text-lg">
                        {match.developer.displayName?.charAt(0) || 'D'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
                      #{index + 1}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {match.developer.displayName || 'Developer'}
                    </h3>
                    {match.profile.headline && (
                      <p className="text-muted-foreground">{match.profile.headline}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      {match.profile.rate && (
                        <div className="flex items-center gap-1 text-green-600">
                          <DollarSign className="h-3 w-3" />
                          <span>{formatRate(match.profile.rate)}</span>
                        </div>
                      )}
                      {match.profile.country && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{match.profile.country}</span>
                        </div>
                      )}
                      {match.profile.availability && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs capitalize ${getAvailabilityColor(match.profile.availability)}`}
                        >
                          {match.profile.availability}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-lg font-bold">{match.scores.total}/100</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Match Score</div>
                  <div className={`text-sm font-medium ${getScoreColor(match.matchPercentage, 100)}`}>
                    {match.matchPercentage}% skill match
                  </div>
                </div>
              </div>

              {/* Bio */}
              {match.profile.bio && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {match.profile.bio}
                </p>
              )}

              {/* Score Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Target className="h-3 w-3" />
                    <span className="text-xs text-muted-foreground">Skills</span>
                  </div>
                  <div className="text-sm font-semibold">{match.scores.skill}/40</div>
                  <Progress value={(match.scores.skill / 40) * 100} className="h-1" />
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs text-muted-foreground">Availability</span>
                  </div>
                  <div className="text-sm font-semibold">{match.scores.availability}/25</div>
                  <Progress value={(match.scores.availability / 25) * 100} className="h-1" />
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <DollarSign className="h-3 w-3" />
                    <span className="text-xs text-muted-foreground">Rate</span>
                  </div>
                  <div className="text-sm font-semibold">{match.scores.rate}/20</div>
                  <Progress value={(match.scores.rate / 20) * 100} className="h-1" />
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Award className="h-3 w-3" />
                    <span className="text-xs text-muted-foreground">Experience</span>
                  </div>
                  <div className="text-sm font-semibold">{match.scores.experience}/15</div>
                  <Progress value={(match.scores.experience / 15) * 100} className="h-1" />
                </div>
              </div>

              {/* Matching Skills */}
              <div className="mb-4">
                <div className="text-sm font-medium mb-2">Matching Skills</div>
                <div className="flex flex-wrap gap-2">
                  {match.matchingSkills.map((skill) => (
                    <Badge key={skill.id} variant="secondary" className="text-xs">
                      {skill.label}
                      {skill.level && (
                        <span className="ml-1 text-xs opacity-75 capitalize">
                          ({skill.level})
                        </span>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Recommendation Reason */}
              <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Why this match?</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {match.recommendationReason}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {match.profile.portfolioUrl && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={match.profile.portfolioUrl} target="_blank" rel="noopener noreferrer">
                        <Briefcase className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                  {match.profile.githubUrl && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={match.profile.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/developers/${match.developer.id}`}>
                      View Full Profile
                    </Link>
                  </Button>
                  <Button size="sm">
                    <Mail className="h-3 w-3 mr-1" />
                    Contact Developer
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
