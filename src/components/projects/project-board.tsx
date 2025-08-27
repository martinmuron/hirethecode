'use client'

import { useState, useEffect } from 'react'
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
  Filter
} from 'lucide-react'
import Link from 'next/link'

interface ProjectBoardProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  userRole: 'developer' | 'company' | 'admin'
  userId: string
}

interface Project {
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
  }
  skills: Array<{
    id: number
    slug: string
    label: string
  }>
}

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Projects' },
  { value: 'remote', label: 'Remote Only' },
  { value: 'recent', label: 'Posted Recently' },
  { value: 'budget-high', label: 'High Budget' }
]

export function ProjectBoard({ user, userRole, userId }: ProjectBoardProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects)
      }
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.company.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.skills.some(skill => skill.label.toLowerCase().includes(searchTerm.toLowerCase()))

    if (!matchesSearch) return false

    switch (filter) {
      case 'remote':
        return project.locationPref === 'remote'
      case 'recent':
        const dayAgo = new Date()
        dayAgo.setDate(dayAgo.getDate() - 1)
        return new Date(project.createdAt) > dayAgo
      case 'budget-high':
        return project.budgetMin && parseFloat(project.budgetMin) > 10000
      default:
        return true
    }
  })

  const formatBudget = (min: string | null, max: string | null, currency: string) => {
    if (!min && !max) return 'Budget not specified'
    if (min && max) return `${currency} ${parseFloat(min).toLocaleString()} - ${parseFloat(max).toLocaleString()}`
    if (min) return `${currency} ${parseFloat(min).toLocaleString()}+`
    return `Up to ${currency} ${parseFloat(max!).toLocaleString()}`
  }

  const formatTimeAgo = (date: string) => {
    const now = new Date()
    const posted = new Date(date)
    const diffInHours = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just posted'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} role={userRole} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                {userRole === 'developer' ? 'Available Projects' : 'All Projects'}
              </h1>
              <p className="text-muted-foreground">
                {userRole === 'developer' 
                  ? 'Discover exciting opportunities from top companies'
                  : 'Browse all projects on the platform'
                }
              </p>
            </div>
            {userRole === 'company' && (
              <Button asChild>
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects, companies, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
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
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredProjects.length} of {projects.length} projects
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <Link href={`/projects/${project.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg line-clamp-2">
                          {project.title}
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {formatTimeAgo(project.createdAt)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        {project.company.displayName || 'Company'}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {project.description}
                      </p>

                      {/* Budget */}
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span>{formatBudget(project.budgetMin, project.budgetMax, project.currency)}</span>
                      </div>

                      {/* Timeline and Location */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                      {project.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {project.skills.slice(0, 4).map((skill) => (
                            <Badge key={skill.id} variant="outline" className="text-xs">
                              {skill.label}
                            </Badge>
                          ))}
                          {project.skills.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{project.skills.length - 4} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>

            {filteredProjects.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  {searchTerm || filter !== 'all' 
                    ? 'No projects match your search criteria'
                    : 'No projects available at the moment'
                  }
                </div>
                {userRole === 'company' && (
                  <Button asChild>
                    <Link href="/projects/new">Post the First Project</Link>
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}