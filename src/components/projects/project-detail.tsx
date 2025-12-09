'use client'

import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import { Id } from '@convex/_generated/dataModel'
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
  Users,
  Brain,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SmartMatchResults } from './smart-match-results'

interface ProjectDetailProps {
  projectId: Id<'projects'>
}

const STATUS_COLORS = {
  open: 'bg-green-100 text-green-800 border-green-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  closed: 'bg-gray-100 text-gray-800 border-gray-200'
}

export function ProjectDetail({ projectId }: ProjectDetailProps) {
  const profile = useQuery(api.profiles.getCurrent)
  const project = useQuery(api.projects.get, { id: projectId })
  const applyToProject = useMutation(api.applications.create)

  const [applicationMessage, setApplicationMessage] = useState('')
  const [isApplying, setIsApplying] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)

  if (profile === undefined || project === undefined) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!project) {
    notFound()
  }

  const handleApply = async () => {
    if (!applicationMessage.trim() || !profile) return

    setIsApplying(true)
    try {
      await applyToProject({
        projectId: projectId,
        message: applicationMessage.trim()
      })
      setHasApplied(true)
      setApplicationMessage('')
    } catch (error) {
      console.error('Error applying to project:', error)
    } finally {
      setIsApplying(false)
    }
  }

  const formatBudget = (min?: number, max?: number, currency = 'USD') => {
    if (!min && !max) return 'Budget negotiable'
    if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`
    if (min) return `${currency} ${min.toLocaleString()}+`
    return `Up to ${currency} ${max!.toLocaleString()}`
  }

  const formatDate = (date: number) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const userRole = profile?.role || 'developer'
  const isOwner = profile?._id === project.companyId

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <DashboardNav />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Button variant="ghost" asChild className="rounded-full">
            <Link href="/projects">← Back to Projects</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Project Header */}
            <Card className="mb-6 bg-white border-gray-100 shadow-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2 text-gray-900">{project.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Posted {formatDate(project.createdAt)}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`capitalize rounded-full ${STATUS_COLORS[project.status as keyof typeof STATUS_COLORS]}`}
                      >
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  {isOwner && (
                    <Button size="sm" variant="outline" asChild className="rounded-full">
                      <Link href={`/projects/${project._id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-base leading-relaxed whitespace-pre-wrap text-gray-600">
                    {project.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Tabs for different views */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3 rounded-xl">
                <TabsTrigger value="details" className="rounded-xl">Project Details</TabsTrigger>
                {userRole === 'developer' && !isOwner && (
                  <TabsTrigger value="apply" className="rounded-xl">Apply</TabsTrigger>
                )}
                {isOwner && (
                  <TabsTrigger value="smart-match" className="rounded-xl">
                    <Brain className="h-4 w-4 mr-1" />
                    Smart Match
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="details" className="space-y-6 mt-6">
                {/* Project Details */}
                <Card className="bg-white border-gray-100 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Project Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="font-medium text-gray-900">Budget</div>
                          <div className="text-sm text-gray-500">
                            {formatBudget(project.budgetMin, project.budgetMax, project.currency)}
                          </div>
                        </div>
                      </div>

                      {project.timeline && (
                        <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                          <Clock className="h-5 w-5 text-blue-600" />
                          <div>
                            <div className="font-medium text-gray-900">Timeline</div>
                            <div className="text-sm text-gray-500">{project.timeline}</div>
                          </div>
                        </div>
                      )}

                      {project.locationPref && (
                        <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                          <MapPin className="h-5 w-5 text-red-600" />
                          <div>
                            <div className="font-medium text-gray-900">Location</div>
                            <div className="text-sm text-gray-500 capitalize">
                              {project.locationPref}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Required Skills */}
                    {project.skills && project.skills.length > 0 && (
                      <div>
                        <div className="font-medium mb-2 text-gray-900">Required Skills</div>
                        <div className="flex flex-wrap gap-2">
                          {project.skills.map((skill) => (
                            skill && (
                              <Badge key={skill._id} variant="secondary" className="rounded-full">
                                {skill.label}
                              </Badge>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Application Tab - Only for developers */}
              {userRole === 'developer' && !isOwner && (
                <TabsContent value="apply" className="space-y-6 mt-6">
                  {project.status === 'open' ? (
                    <Card className="bg-white border-gray-100 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-gray-900">
                          {hasApplied ? 'Application Submitted' : 'Apply for This Project'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {hasApplied ? (
                          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                            <div className="text-green-800">
                              Your application has been submitted successfully! The company will review it and get back to you soon.
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="application-message" className="text-gray-700">
                                Why are you the right fit for this project?
                              </Label>
                              <Textarea
                                id="application-message"
                                placeholder="Tell the company about your relevant experience, approach to this project, and why you're interested..."
                                value={applicationMessage}
                                onChange={(e) => setApplicationMessage(e.target.value)}
                                className="min-h-[100px] mt-2 rounded-xl border-gray-200"
                              />
                            </div>
                            <Button
                              onClick={handleApply}
                              disabled={!applicationMessage.trim() || isApplying}
                              className="flex items-center gap-2 rounded-full"
                            >
                              <Send className="h-4 w-4" />
                              {isApplying ? 'Submitting...' : 'Submit Application'}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="bg-white border-gray-100 shadow-sm">
                      <CardContent className="pt-6">
                        <div className="text-center py-8">
                          <div className="text-gray-500">
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
                  <SmartMatchResults projectId={project._id} />
                </TabsContent>
              )}
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Info */}
            <Card className="bg-white border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Building2 className="h-5 w-5" />
                  About the Company
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 ring-2 ring-gray-100">
                    <AvatarImage src={project.company?.logoUrl || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {project.company?.companyName?.charAt(0) || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {project.company?.companyName || 'Company'}
                    </div>
                    {project.company?.industry && (
                      <div className="text-sm text-gray-500">
                        {project.company.industry}
                      </div>
                    )}
                  </div>
                </div>

                {project.company?.about && (
                  <p className="text-sm text-gray-600">
                    {project.company.about}
                  </p>
                )}

                <div className="space-y-2 text-sm">
                  {project.company?.size && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Users className="h-4 w-4" />
                      <span className="capitalize">{project.company.size}</span>
                    </div>
                  )}
                  {project.company?.websiteUrl && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-500" />
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
            <Card className="bg-white border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900">Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <Badge
                    variant="outline"
                    className={`capitalize rounded-full ${STATUS_COLORS[project.status as keyof typeof STATUS_COLORS]}`}
                  >
                    {project.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Posted</span>
                  <span className="text-gray-900">{formatDate(project.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Skills Required</span>
                  <span className="text-gray-900">{project.skills?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Applications</span>
                  <span className="text-gray-900">{project.applicationCount || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
