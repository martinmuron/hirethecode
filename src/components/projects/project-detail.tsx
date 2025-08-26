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
  Building2, 
  MapPin, 
  Clock, 
  DollarSign, 
  Calendar, 
  ExternalLink,
  Send,
  Edit,
  Globe,
  Users
} from 'lucide-react'
import Link from 'next/link'

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
    createdAt: string
    company: {
      id: string
      displayName: string | null
      avatarUrl: string | null
      companyName: string | null
      about: string | null
      websiteUrl: string | null
      industry: string | null
      size: string | null
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
  userRole: 'developer' | 'company'
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

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} role={userRole} />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/projects">← Back to Projects</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{project.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Posted {formatDate(project.createdAt)}</span>
                      </div>
                      <Badge variant={project.status === 'open' ? 'default' : 'secondary'}>
                        {project.status}
                      </Badge>
                    </div>
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

            {/* Application Section - Only for developers */}
            {userRole === 'developer' && !isOwner && project.status === 'open' && (
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
                        ✅ Your application has been submitted successfully! The company will review it and get back to you soon.
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
                          placeholder="Tell the company about your relevant experience, approach to this project, and why you're interested..."
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
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  About the Company
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={project.company.avatarUrl || undefined} />
                    <AvatarFallback>
                      {project.company.companyName?.charAt(0) || 
                       project.company.displayName?.charAt(0) || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">
                      {project.company.companyName || project.company.displayName}
                    </div>
                    {project.company.industry && (
                      <div className="text-sm text-muted-foreground">
                        {project.company.industry}
                      </div>
                    )}
                  </div>
                </div>

                {project.company.about && (
                  <p className="text-sm text-muted-foreground">
                    {project.company.about}
                  </p>
                )}

                <div className="space-y-2 text-sm">
                  {project.company.size && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="capitalize">{project.company.size}</span>
                    </div>
                  )}
                  {project.company.websiteUrl && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <a 
                        href={project.company.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Visit Website
                        <ExternalLink className="h-3 w-3" />
                      </a>
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}