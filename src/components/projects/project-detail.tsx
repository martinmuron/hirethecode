'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DashboardNav } from '@/components/navigation/dashboard-nav'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  User, 
  MapPin, 
  Clock, 
  DollarSign, 
  Calendar, 
  ExternalLink,
  Send,
  Edit,
  Globe,
  Users,
  Brain,
  MessageCircle,
  Building2,
  Code,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SmartMatchDisplay } from './smart-match-display' // UPDATED: Use our new component

interface ProjectDetailProps {
  project: {
    id: string
    title: string
    description: string
    budgetMin: string | null
    budgetMax: string | null
    currency: string
    timeline: string | null
    locationPref: string | null
    status: string
    // NEW: Claude analysis fields
    complexity: 'simple' | 'moderate' | 'complex' | 'enterprise' | null
    recommendedFor: 'freelancer' | 'company' | 'either' | null
    createdAt: string
    seeker: { // UPDATED: seeker instead of company
      id: string
      displayName: string | null
      avatarUrl: string | null
      organizationName: string | null
      industry: string | null
      companySize: string | null
    }
    skills: Array<{
      id: number
      slug: string
      label: string
    }>
  }
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  userRole: 'developer' | 'company' | 'admin' | 'seeker' // Added seeker
  userId: string
  isOwner: boolean
}

