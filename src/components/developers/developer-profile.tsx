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
  User, 
  MapPin, 
  DollarSign, 
  Calendar, 
  ExternalLink,
  Send,
  Edit,
  Globe,
  Github,
  Briefcase,
  Mail,
  Star,
  Award,
  Clock
} from 'lucide-react'
import Link from 'next/link'

interface DeveloperProfileProps {
  developer: {
    id: string
    displayName: string | null
    avatarUrl: string | null
    createdAt: Date
    user: {
      name: string | null
      email: string
      image: string | null
    }
    developerProfile: {
      headline: string | null
      bio: string | null
      rate: string | null
      availability: string | null
      portfolioUrl: string | null
      githubUrl: string | null
      websiteUrl: string | null
      country: string | null
    } | null
    skills: Array<{
      id: number
      slug: string
      label: string
      level: string
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

export function DeveloperProfile({ 
  developer, 
  user, 
  userRole, 
  userId, 
  isOwner 
}: DeveloperProfileProps) {
  const [contactMessage, setContactMessage] = useState('')
  const [isContacting, setIsContacting] = useState(false)
  const [hasContacted, setHasContacted] = useState(false)

  const handleContact = async () => {
    if (!contactMessage.trim()) return

    setIsContacting(true)
    try {
      const response = await fetch('/api/developers/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          developerId: developer.id,
          message: contactMessage.trim()
        })
      })

      if (response.ok) {
        setHasContacted(true)
        setContactMessage('')
      }
    } catch (error) {
      console.error('Error sending contact message:', error)
    } finally {
      setIsContacting(false)
    }
  }

  const getAvailabilityColor = (availability: string | null) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200'
      case 'busy': return 'bg-yellow-100 text-yellow-800 border-yellow-200'  
      case 'unavailable': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'expert': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'advanced': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'intermediate': return 'bg-green-100 text-green-800 border-green-200'
      case 'beginner': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatRate = (rate: string | null) => {
    if (!rate) return null
    return `$${parseFloat(rate).toLocaleString()}/hr`
  }

  const formatJoinDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
  }

  const profile = developer.developerProfile

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} role={userRole} />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/developers">← Back to Developers</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={developer.avatarUrl || developer.user.image || undefined} />
                      <AvatarFallback className="text-lg">
                        {developer.displayName?.charAt(0) || 
                         developer.user.name?.charAt(0) || 'D'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h1 className="text-3xl font-bold">
                        {developer.displayName || developer.user.name || 'Developer'}
                      </h1>
                      {profile?.headline && (
                        <p className="text-xl text-muted-foreground mt-1">
                          {profile.headline}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3">
                        {profile?.availability && (
                          <Badge 
                            className={`capitalize ${getAvailabilityColor(profile.availability)}`}
                          >
                            {profile.availability}
                          </Badge>
                        )}
                        {profile?.rate && (
                          <div className="flex items-center gap-1 text-green-600 font-semibold">
                            <DollarSign className="h-4 w-4" />
                            <span>{formatRate(profile.rate)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {isOwner && (
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/profile">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Link>
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              {profile?.bio && (
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-base leading-relaxed whitespace-pre-wrap">
                      {profile.bio}
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Skills & Expertise */}
            {developer.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Skills & Expertise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {developer.skills.map((skill) => (
                      <div key={skill.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-medium">{skill.label}</span>
                        <Badge 
                          variant="outline"
                          className={`text-xs capitalize ${getSkillLevelColor(skill.level)}`}
                        >
                          {skill.level}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Links & Portfolio */}
            {(profile?.portfolioUrl || profile?.githubUrl || profile?.websiteUrl) && (
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio & Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile.portfolioUrl && (
                    <a 
                      href={profile.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Briefcase className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">Portfolio</div>
                        <div className="text-sm text-muted-foreground">{profile.portfolioUrl}</div>
                      </div>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </a>
                  )}
                  
                  {profile.githubUrl && (
                    <a 
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Github className="h-5 w-5" />
                      <div>
                        <div className="font-medium">GitHub</div>
                        <div className="text-sm text-muted-foreground">{profile.githubUrl}</div>
                      </div>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </a>
                  )}
                  
                  {profile.websiteUrl && (
                    <a 
                      href={profile.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Globe className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium">Website</div>
                        <div className="text-sm text-muted-foreground">{profile.websiteUrl}</div>
                      </div>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </a>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Contact Section - Only for companies */}
            {userRole === 'company' && !isOwner && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {hasContacted ? 'Message Sent' : 'Contact Developer'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {hasContacted ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-green-800">
                        ✅ Your message has been sent successfully! The developer will receive your message and can respond directly.
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="contact-message">
                          Send a message to this developer
                        </Label>
                        <Textarea
                          id="contact-message"
                          placeholder="Tell the developer about your project, timeline, and what you're looking for..."
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          className="min-h-[100px] mt-2"
                        />
                      </div>
                      <Button 
                        onClick={handleContact}
                        disabled={!contactMessage.trim() || isContacting}
                        className="flex items-center gap-2"
                      >
                        <Send className="h-4 w-4" />
                        {isContacting ? 'Sending...' : 'Send Message'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Developer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Developer Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile?.country && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.country}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {formatJoinDate(developer.createdAt)}</span>
                </div>

                {profile?.availability && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="capitalize">{profile.availability}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Skills</span>
                  <span className="font-semibold">{developer.skills.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Availability</span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs capitalize ${getAvailabilityColor(profile?.availability || null)}`}
                  >
                    {profile?.availability || 'Not set'}
                  </Badge>
                </div>
                {profile?.rate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rate</span>
                    <span className="font-semibold text-green-600">
                      {formatRate(profile.rate)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}