'use client'

import { useState, useMemo } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { Button } from '@/components/ui/button'
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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#86868b]" />
      </div>
    )
  }

  const userRole = profile?.role || 'developer'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#1d1d1f]">
            {userRole === 'developer' ? 'Available Projects' : 'All Projects'}
          </h1>
          <p className="text-[#86868b] mt-2 text-lg">
            {userRole === 'developer'
              ? 'Discover exciting opportunities from top companies'
              : 'Browse all projects on the platform'
            }
          </p>
        </div>
        {userRole === 'company' && (
          <Button asChild className="rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white px-6 h-11">
            <Link href="/projects/new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Post Project
            </Link>
          </Button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#86868b]" />
          <input
            placeholder="Search projects, companies, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-white border border-black/10 text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full md:w-48 h-12 rounded-xl bg-white border-black/10 text-[#1d1d1f]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl bg-white border-black/10">
            {FILTER_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value} className="rounded-lg">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="text-sm text-[#86868b]">
        Showing {filteredProjects.length} of {projectsResult?.projects?.length || 0} projects
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Link
            key={project._id}
            href={`/projects/${project._id}`}
            className="group p-6 rounded-2xl bg-white border border-black/5 hover:border-black/10 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-[#1d1d1f] line-clamp-2 group-hover:text-[#0071e3] transition-colors">
                {project.title}
              </h3>
              <span className="flex-shrink-0 ml-3 text-xs text-[#86868b]">
                {formatDistanceToNow(project.createdAt, { addSuffix: true })}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-[#86868b] mb-4">
              <Building2 className="h-4 w-4" />
              {project.company?.companyName || 'Company'}
            </div>

            <p className="text-sm text-[#86868b] line-clamp-3 mb-4">
              {project.description}
            </p>

            {/* Budget */}
            <div className="flex items-center gap-2 text-sm mb-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#34c759]/10">
                <DollarSign className="h-3.5 w-3.5 text-[#34c759]" />
                <span className="text-[#34c759] font-medium text-xs">
                  {formatBudget(project.budgetMin, project.budgetMax, project.currency)}
                </span>
              </div>
            </div>

            {/* Timeline and Location */}
            <div className="flex items-center gap-4 text-xs text-[#86868b] mb-4">
              {project.timeline && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{project.timeline}</span>
                </div>
              )}
              {project.locationPref && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="capitalize">{project.locationPref}</span>
                </div>
              )}
            </div>

            {/* Skills */}
            {project.skills && project.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {project.skills.slice(0, 4).map((skill) => (
                  skill && (
                    <span key={skill._id} className="px-2.5 py-1 rounded-full bg-[#f5f5f7] text-[#1d1d1f] text-xs font-medium">
                      {skill.label}
                    </span>
                  )
                ))}
                {project.skills.length > 4 && (
                  <span className="px-2.5 py-1 rounded-full bg-[#f5f5f7] text-[#86868b] text-xs">
                    +{project.skills.length - 4}
                  </span>
                )}
              </div>
            )}

            {/* Application count */}
            {project.applicationCount > 0 && (
              <div className="text-xs text-[#86868b]">
                {project.applicationCount} application{project.applicationCount !== 1 ? 's' : ''}
              </div>
            )}
          </Link>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-16">
          <div className="text-[#86868b] mb-6 text-lg">
            {searchTerm || filter !== 'all'
              ? 'No projects match your search criteria'
              : 'No projects available at the moment'
            }
          </div>
          {userRole === 'company' && (
            <Button asChild className="rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white px-8 h-11">
              <Link href="/projects/new">Post the First Project</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
