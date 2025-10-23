'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Users, 
  Building2, 
  Star, 
  MapPin, 
  DollarSign, 
  Clock,
  Sparkles,
  Briefcase,
  Mail,
  ExternalLink,
  TrendingUp,
  CheckCircle
} from 'lucide-react'

interface SmartMatchDisplayProps {
  projectId: string
  // Context control - show different headers based on usage
  context: 'post-analysis' | 'project-overview'
  // Optional: Claude analysis results (for post-analysis context)
  claudeAnalysis?: {
    requiredSkills: string[]
    complexity: 'simple' | 'moderate' | 'complex' | 'enterprise'
    estimatedTimeline: string
    recommendedFor: 'freelancer' | 'company' | 'either'
    suggestedBudget?: {
      min: number
      max: number
      currency: string
    }
  }
  // Optional: Project summary (for project-overview context)
  projectSummary?: {
    title: string
    description: string
    budget?: { min?: number; max?: number; currency: string }
    timeline?: string
  }
  onContactDeveloper?: (developerId: string) => void
  onContactCompany?: (companyId: string) => void
}

interface MatchResult {
  type: 'developer' | 'company'
  profile: any
  matchScore: number
  matchedSkills: string[]
  totalSkills: number
  availabilityStatus?: string
  hourlyRate?: { min?: number; max?: number }
  teamSize?: number
}

interface MatchResponse {
  project: {
    id: string
    title: string
    requiredSkills: string[]
  }
  matches: MatchResult[]
  summary: {
    total: number
    developers: number
    companies: number
    topMatchScore: number
  }
}

export function SmartMatchDisplay({ 
  projectId, 
  context,
  claudeAnalysis,
  projectSummary,
  onContactDeveloper,
  onContactCompany
}: SmartMatchDisplayProps) {
  const [matches, setMatches] = useState<MatchResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMatches()
  }, [projectId])

  const fetchMatches = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/projects/${projectId}/matches`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch matches')
      }
      
      const data = await response.json()
      setMatches(data)
    } catch (err) {
      console.error('Error fetching matches:', err)
      setError('Failed to load matches. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-blue-600 bg-blue-100'
    if (score >= 40) return 'text-orange-600 bg-orange-100'
    return 'text-gray-600 bg-gray-100'
  }

  const getAvailabilityBadge = (status?: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="outline" className="text-green-600 border-green-600">Available</Badge>
      case 'busy':
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Busy</Badge>
      case 'unavailable':
        return <Badge variant="outline" className="text-red-600 border-red-600">Unavailable</Badge>
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Finding perfect matches for your project...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !matches) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-red-600 mb-4">{error || 'Failed to load matches'}</p>
          <Button onClick={fetchMatches} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Context Header - Claude Analysis or Project Summary */}
      {context === 'post-analysis' && claudeAnalysis && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-green-800">Required Skills</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {claudeAnalysis.requiredSkills.map(skill => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold text-green-800">Complexity</Label>
                <p className="text-sm mt-1 capitalize">{claudeAnalysis.complexity}</p>
              </div>
              <div>
                <Label className="text-sm font-semibold text-green-800">Estimated Timeline</Label>
                <p className="text-sm mt-1">{claudeAnalysis.estimatedTimeline}</p>
              </div>
              <div>
                <Label className="text-sm font-semibold text-green-800">Recommended For</Label>
                <p className="text-sm mt-1 capitalize">{claudeAnalysis.recommendedFor}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {context === 'project-overview' && projectSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              {projectSummary.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{projectSummary.description}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              {projectSummary.budget && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>
                    {projectSummary.budget.min && projectSummary.budget.max 
                      ? `${projectSummary.budget.min} - ${projectSummary.budget.max} ${projectSummary.budget.currency}`
                      : `Budget in ${projectSummary.budget.currency}`
                    }
                  </span>
                </div>
              )}
              {projectSummary.timeline && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{projectSummary.timeline}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Match Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Smart Matches Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{matches.summary.total}</div>
              <div className="text-sm text-muted-foreground">Total Matches</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{matches.summary.developers}</div>
              <div className="text-sm text-muted-foreground">Developers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{matches.summary.companies}</div>
              <div className="text-sm text-muted-foreground">Companies</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{matches.summary.topMatchScore}%</div>
              <div className="text-sm text-muted-foreground">Top Match</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matches List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Matched Professionals</h3>
        
        {matches.matches.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No matches found</h3>
              <p className="text-muted-foreground">
                Try adjusting your project requirements or check back later for new professionals.
              </p>
            </CardContent>
          </Card>
        ) : (
          matches.matches.map((match) => (
            <Card key={match.profile.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={match.profile.avatarUrl || undefined} />
                    <AvatarFallback>
                      {match.type === 'company' ? (
                        <Building2 className="h-6 w-6" />
                      ) : (
                        <Users className="h-6 w-6" />
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-lg">
                          {match.type === 'company' 
                            ? match.profile.companyName || match.profile.displayName
                            : match.profile.displayName
                          }
                        </h4>
                        {match.type === 'developer' && match.profile.headline && (
                          <p className="text-sm text-muted-foreground">{match.profile.headline}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Match Score */}
                        <Badge className={`${getMatchScoreColor(match.matchScore)} font-semibold`}>
                          {match.matchScore}% match
                        </Badge>
                        {/* Type Badge */}
                        <Badge variant="outline">
                          {match.type === 'company' ? (
                            <>
                              <Building2 className="h-3 w-3 mr-1" />
                              Team
                            </>
                          ) : (
                            <>
                              <Users className="h-3 w-3 mr-1" />
                              Freelancer
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2">
                      {/* Skills */}
                      <div>
                        <Label className="text-xs text-muted-foreground">Matching Skills</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {match.matchedSkills.slice(0, 6).map(skill => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {match.matchedSkills.length > 6 && (
                            <Badge variant="secondary" className="text-xs">
                              +{match.matchedSkills.length - 6} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {/* Availability for developers */}
                        {match.type === 'developer' && match.availabilityStatus && (
                          <div className="flex items-center gap-1">
                            {getAvailabilityBadge(match.availabilityStatus)}
                          </div>
                        )}
                        
                        {/* Team size for companies */}
                        {match.type === 'company' && match.teamSize && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{match.teamSize} developers</span>
                          </div>
                        )}

                        {/* Rate info */}
                        {match.hourlyRate && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span>
                              {match.hourlyRate.min === match.hourlyRate.max
                                ? `$${match.hourlyRate.min}/hr`
                                : match.hourlyRate.min && match.hourlyRate.max
                                  ? `$${match.hourlyRate.min}-${match.hourlyRate.max}/hr`
                                  : match.hourlyRate.min
                                    ? `From $${match.hourlyRate.min}/hr`
                                    : `Up to $${match.hourlyRate.max}/hr`
                              }
                            </span>
                          </div>
                        )}

                        {/* Location for developers */}
                        {match.type === 'developer' && match.profile.country && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{match.profile.country}</span>
                          </div>
                        )}
                      </div>

                      {/* About for companies */}
                      {match.type === 'company' && match.profile.about && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {match.profile.about}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={() => {
                          if (match.type === 'developer' && onContactDeveloper) {
                            onContactDeveloper(match.profile.id)
                          } else if (match.type === 'company' && onContactCompany) {
                            onContactCompany(match.profile.id)
                          }
                        }}
                        size="sm"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
