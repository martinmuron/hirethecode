'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DashboardNav } from '@/components/navigation/dashboard-nav'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Search, 
  Plus, 
  Eye, 
  MessageSquare, 
  Clock, 
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Filter,
  MoreVertical
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface ProjectManagementDashboardProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  projects: Array<{
    id: string
    title: string
    description: string
    budgetMin: string | null
    budgetMax: string | null
    currency: string
    timeline: string | null
    status: string
    createdAt: Date
    applicationCount: number
    pendingCount: number
    applications: Array<{
      id: string
      projectId: string
      message: string
      status: string | null
      createdAt: Date
      developer: {
        id: string
        displayName: string | null
        avatarUrl: string | null
        email: string
      }
      developerProfile: {
        headline: string | null
        rate: string | null
        availability: string | null
      } | null
    }>
  }>
  companyId: string
}

const PROJECT_STATUS_COLORS = {
  open: 'bg-green-100 text-green-800 border-green-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  closed: 'bg-gray-100 text-gray-800 border-gray-200'
}

const APPLICATION_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  accepted: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200'
}

const getApplicationStatusColor = (status: string | null) => {
  if (!status) return 'bg-gray-100 text-gray-800 border-gray-200'
  return APPLICATION_STATUS_COLORS[status as keyof typeof APPLICATION_STATUS_COLORS] || 'bg-gray-100 text-gray-800 border-gray-200'
}

export function ProjectManagementDashboard({ 
  user, 
  projects, 
  companyId 
}: ProjectManagementDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  const filteredProjects = projects.filter(project => {
    const matchesSearch = !searchTerm || 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleApplicationStatusUpdate = async (applicationId: string, status: string) => {
    try {
      const response = await fetch('/api/applications/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, status })
      })
      
      if (response.ok) {
        // Refresh the page to show updated data
        window.location.reload()
      }
    } catch (error) {
      console.error('Error updating application status:', error)
    }
  }

  const formatBudget = (min: string | null, max: string | null, currency: string) => {
    if (!min && !max) return 'Budget not specified'
    if (min && max) {
      return `${currency} ${parseFloat(min).toLocaleString()} - ${parseFloat(max).toLocaleString()}`
    }
    if (min) return `From ${currency} ${parseFloat(min).toLocaleString()}`
    if (max) return `Up to ${currency} ${parseFloat(max).toLocaleString()}`
    return 'Budget not specified'
  }

  const formatRate = (rate: string | null) => {
    if (!rate) return 'Rate not specified'
    return `$${parseFloat(rate).toLocaleString()}/hr`
  }

  // Calculate stats
  const totalProjects = projects.length
  const openProjects = projects.filter(p => p.status === 'open').length
  const totalApplications = projects.reduce((sum, p) => sum + p.applicationCount, 0)
  const pendingApplications = projects.reduce((sum, p) => sum + p.pendingCount, 0)

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav role="company" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Project Management</h1>
            <p className="text-muted-foreground">
              Manage your projects and track applications
            </p>
          </div>
          <Button asChild>
            <Link href="/projects/new">
              <Plus className="h-4 w-4 mr-2" />
              Post New Project
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                {openProjects} open projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalApplications}</div>
              <p className="text-xs text-muted-foreground">
                Across all projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingApplications}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting your review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {projects.filter(p => p.status === 'in_progress').length}
              </div>
              <p className="text-xs text-muted-foreground">
                In progress
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Projects List */}
        <div className="space-y-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{project.title}</CardTitle>
                      <Badge 
                        variant="outline" 
                        className={`capitalize ${PROJECT_STATUS_COLORS[project.status as keyof typeof PROJECT_STATUS_COLORS]}`}
                      >
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground line-clamp-2 mb-3">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatBudget(project.budgetMin, project.budgetMax, project.currency)}</span>
                      </div>
                      {project.timeline && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{project.timeline}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDistanceToNow(project.createdAt, { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/projects/${project.id}`}>
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Applications Summary */}
              <CardContent className="pt-0">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">{project.applicationCount} Applications</span>
                    </div>
                    {project.pendingCount > 0 && (
                      <div className="flex items-center gap-1">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <span className="text-yellow-600 font-medium">
                          {project.pendingCount} Pending Review
                        </span>
                      </div>
                    )}
                  </div>
                  {project.applications.length > 0 && (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setSelectedProject(
                        selectedProject === project.id ? null : project.id
                      )}
                    >
                      {selectedProject === project.id ? 'Hide' : 'Show'} Applications
                    </Button>
                  )}
                </div>

                {/* Expanded Applications */}
                {selectedProject === project.id && project.applications.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <h4 className="font-medium text-sm">Applications ({project.applications.length})</h4>
                    {project.applications.map((application) => (
                      <div key={application.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={application.developer.avatarUrl || undefined} />
                              <AvatarFallback>
                                {application.developer.displayName?.charAt(0) || 'D'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {application.developer.displayName || 'Developer'}
                              </div>
                              {application.developerProfile?.headline && (
                                <div className="text-sm text-muted-foreground">
                                  {application.developerProfile.headline}
                                </div>
                              )}
                              <div className="flex items-center gap-3 mt-1">
                                {application.developerProfile?.rate && (
                                  <span className="text-sm text-green-600">
                                    {formatRate(application.developerProfile.rate)}
                                  </span>
                                )}
                                {application.developerProfile?.availability && (
                                  <span className="text-sm text-muted-foreground capitalize">
                                    {application.developerProfile.availability}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={`capitalize ${getApplicationStatusColor(application.status)}`}
                            >
                              {application.status || 'unknown'}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(application.createdAt, { addSuffix: true })}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm mb-3 line-clamp-3">{application.message}</p>

                        <div className="flex items-center justify-between">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/developers/${application.developer.id}`}>
                              View Profile
                            </Link>
                          </Button>

                          {application.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button 
                                size="sm"
                                onClick={() => handleApplicationStatusUpdate(application.id, 'accepted')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Accept
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleApplicationStatusUpdate(application.id, 'rejected')}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'No projects match your filters'
                  : 'No projects found'
                }
              </div>
              {!searchTerm && statusFilter === 'all' && (
                <Button asChild>
                  <Link href="/projects/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Post Your First Project
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
