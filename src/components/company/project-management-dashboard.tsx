'use client'

import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
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
  Clock,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Id } from '@convex/_generated/dataModel'

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

export function ProjectManagementDashboard() {
  const profile = useQuery(api.profiles.getCurrent)
  const projects = useQuery(api.projects.getByCompany, {})
  const updateApplicationStatus = useMutation(api.applications.updateStatus)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  if (profile === undefined || projects === undefined) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  const filteredProjects = (projects || []).filter(project => {
    const matchesSearch = !searchTerm ||
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || project.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleApplicationStatusUpdate = async (applicationId: string, status: 'accepted' | 'rejected') => {
    try {
      await updateApplicationStatus({
        applicationId: applicationId as Id<'projectApplications'>,
        status
      })
    } catch (error) {
      console.error('Error updating application status:', error)
    }
  }

  const formatBudget = (min?: number, max?: number, currency = 'USD') => {
    if (!min && !max) return 'Budget not specified'
    if (min && max) {
      return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`
    }
    if (min) return `From ${currency} ${min.toLocaleString()}`
    if (max) return `Up to ${currency} ${max.toLocaleString()}`
    return 'Budget not specified'
  }

  const formatRate = (rate?: number) => {
    if (!rate) return 'Rate not specified'
    return `$${rate.toLocaleString()}/hr`
  }

  // Calculate stats
  const totalProjects = projects?.length || 0
  const openProjects = projects?.filter(p => p.status === 'open').length || 0
  const totalApplications = projects?.reduce((sum, p) => sum + (p.applicationCount || 0), 0) || 0
  const pendingApplications = projects?.reduce((sum, p) => {
    const pending = p.applications?.filter(a => a && a.status === 'pending').length || 0
    return sum + pending
  }, 0) || 0

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <DashboardNav />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Project Management</h1>
            <p className="text-gray-500 mt-1">
              Manage your projects and track applications
            </p>
          </div>
          <Button asChild className="rounded-full px-6">
            <Link href="/projects/new">
              <Plus className="h-4 w-4 mr-2" />
              Post New Project
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-gray-900">{totalProjects}</div>
              <p className="text-xs text-gray-500">
                {openProjects} open projects
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-gray-900">{totalApplications}</div>
              <p className="text-xs text-gray-500">
                Across all projects
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Pending Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-yellow-600">{pendingApplications}</div>
              <p className="text-xs text-gray-500">
                Awaiting your review
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Active Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-blue-600">
                {projects?.filter(p => p.status === 'in_progress').length || 0}
              </div>
              <p className="text-xs text-gray-500">
                In progress
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl border-gray-200"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 rounded-xl border-gray-200">
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
            <Card key={project._id} className="bg-white border-gray-100 shadow-sm overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl text-gray-900">{project.title}</CardTitle>
                      <Badge
                        variant="outline"
                        className={`capitalize rounded-full ${PROJECT_STATUS_COLORS[project.status as keyof typeof PROJECT_STATUS_COLORS]}`}
                      >
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-gray-500 line-clamp-2 mb-3">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
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
                    <Button size="sm" variant="outline" asChild className="rounded-full">
                      <Link href={`/projects/${project._id}`}>
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Applications Summary */}
              <CardContent className="pt-0">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">{project.applicationCount || 0} Applications</span>
                    </div>
                    {(project.applications?.filter(a => a && a.status === 'pending').length || 0) > 0 && (
                      <div className="flex items-center gap-1">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <span className="text-yellow-600 font-medium">
                          {project.applications?.filter(a => a && a.status === 'pending').length || 0} Pending Review
                        </span>
                      </div>
                    )}
                  </div>
                  {project.applications && project.applications.length > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-full"
                      onClick={() => setSelectedProject(
                        selectedProject === project._id ? null : project._id
                      )}
                    >
                      {selectedProject === project._id ? 'Hide' : 'Show'} Applications
                    </Button>
                  )}
                </div>

                {/* Expanded Applications */}
                {selectedProject === project._id && project.applications && project.applications.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <h4 className="font-medium text-sm">Applications ({project.applications.length})</h4>
                    {project.applications.filter((app): app is NonNullable<typeof app> => app !== null).map((application) => (
                      <div key={application._id} className="border border-gray-100 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={application.developer?.profile?.avatarUrl || undefined} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                                {application.developer?.profile?.displayName?.charAt(0) || 'D'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-gray-900">
                                {application.developer?.profile?.displayName || 'Developer'}
                              </div>
                              {application.developer?.developerProfile?.headline && (
                                <div className="text-sm text-gray-500">
                                  {application.developer.developerProfile.headline}
                                </div>
                              )}
                              <div className="flex items-center gap-3 mt-1">
                                {application.developer?.developerProfile?.rate && (
                                  <span className="text-sm text-green-600">
                                    {formatRate(application.developer.developerProfile.rate)}
                                  </span>
                                )}
                                {application.developer?.developerProfile?.availability && (
                                  <span className="text-sm text-gray-500 capitalize">
                                    {application.developer.developerProfile.availability}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`capitalize rounded-full ${getApplicationStatusColor(application.status)}`}
                            >
                              {application.status || 'unknown'}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {formatDistanceToNow(application.createdAt, { addSuffix: true })}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm mb-3 line-clamp-3 text-gray-600">{application.message}</p>

                        <div className="flex items-center justify-between">
                          <Button size="sm" variant="outline" asChild className="rounded-full">
                            <Link href={`/developers/${application.developerId}`}>
                              View Profile
                            </Link>
                          </Button>

                          {application.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApplicationStatusUpdate(application._id, 'accepted')}
                                className="bg-green-600 hover:bg-green-700 rounded-full"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full"
                                onClick={() => handleApplicationStatusUpdate(application._id, 'rejected')}
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
              <div className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'No projects match your filters'
                  : 'No projects found'
                }
              </div>
              {!searchTerm && statusFilter === 'all' && (
                <Button asChild className="rounded-full">
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