export function ProjectDetail({ project, user, userRole, userId, isOwner }: ProjectDetailProps) {
  const [applicationMessage, setApplicationMessage] = useState('')
  const [isApplying, setIsApplying] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)

  const handleApply = async () => {
    if (!applicationMessage.trim()) return

    setIsApplying(true)
    try {
      const response = await fetch(`/api/projects/${project.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: applicationMessage.trim()
        })
      })

      if (response.ok) {
        setHasApplied(true)
        setApplicationMessage('')
      }
    } catch (error) {
      console.error('Error applying to project:', error)
    } finally {
      setIsApplying(false)
    }
  }

  const formatBudget = (min: string | null, max: string | null, currency: string) => {
    if (!min && !max) return 'Budget negotiable'
    if (min && max) return `${currency} ${parseFloat(min).toLocaleString()} - ${parseFloat(max).toLocaleString()}`
    if (min) return `${currency} ${parseFloat(min).toLocaleString()}+`
    return `Up to ${currency} ${parseFloat(max!).toLocaleString()}`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getComplexityBadge = (complexity: string | null) => {
    if (!complexity) return null
    
    const colors = {
      simple: 'bg-green-100 text-green-700 border-green-300',
      moderate: 'bg-blue-100 text-blue-700 border-blue-300',
      complex: 'bg-orange-100 text-orange-700 border-orange-300',
      enterprise: 'bg-purple-100 text-purple-700 border-purple-300'
    }

    return (
      <Badge variant="outline" className={colors[complexity as keyof typeof colors]}>
        {complexity} project
      </Badge>
    )
  }

  const getRecommendedForBadge = (recommendedFor: string | null) => {
    if (!recommendedFor || recommendedFor === 'either') return null
    
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        {recommendedFor === 'freelancer' ? (
          <>
            <Code className="h-3 w-3" />
            Best for freelancers
          </>
        ) : (
          <>
            <Building2 className="h-3 w-3" />
            Best for teams
          </>
        )}
      </Badge>
    )
  }

  // UPDATED: Both developers AND companies can apply now (not just developers)
  const canApply = (userRole === 'developer' || userRole === 'company') && !isOwner

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav role={userRole} />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/projects">← Back to Projects</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Project Header */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-3">{project.title}</CardTitle>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Posted {formatDate(project.createdAt)}</span>
                      </div>
                      <Badge variant={project.status === 'open' ? 'default' : 'secondary'}>
                        {project.status}
                      </Badge>
                      {getComplexityBadge(project.complexity)}
                      {getRecommendedForBadge(project.recommendedFor)}
                    </div>
                    
                    {/* NEW: AI Analysis Indicator */}
                    {(project.complexity || project.recommendedFor) && (
                      <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md w-fit">
                        <Sparkles className="h-3 w-3" />
                        <span>AI-analyzed project</span>
                      </div>
                    )}
                  </div>
                  {isOwner && (
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/projects/${project.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-base leading-relaxed whitespace-pre-wrap">
                    {project.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Tabs for different views */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Project Details</TabsTrigger>
                {canApply && ( // UPDATED: Both developers and companies can apply
                  <TabsTrigger value="apply">Apply</TabsTrigger>
                )}
                {isOwner && (
                  <TabsTrigger value="smart-match">
                    <Brain className="h-4 w-4 mr-1" />
                    Smart Match
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="details" className="space-y-6 mt-6">
                {/* Project Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="font-medium">Budget</div>
                          <div className="text-sm text-muted-foreground">
                            {formatBudget(project.budgetMin, project.budgetMax, project.currency)}
                          </div>
                        </div>
                      </div>

                      {project.timeline && (
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-blue-600" />
                          <div>
                            <div className="font-medium">Timeline</div>
                            <div className="text-sm text-muted-foreground">{project.timeline}</div>
                          </div>
                        </div>
                      )}

                      {project.locationPref && (
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-red-600" />
                          <div>
                            <div className="font-medium">Location</div>
                            <div className="text-sm text-muted-foreground capitalize">
                              {project.locationPref}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Required Skills */}
                    {project.skills.length > 0 && (
                      <div>
                        <div className="font-medium mb-2">Required Skills</div>
                        <div className="flex flex-wrap gap-2">
                          {project.skills.map((skill) => (
                            <Badge key={skill.id} variant="secondary">
                              {skill.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Application Tab - Now for both developers AND companies */}
              {canApply && (
                <TabsContent value="apply" className="space-y-6 mt-6">
                  {project.status === 'open' ? (
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          {hasApplied ? 'Application Submitted' : 'Apply for This Project'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {hasApplied ? (
                          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="text-green-800">
                              ✅ Your application has been submitted successfully! The project seeker will review it and get back to you soon.
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="application-message">
                                Why are you the right fit for this project?
                              </Label>
                              <Textarea
                                id="application-message"
                                placeholder={userRole === 'developer' 
                                  ? "Tell them about your relevant experience, approach to this project, and why you're interested..."
                                  : "Tell them about your team's experience, your company's approach to projects like this, and why you're the right choice..."
                                }
                                value={applicationMessage}
                                onChange={(e) => setApplicationMessage(e.target.value)}
                                className="min-h-[100px] mt-2"
                              />
                            </div>
                            <Button 
                              onClick={handleApply}
                              disabled={!applicationMessage.trim() || isApplying}
                              className="flex items-center gap-2"
                            >
                              <Send className="h-4 w-4" />
                              {isApplying ? 'Submitting...' : 'Submit Application'}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center py-8">
                          <div className="text-muted-foreground">
                            This project is no longer accepting applications.
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              )}

              {/* Smart Match Tab - Only for project owners */}
              {isOwner && (
                <TabsContent value="smart-match" className="mt-6">
                  <SmartMatchDisplay 
                    projectId={project.id}
                    context="project-overview"
                    projectSummary={{
                      title: project.title,
                      description: project.description,
                      budget: project.budgetMin || project.budgetMax ? {
                        min: project.budgetMin ? parseFloat(project.budgetMin) : undefined,
                        max: project.budgetMax ? parseFloat(project.budgetMax) : undefined,
                        currency: project.currency
                      } : undefined,
                      timeline: project.timeline || undefined
                    }}
                    onContactDeveloper={(id) => console.log('Contact developer:', id)}
                    onContactCompany={(id) => console.log('Contact company:', id)}
                  />
                </TabsContent>
              )}
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Seeker Info - UPDATED from company info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  About the Project Seeker
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={project.seeker.avatarUrl || undefined} />
                    <AvatarFallback>
                      {project.seeker.organizationName?.charAt(0) || 
                       project.seeker.displayName?.charAt(0) || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">
                      {project.seeker.organizationName || project.seeker.displayName}
                    </div>
                    {project.seeker.industry && (
                      <div className="text-sm text-muted-foreground">
                        {project.seeker.industry}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {project.seeker.companySize && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="capitalize">{project.seeker.companySize}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Project Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={project.status === 'open' ? 'default' : 'secondary'}>
                    {project.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Posted</span>
                  <span>{formatDate(project.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Skills Required</span>
                  <span>{project.skills.length}</span>
                </div>
                {project.complexity && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Complexity</span>
                    <span className="capitalize">{project.complexity}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
