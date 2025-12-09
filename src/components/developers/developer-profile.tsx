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
  Clock,
  Loader2,
  Award
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface DeveloperProfileProps {
  developerId: Id<'profiles'>
}

export function DeveloperProfile({ developerId }: DeveloperProfileProps) {
  const profile = useQuery(api.profiles.getCurrent)
  const developer = useQuery(api.developers.getProfile, { profileId: developerId })
  const sendContact = useMutation(api.contacts.create)

  const [contactMessage, setContactMessage] = useState('')
  const [isContacting, setIsContacting] = useState(false)
  const [hasContacted, setHasContacted] = useState(false)

  if (profile === undefined || developer === undefined) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!developer) {
    notFound()
  }

  const handleContact = async () => {
    if (!contactMessage.trim() || !profile) return

    setIsContacting(true)
    try {
      await sendContact({
        developerId: developerId,
        message: contactMessage.trim()
      })
      setHasContacted(true)
      setContactMessage('')
    } catch (error) {
      console.error('Error sending contact message:', error)
    } finally {
      setIsContacting(false)
    }
  }

  const getAvailabilityColor = (availability: string | null | undefined) => {
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

  const formatRate = (rate: number | null | undefined) => {
    if (!rate) return null
    return `$${rate.toLocaleString()}/hr`
  }

  const formatJoinDate = (date: number) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
  }

  const devProfile = developer.developerProfile
  const isOwner = profile?._id === developerId
  const userRole = profile?.role || 'developer'

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <DashboardNav />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Button variant="ghost" asChild className="rounded-full">
            <Link href="/developers">← Back to Developers</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card className="bg-white border-gray-100 shadow-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 ring-2 ring-gray-100">
                      <AvatarImage src={developer.profile?.avatarUrl || undefined} />
                      <AvatarFallback className="text-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        {developer.profile?.displayName?.charAt(0) || 'D'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                        {developer.profile?.displayName || 'Developer'}
                      </h1>
                      {devProfile?.headline && (
                        <p className="text-xl text-gray-500 mt-1">
                          {devProfile.headline}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3">
                        {devProfile?.availability && (
                          <Badge
                            className={`capitalize rounded-full ${getAvailabilityColor(devProfile.availability)}`}
                          >
                            {devProfile.availability}
                          </Badge>
                        )}
                        {devProfile?.rate && (
                          <div className="flex items-center gap-1 text-green-600 font-semibold">
                            <DollarSign className="h-4 w-4" />
                            <span>{formatRate(devProfile.rate)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {isOwner && (
                    <Button size="sm" variant="outline" asChild className="rounded-full">
                      <Link href="/profile">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Link>
                    </Button>
                  )}
                </div>
              </CardHeader>

              {devProfile?.bio && (
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-base leading-relaxed whitespace-pre-wrap text-gray-600">
                      {devProfile.bio}
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Skills & Expertise */}
            {developer.skills && developer.skills.length > 0 && (
              <Card className="bg-white border-gray-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Award className="h-5 w-5" />
                    Skills & Expertise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {developer.skills.filter((skill): skill is NonNullable<typeof skill> => skill !== null).map((skill) => (
                      <div key={skill._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                        <span className="font-medium text-gray-900">{skill.label}</span>
                        <Badge
                          variant="outline"
                          className={`text-xs capitalize rounded-full ${getSkillLevelColor(skill.level)}`}
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
            {(devProfile?.portfolioUrl || devProfile?.githubUrl || devProfile?.websiteUrl) && (
              <Card className="bg-white border-gray-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-900">Portfolio & Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {devProfile.portfolioUrl && (
                    <a
                      href={devProfile.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <Briefcase className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium text-gray-900">Portfolio</div>
                        <div className="text-sm text-gray-500">{devProfile.portfolioUrl}</div>
                      </div>
                      <ExternalLink className="h-4 w-4 ml-auto text-gray-400" />
                    </a>
                  )}

                  {devProfile.githubUrl && (
                    <a
                      href={devProfile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <Github className="h-5 w-5" />
                      <div>
                        <div className="font-medium text-gray-900">GitHub</div>
                        <div className="text-sm text-gray-500">{devProfile.githubUrl}</div>
                      </div>
                      <ExternalLink className="h-4 w-4 ml-auto text-gray-400" />
                    </a>
                  )}

                  {devProfile.websiteUrl && (
                    <a
                      href={devProfile.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <Globe className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium text-gray-900">Website</div>
                        <div className="text-sm text-gray-500">{devProfile.websiteUrl}</div>
                      </div>
                      <ExternalLink className="h-4 w-4 ml-auto text-gray-400" />
                    </a>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Contact Section - Only for companies */}
            {userRole === 'company' && !isOwner && (
              <Card className="bg-white border-gray-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-900">
                    {hasContacted ? 'Message Sent' : 'Contact Developer'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {hasContacted ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="text-green-800">
                        Your message has been sent successfully! The developer will receive your message and can respond directly.
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="contact-message" className="text-gray-700">
                          Send a message to this developer
                        </Label>
                        <Textarea
                          id="contact-message"
                          placeholder="Tell the developer about your project, timeline, and what you're looking for..."
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          className="min-h-[100px] mt-2 rounded-xl border-gray-200"
                        />
                      </div>
                      <Button
                        onClick={handleContact}
                        disabled={!contactMessage.trim() || isContacting}
                        className="rounded-full flex items-center gap-2"
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
            <Card className="bg-white border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <User className="h-5 w-5" />
                  Developer Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {devProfile?.country && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{devProfile.country}</span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Joined {formatJoinDate(developer.profile?.createdAt || Date.now())}</span>
                </div>

                {devProfile?.availability && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="capitalize text-gray-600">{devProfile.availability}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-white border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900">Profile Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Skills</span>
                  <span className="font-semibold text-gray-900">{developer.skills?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Availability</span>
                  <Badge
                    variant="outline"
                    className={`text-xs capitalize rounded-full ${getAvailabilityColor(devProfile?.availability)}`}
                  >
                    {devProfile?.availability || 'Not set'}
                  </Badge>
                </div>
                {devProfile?.rate && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Rate</span>
                    <span className="font-semibold text-green-600">
                      {formatRate(devProfile.rate)}
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
