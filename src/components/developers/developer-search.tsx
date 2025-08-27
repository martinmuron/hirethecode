'use client'

import { useState, useEffect } from 'react'
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
  Star, 
  Filter,
  ExternalLink,
  Globe,
  Github,
  Briefcase,
  Mail
} from 'lucide-react'
import Link from 'next/link'

interface DeveloperSearchProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  companyId: string
  userRole: 'developer' | 'company' | 'admin'
}

interface Developer {
  id: string
  displayName: string | null
  avatarUrl: string | null
  headline: string | null
  bio: string | null
  rate: string | null
  availability: string | null
  portfolioUrl: string | null
  githubUrl: string | null
  websiteUrl: string | null
  country: string | null
  skills: Array<{
    id: number
    label: string
    level: string
  }>
}

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

export function DeveloperSearch({ user, companyId, userRole }: DeveloperSearchProps) {
  const [developers, setDevelopers] = useState<Developer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [availabilityFilter, setAvailabilityFilter] = useState('all')
  const [rateFilter, setRateFilter] = useState('all')
  const [skillFilter, setSkillFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')

  useEffect(() => {
    loadDevelopers()
  }, [])

  const loadDevelopers = async () => {
    try {
      const params = new URLSearchParams({
        availability: availabilityFilter,
        rateRange: rateFilter,
        skill: skillFilter,
        sort: sortBy,
        search: searchTerm
      })
      
      const response = await fetch(`/api/developers?${params}`)
      if (response.ok) {
        const data = await response.json()
        setDevelopers(data.developers)
      }
    } catch (error) {
      console.error('Error loading developers:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadDevelopers()
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [searchTerm, availabilityFilter, rateFilter, skillFilter, sortBy])

  const filteredDevelopers = developers.filter(dev => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      dev.displayName?.toLowerCase().includes(searchLower) ||
      dev.headline?.toLowerCase().includes(searchLower) ||
      dev.bio?.toLowerCase().includes(searchLower) ||
      dev.country?.toLowerCase().includes(searchLower) ||
      dev.skills.some(skill => skill.label.toLowerCase().includes(searchLower))
    )
  })

  const getAvailabilityColor = (availability: string | null) => {
    switch (availability) {
      case 'available': return 'text-green-600 bg-green-50 border-green-200'
      case 'busy': return 'text-yellow-600 bg-yellow-50 border-yellow-200'  
      case 'unavailable': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const formatRate = (rate: string | null) => {
    if (!rate) return 'Rate not specified'
    return `$${parseFloat(rate).toLocaleString()}/hr`
  }

  const handleContact = async (developerId: string) => {
    try {
      const response = await fetch('/api/developers/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ developerId })
      })
      
      if (response.ok) {
        // Handle successful contact
        console.log('Contact request sent')
      }
    } catch (error) {
      console.error('Error sending contact request:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} role={userRole} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Find Developers</h1>
          <p className="text-muted-foreground">
            Discover talented developers for your projects
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search developers by name, skills, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="w-48">
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
              <SelectTrigger className="w-48">
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
              <SelectTrigger className="w-48">
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
              <SelectTrigger className="w-48">
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
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-muted rounded-full"></div>
                    <div>
                      <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-24"></div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-4/5"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredDevelopers.length} developers
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDevelopers.map((developer) => (
                <Card key={developer.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={developer.avatarUrl || undefined} />
                          <AvatarFallback>
                            {developer.displayName?.charAt(0) || 'D'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">
                            {developer.displayName || 'Developer'}
                          </CardTitle>
                          {developer.headline && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {developer.headline}
                            </p>
                          )}
                        </div>
                      </div>
                      {developer.availability && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs capitalize ${getAvailabilityColor(developer.availability)}`}
                        >
                          {developer.availability}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Bio */}
                    {developer.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {developer.bio}
                      </p>
                    )}

                    {/* Rate and Location */}
                    <div className="flex items-center justify-between text-sm">
                      {developer.rate && (
                        <div className="flex items-center gap-1 text-green-600">
                          <DollarSign className="h-4 w-4" />
                          <span>{formatRate(developer.rate)}</span>
                        </div>
                      )}
                      {developer.country && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{developer.country}</span>
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    {developer.skills.length > 0 && (
                      <div>
                        <div className="flex flex-wrap gap-1">
                          {developer.skills.slice(0, 4).map((skill) => (
                            <Badge key={skill.id} variant="secondary" className="text-xs">
                              {skill.label}
                            </Badge>
                          ))}
                          {developer.skills.length > 4 && (
                            <Badge variant="secondary" className="text-xs">
                              +{developer.skills.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Links */}
                    <div className="flex items-center gap-2">
                      {developer.portfolioUrl && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={developer.portfolioUrl} target="_blank" rel="noopener noreferrer">
                            <Briefcase className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                      {developer.githubUrl && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={developer.githubUrl} target="_blank" rel="noopener noreferrer">
                            <Github className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                      {developer.websiteUrl && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={developer.websiteUrl} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        className="flex-1 flex items-center gap-2"
                        onClick={() => handleContact(developer.id)}
                      >
                        <Mail className="h-3 w-3" />
                        Contact
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/developers/${developer.id}`}>
                          View Profile
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredDevelopers.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  {searchTerm || availabilityFilter !== 'all' || rateFilter !== 'all' || skillFilter !== 'all'
                    ? 'No developers match your search criteria'
                    : 'No developers available at the moment'
                  }
                </div>
                <Button variant="outline" onClick={() => {
                  setSearchTerm('')
                  setAvailabilityFilter('all')
                  setRateFilter('all')
                  setSkillFilter('all')
                }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}