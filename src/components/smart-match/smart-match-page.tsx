'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { DashboardNav } from '@/components/navigation/dashboard-nav'
import Link from 'next/link'
import type { Profile } from '@/lib/db/schema'

interface SmartMatchPageProps {
  profile: Profile
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

interface Match {
  developer?: any
  company?: any
  companyProfile?: any
  profile?: any
  skills?: any[]
  matchingSkills: any[]
  skillDemand?: any[]
  scores: {
    total: number
    skill: number
    availability?: number
    experience?: number
    importance: number
    culture?: number
  }
  matchPercentage: number
  recommendationReason: string
}

interface SmartMatchResponse {
  userRole: 'company' | 'developer'
  requiredSkills?: any[]
  developerSkills?: any[]
  matches: Match[]
  totalMatches: number
  message?: string
  companyPreferences?: any
}

export function SmartMatchPage({ profile, user }: SmartMatchPageProps) {
  const [matchData, setMatchData] = useState<SmartMatchResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/smart-match')
      
      if (!response.ok) {
        throw new Error('Failed to fetch matches')
      }
      
      const data = await response.json()
      setMatchData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav user={user} role={profile.role as 'developer' | 'company' | 'admin'} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Finding your perfect matches...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav user={user} role={profile.role as 'developer' | 'company' | 'admin'} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Smart Match</h1>
            <Card className="max-w-md mx-auto">
              <CardContent className="p-6">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchMatches} className="w-full">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (matchData?.message) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav user={user} role={profile.role as 'developer' | 'company' | 'admin'} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Smart Match</h1>
            <Card className="max-w-md mx-auto">
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4">{matchData.message}</p>
                <Button asChild className="w-full">
                  <Link href="/profile">
                    {profile.role === 'company' ? 'Add Company Skills' : 'Add Skills to Profile'}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} role={profile.role as 'developer' | 'company' | 'admin'} />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {profile.role === 'company' ? 'Smart Developer Matches' : 'Smart Company Matches'}
          </h1>
          <p className="text-muted-foreground">
            {profile.role === 'company' 
              ? `Found ${matchData?.totalMatches || 0} developers matching your requirements`
              : `Found ${matchData?.totalMatches || 0} companies looking for your skills`
            }
          </p>
        </div>

        {/* Skills Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {profile.role === 'company' ? 'Your Skill Requirements' : 'Your Skills'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.role === 'company' ? (
                matchData?.requiredSkills?.map((skill: any) => (
                  <Badge 
                    key={skill.id} 
                    variant={
                      skill.importance === 'required' ? 'default' : 
                      skill.importance === 'preferred' ? 'secondary' : 'outline'
                    }
                  >
                    {skill.label}
                    {skill.importance === 'required' && ' *'}
                  </Badge>
                ))
              ) : (
                matchData?.developerSkills?.map((skill: any) => (
                  <Badge key={skill.id} variant="secondary">
                    {skill.label} ({skill.level})
                  </Badge>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Matches */}
        <div className="grid gap-6">
          {matchData?.matches?.map((match, index) => (
            <Card key={profile.role === 'company' ? match.developer?.id : match.company?.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <img 
                        src={profile.role === 'company' 
                          ? match.developer?.avatarUrl || '/api/placeholder/48/48'
                          : match.companyProfile?.logoUrl || '/api/placeholder/48/48'
                        }
                        alt="Avatar"
                        className="rounded-full"
                      />
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {profile.role === 'company' 
                          ? match.developer?.displayName || 'Developer'
                          : match.companyProfile?.companyName || 'Company'
                        }
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {profile.role === 'company' 
                          ? match.profile?.headline
                          : match.companyProfile?.industry
                        }
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {match.recommendationReason}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {match.scores.total}%
                    </div>
                    <p className="text-xs text-muted-foreground">Match Score</p>
                  </div>
                </div>

                {/* Match Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Overall Match</span>
                    <span>{match.matchPercentage}%</span>
                  </div>
                  <Progress value={match.matchPercentage} className="h-2" />
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold">{match.scores.skill}</div>
                    <div className="text-xs text-muted-foreground">Skills</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{match.scores.importance}</div>
                    <div className="text-xs text-muted-foreground">Priority</div>
                  </div>
                  {profile.role === 'company' && (
                    <>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{match.scores.availability}</div>
                        <div className="text-xs text-muted-foreground">Available</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{match.scores.experience}</div>
                        <div className="text-xs text-muted-foreground">Experience</div>
                      </div>
                    </>
                  )}
                  {profile.role === 'developer' && (
                    <div className="text-center">
                      <div className="text-lg font-semibold">{match.scores.culture}</div>
                      <div className="text-xs text-muted-foreground">Culture</div>
                    </div>
                  )}
                </div>

                {/* Matching Skills */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-2">Matching Skills:</h4>
                  <div className="flex flex-wrap gap-2">
                    {match.matchingSkills.map((skill: any, skillIndex: number) => (
                      <Badge key={skillIndex} variant="outline" className="text-xs">
                        {skill.label}
                        {profile.role === 'company' && ` (${skill.level})`}
                        {profile.role === 'developer' && skill.importance === 'required' && ' *'}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  {profile.role === 'company' && (
                    <>
                      {match.profile?.availability && (
                        <div>
                          <strong>Availability:</strong> {match.profile.availability}
                        </div>
                      )}
                      {match.profile?.rate && (
                        <div>
                          <strong>Rate:</strong> ${match.profile.rate}/hr
                        </div>
                      )}
                      {match.profile?.country && (
                        <div>
                          <strong>Location:</strong> {match.profile.country}
                        </div>
                      )}
                    </>
                  )}
                  {profile.role === 'developer' && (
                    <>
                      {match.companyProfile?.size && (
                        <div>
                          <strong>Company Size:</strong> {match.companyProfile.size}
                        </div>
                      )}
                      {match.companyProfile?.workStyle && (
                        <div>
                          <strong>Work Style:</strong> {match.companyProfile.workStyle}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button asChild>
                    <Link href={profile.role === 'company' 
                      ? `/developers/${match.developer?.id}`
                      : `/company/${match.company?.id}`
                    }>
                      View Profile
                    </Link>
                  </Button>
                  <Button variant="outline">
                    {profile.role === 'company' ? 'Contact Developer' : 'View Jobs'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {matchData?.matches?.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                No matches found. Try updating your {profile.role === 'company' ? 'skill requirements' : 'skills'} to find more matches.
              </p>
              <Button asChild>
                <Link href="/profile">Update Profile</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
