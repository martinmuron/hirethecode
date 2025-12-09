'use client'

import { useState, useMemo } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DashboardNav } from '@/components/navigation/dashboard-nav'
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
  MapPin,
  Clock,
  DollarSign,
  Building2,
  Filter,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Projects' },
  { value: 'remote', label: 'Remote Only' },
  { value: 'recent', label: 'Posted Recently' },
  { value: 'budget-high', label: 'High Budget' }
]

const STATUS_COLORS = {
  open: 'bg-green-100 text-green-800 border-green-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  closed: 'bg-gray-100 text-gray-800 border-gray-200'
}

export function ProjectBoard() {
  const profile = useQuery(api.profiles.getCurrent)
  const projectsResult = useQuery(api.projects.list, { status: 'open', limit: 50 })

  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')

  const loading = profile === undefined || projectsResult === undefined

  const filteredProjects = useMemo(() => {
    if (!projectsResult?.projects) return []

    return projectsResult.projects.filter(project => {
      const matchesSearch = !searchTerm ||
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.skills?.some(skill => skill?.label?.toLowerCase().includes(searchTerm.toLowerCase()))

      if (!matchesSearch) return false

      switch (filter) {
        case 'remote':
          return project.locationPref === 'remote'
        case 'recent':
          const dayAgo = Date.now() - (24 * 60 * 60 * 1000)
          return project.createdAt > dayAgo
        case 'budget-high':
          return project.budgetMin && project.budgetMin > 10000
        default:
          return true
      }
    })
  }, [projectsResult?.projects, searchTerm, filter])

  const formatBudget = (min?: number, max?: number, currency = 'USD') => {
    if (!min && !max) return 'Budget not specified'
    if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`
    if (min) return `${currency} ${min.toLocaleString()}+`
    return `Up to ${currency} ${max!.toLocaleString()}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  const userRole = profile?.role || 'developer'

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <DashboardNav />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                {userRole === 'developer' ? 'Available Projects' : 'All Projects'}
              </h1>
              <p className="text-gray-500 mt-1">
                {userRole === 'developer'
                  ? 'Discover exciting opportunities from top companies'
                  : 'Browse all projects on the platform'
                }
              </p>
            </div>
            {userRole === 'company' && (
              <Button asChild className="rounded-full px-6">
                <Link href="/projects/new" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Post Project
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search projects, companies, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl border-gray-200"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48 rounded-xl border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FILTER_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="mb-4 text-sm text-gray-500">
          Showing {filteredProjects.length} of {projectsResult?.projects?.length || 0} projects
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project._id} className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <Link href={`/projects/${project._id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2 text-gray-900">
                      {project.title}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={`text-xs rounded-full ${STATUS_COLORS[project.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.open}`}
                    >
                      {formatDistanceToNow(project.createdAt, { addSuffix: true })}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Building2 className="h-4 w-4" />
                    {project.company?.companyName || 'Company'}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {project.description}
                  </p>

                  {/* Budget */}
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 font-medium">
                      {formatBudget(project.budgetMin, project.budgetMax, project.currency)}
                    </span>
                  </div>

                  {/* Timeline and Location */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {project.timeline && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{project.timeline}</span>
                      </div>
                    )}
                    {project.locationPref && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span className="capitalize">{project.locationPref}</span>
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  {project.skills && project.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.skills.slice(0, 4).map((skill) => (
                        skill && (
                          <Badge key={skill._id} variant="outline" className="text-xs rounded-full">
                            {skill.label}
                          </Badge>
                        )
                      ))}
                      {project.skills.length > 4 && (
                        <Badge variant="outline" className="text-xs rounded-full">
                          +{project.skills.length - 4} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Application count */}
                  {project.applicationCount > 0 && (
                    <div className="text-xs text-gray-400">
                      {project.applicationCount} application{project.applicationCount !== 1 ? 's' : ''}
                    </div>
                  )}
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              {searchTerm || filter !== 'all'
                ? 'No projects match your search criteria'
                : 'No projects available at the moment'
              }
            </div>
            {userRole === 'company' && (
              <Button asChild className="rounded-full">
                <Link href="/projects/new">Post the First Project</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
