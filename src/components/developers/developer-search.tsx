'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import { Id } from '@convex/_generated/dataModel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  MapPin,
  DollarSign,
  Filter,
  Globe,
  Github,
  Briefcase,
  Mail,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

const AVAILABILITY_FILTERS = [
  { value: 'all', label: 'All Developers' },
  { value: 'available', label: 'Available Now' },
  { value: 'busy', label: 'Busy' },
  { value: 'unavailable', label: 'Unavailable' }
]

const RATE_FILTERS = [
  { value: 'all', label: 'All Rates' },
  { value: '0-50', label: '$0 - $50/hr' },
  { value: '50-100', label: '$50 - $100/hr' },
  { value: '100-150', label: '$100 - $150/hr' },
  { value: '150+', label: '$150+/hr' }
]

const SKILL_FILTERS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java',
  'Go', 'Rust', 'AWS', 'Docker', 'PostgreSQL', 'MongoDB'
]

export function DeveloperSearch() {
  const profile = useQuery(api.profiles.getCurrent)
  const skills = useQuery(api.skills.list)

  const [searchTerm, setSearchTerm] = useState('')
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'busy' | 'unavailable'>('all')
  const [rateFilter, setRateFilter] = useState('all')
  const [skillFilter, setSkillFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')

  // Parse rate filter into min/max values
  const rateRange = useMemo(() => {
    switch (rateFilter) {
      case '0-50': return { min: 0, max: 50 }
      case '50-100': return { min: 50, max: 100 }
      case '100-150': return { min: 100, max: 150 }
      case '150+': return { min: 150, max: undefined }
      default: return { min: undefined, max: undefined }
    }
  }, [rateFilter])

  // Find skill slug for filter
  const skillSlug = useMemo(() => {
    if (skillFilter === 'all' || !skills) return undefined
    const skill = skills.find(s => s.label === skillFilter)
    return skill?.slug
  }, [skillFilter, skills])

  const developersResult = useQuery(api.developers.search, {
    availability: availabilityFilter === 'all' ? undefined : availabilityFilter,
    rateMin: rateRange.min,
    rateMax: rateRange.max,
    skillSlug: skillSlug,
    sort: sortBy,
    limit: 50
  })

  const sendContact = useMutation(api.contacts.create)

  const loading = profile === undefined || developersResult === undefined

  // Client-side search filtering
  const filteredDevelopers = useMemo(() => {
    if (!developersResult?.developers) return []

    if (!searchTerm) return developersResult.developers

    const searchLower = searchTerm.toLowerCase()
    return developersResult.developers.filter(dev => {
      return (
        dev.profile?.displayName?.toLowerCase().includes(searchLower) ||
        dev.developerProfile?.headline?.toLowerCase().includes(searchLower) ||
        dev.developerProfile?.bio?.toLowerCase().includes(searchLower) ||
        dev.developerProfile?.country?.toLowerCase().includes(searchLower) ||
        dev.skills?.some(skill => skill?.label?.toLowerCase().includes(searchLower))
      )
    })
  }, [developersResult?.developers, searchTerm])

  const getAvailabilityColor = (availability: string | null | undefined) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200'
      case 'busy': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'unavailable': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatRate = (rate: number | null | undefined) => {
    if (!rate) return 'Rate not specified'
    return `$${rate.toLocaleString()}/hr`
  }

  const handleContact = async (developerId: Id<'profiles'>) => {
    if (!profile) return

    try {
      await sendContact({
        developerId,
        message: 'I would like to connect with you about a potential project opportunity.'
      })
    } catch (error) {
      console.error('Error sending contact request:', error)
    }
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
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Find Developers</h1>
          <p className="text-gray-500 mt-1">
            Discover talented developers for your projects
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search developers by name, skills, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl border-gray-200"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-600">Filters:</span>
            </div>

            <Select value={availabilityFilter} onValueChange={(v) => setAvailabilityFilter(v as typeof availabilityFilter)}>
              <SelectTrigger className="w-48 rounded-xl border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABILITY_FILTERS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={rateFilter} onValueChange={setRateFilter}>
              <SelectTrigger className="w-48 rounded-xl border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RATE_FILTERS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={skillFilter} onValueChange={setSkillFilter}>
              <SelectTrigger className="w-48 rounded-xl border-gray-200">
                <SelectValue placeholder="Filter by skill" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Skills</SelectItem>
                {SKILL_FILTERS.map(skill => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 rounded-xl border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recently Joined</SelectItem>
                <SelectItem value="rate-low">Rate: Low to High</SelectItem>
                <SelectItem value="rate-high">Rate: High to Low</SelectItem>
                <SelectItem value="available">Available First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4 text-sm text-gray-500">
          Showing {filteredDevelopers.length} developers
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevelopers.map((developer) => (
            <Card key={developer.id} className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 ring-2 ring-gray-100">
                      <AvatarImage src={developer.profile?.avatarUrl || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        {developer.profile?.displayName?.charAt(0) || 'D'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg text-gray-900">
                        {developer.profile?.displayName || 'Developer'}
                      </CardTitle>
                      {developer.developerProfile?.headline && (
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {developer.developerProfile.headline}
                        </p>
                      )}
                    </div>
                  </div>
                  {developer.developerProfile?.availability && (
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize rounded-full ${getAvailabilityColor(developer.developerProfile.availability)}`}
                    >
                      {developer.developerProfile.availability}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Bio */}
                {developer.developerProfile?.bio && (
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {developer.developerProfile.bio}
                  </p>
                )}

                {/* Rate and Location */}
                <div className="flex items-center justify-between text-sm">
                  {developer.developerProfile?.rate && (
                    <div className="flex items-center gap-1 text-green-600 font-medium">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatRate(developer.developerProfile.rate)}</span>
                    </div>
                  )}
                  {developer.developerProfile?.country && (
                    <div className="flex items-center gap-1 text-gray-500">
                      <MapPin className="h-4 w-4" />
                      <span>{developer.developerProfile.country}</span>
                    </div>
                  )}
                </div>

                {/* Skills */}
                {developer.skills && developer.skills.length > 0 && (
                  <div>
                    <div className="flex flex-wrap gap-1">
                      {developer.skills.slice(0, 4).map((skill) => (
                        skill && (
                          <Badge key={skill._id} variant="secondary" className="text-xs rounded-full">
                            {skill.label}
                          </Badge>
                        )
                      ))}
                      {developer.skills.length > 4 && (
                        <Badge variant="secondary" className="text-xs rounded-full">
                          +{developer.skills.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Links */}
                <div className="flex items-center gap-2">
                  {developer.developerProfile?.portfolioUrl && (
                    <Button size="sm" variant="outline" asChild className="rounded-full">
                      <a href={developer.developerProfile.portfolioUrl} target="_blank" rel="noopener noreferrer">
                        <Briefcase className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                  {developer.developerProfile?.githubUrl && (
                    <Button size="sm" variant="outline" asChild className="rounded-full">
                      <a href={developer.developerProfile.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                  {developer.developerProfile?.websiteUrl && (
                    <Button size="sm" variant="outline" asChild className="rounded-full">
                      <a href={developer.developerProfile.websiteUrl} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  {userRole === 'company' && (
                    <Button
                      size="sm"
                      className="flex-1 flex items-center gap-2 rounded-full"
                      onClick={() => handleContact(developer.id)}
                    >
                      <Mail className="h-3 w-3" />
                      Contact
                    </Button>
                  )}
                  <Button size="sm" variant="outline" asChild className={`rounded-full ${userRole !== 'company' ? 'flex-1' : ''}`}>
                    <Link href={`/developers/${developer.id}`}>
                      View Profile
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDevelopers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              {searchTerm || availabilityFilter !== 'all' || rateFilter !== 'all' || skillFilter !== 'all'
                ? 'No developers match your search criteria'
                : 'No developers available at the moment'
              }
            </div>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => {
                setSearchTerm('')
                setAvailabilityFilter('all')
                setRateFilter('all')
                setSkillFilter('all')
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
