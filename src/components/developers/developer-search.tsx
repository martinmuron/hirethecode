'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import { Id } from '@convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  Globe,
  Github,
  Briefcase,
  Mail,
  Loader2,
  Check
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

  const getAvailabilityStyle = (availability: string | null | undefined) => {
    switch (availability) {
      case 'available': return 'bg-[#34c759]/10 text-[#34c759]'
      case 'busy': return 'bg-[#ff9500]/10 text-[#ff9500]'
      case 'unavailable': return 'bg-[#ff3b30]/10 text-[#ff3b30]'
      default: return 'bg-[#86868b]/10 text-[#86868b]'
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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#86868b]" />
      </div>
    )
  }

  const userRole = profile?.role || 'developer'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#1d1d1f]">
          Find Developers
        </h1>
        <p className="text-[#86868b] mt-2 text-lg">
          Discover talented developers for your projects
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#86868b]" />
          <input
            placeholder="Search developers by name, skills, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-white border border-black/10 text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Select value={availabilityFilter} onValueChange={(v) => setAvailabilityFilter(v as typeof availabilityFilter)}>
            <SelectTrigger className="w-40 h-10 rounded-xl bg-white border-black/10 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-white border-black/10">
              {AVAILABILITY_FILTERS.map(option => (
                <SelectItem key={option.value} value={option.value} className="rounded-lg">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={rateFilter} onValueChange={setRateFilter}>
            <SelectTrigger className="w-40 h-10 rounded-xl bg-white border-black/10 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-white border-black/10">
              {RATE_FILTERS.map(option => (
                <SelectItem key={option.value} value={option.value} className="rounded-lg">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={skillFilter} onValueChange={setSkillFilter}>
            <SelectTrigger className="w-40 h-10 rounded-xl bg-white border-black/10 text-sm">
              <SelectValue placeholder="Filter by skill" />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-white border-black/10">
              <SelectItem value="all" className="rounded-lg">All Skills</SelectItem>
              {SKILL_FILTERS.map(skill => (
                <SelectItem key={skill} value={skill} className="rounded-lg">
                  {skill}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-44 h-10 rounded-xl bg-white border-black/10 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-white border-black/10">
              <SelectItem value="recent" className="rounded-lg">Recently Joined</SelectItem>
              <SelectItem value="rate-low" className="rounded-lg">Rate: Low to High</SelectItem>
              <SelectItem value="rate-high" className="rounded-lg">Rate: High to Low</SelectItem>
              <SelectItem value="available" className="rounded-lg">Available First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-[#86868b]">
        Showing {filteredDevelopers.length} developers
      </div>

      {/* Developer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDevelopers.map((developer) => (
          <div key={developer.id} className="p-6 rounded-2xl bg-white border border-black/5 hover:border-black/10 hover:shadow-lg transition-all duration-300">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 ring-2 ring-black/5">
                  <AvatarImage src={developer.profile?.avatarUrl || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-[#0071e3] to-[#5856d6] text-white">
                    {developer.profile?.displayName?.charAt(0) || 'D'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-base font-semibold text-[#1d1d1f]">
                    {developer.profile?.displayName || 'Developer'}
                  </h3>
                  {developer.developerProfile?.headline && (
                    <p className="text-sm text-[#86868b] line-clamp-1">
                      {developer.developerProfile.headline}
                    </p>
                  )}
                </div>
              </div>
              {developer.developerProfile?.availability && (
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getAvailabilityStyle(developer.developerProfile.availability)}`}>
                  {developer.developerProfile.availability === 'available' && (
                    <Check className="h-3 w-3 mr-1" />
                  )}
                  {developer.developerProfile.availability}
                </span>
              )}
            </div>

            {/* Bio */}
            {developer.developerProfile?.bio && (
              <p className="text-sm text-[#86868b] line-clamp-3 mb-4">
                {developer.developerProfile.bio}
              </p>
            )}

            {/* Rate and Location */}
            <div className="flex items-center justify-between text-sm mb-4">
              {developer.developerProfile?.rate && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#34c759]/10">
                  <DollarSign className="h-3.5 w-3.5 text-[#34c759]" />
                  <span className="text-[#34c759] font-medium text-xs">
                    {formatRate(developer.developerProfile.rate)}
                  </span>
                </div>
              )}
              {developer.developerProfile?.country && (
                <div className="flex items-center gap-1.5 text-[#86868b]">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="text-xs">{developer.developerProfile.country}</span>
                </div>
              )}
            </div>

            {/* Skills */}
            {developer.skills && developer.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {developer.skills.slice(0, 4).map((skill) => (
                  skill && (
                    <span key={skill._id} className="px-2.5 py-1 rounded-full bg-[#f5f5f7] text-[#1d1d1f] text-xs font-medium">
                      {skill.label}
                    </span>
                  )
                ))}
                {developer.skills.length > 4 && (
                  <span className="px-2.5 py-1 rounded-full bg-[#f5f5f7] text-[#86868b] text-xs">
                    +{developer.skills.length - 4}
                  </span>
                )}
              </div>
            )}

            {/* Links */}
            <div className="flex items-center gap-2 mb-4">
              {developer.developerProfile?.portfolioUrl && (
                <a
                  href={developer.developerProfile.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                >
                  <Briefcase className="h-4 w-4" />
                </a>
              )}
              {developer.developerProfile?.githubUrl && (
                <a
                  href={developer.developerProfile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                >
                  <Github className="h-4 w-4" />
                </a>
              )}
              {developer.developerProfile?.websiteUrl && (
                <a
                  href={developer.developerProfile.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                >
                  <Globe className="h-4 w-4" />
                </a>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {userRole === 'company' && (
                <Button
                  size="sm"
                  className="flex-1 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white h-10"
                  onClick={() => handleContact(developer.id)}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact
                </Button>
              )}
              <Link
                href={`/developers/${developer.id}`}
                className={`inline-flex items-center justify-center h-10 rounded-full border border-black/10 text-sm font-medium text-[#1d1d1f] hover:bg-black/5 transition-colors ${userRole !== 'company' ? 'flex-1' : 'px-4'}`}
              >
                View Profile
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredDevelopers.length === 0 && (
        <div className="text-center py-16">
          <div className="text-[#86868b] mb-6 text-lg">
            {searchTerm || availabilityFilter !== 'all' || rateFilter !== 'all' || skillFilter !== 'all'
              ? 'No developers match your search criteria'
              : 'No developers available at the moment'
            }
          </div>
          <button
            className="inline-flex items-center justify-center h-10 px-6 rounded-full border border-black/10 text-sm font-medium text-[#1d1d1f] hover:bg-black/5 transition-colors"
            onClick={() => {
              setSearchTerm('')
              setAvailabilityFilter('all')
              setRateFilter('all')
              setSkillFilter('all')
            }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}
