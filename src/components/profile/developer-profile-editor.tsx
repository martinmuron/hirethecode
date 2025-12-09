'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import { Id } from '@convex/_generated/dataModel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { DashboardNav } from '@/components/navigation/dashboard-nav'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Plus, X, Save, User as UserIcon, Loader2 } from 'lucide-react'

interface SelectedSkill {
  id: Id<'skills'>
  slug: string
  label: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

const SKILL_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' }
]

const AVAILABILITY_OPTIONS = [
  { value: 'available', label: 'Available Now' },
  { value: 'busy', label: 'Busy' },
  { value: 'unavailable', label: 'Unavailable' }
]

export function DeveloperProfileEditor() {
  const router = useRouter()
  const profile = useQuery(api.profiles.getCurrent)
  const developerData = useQuery(api.developers.getCurrentProfile)
  const allSkills = useQuery(api.skills.list)
  const updateProfile = useMutation(api.profiles.update)
  const updateDeveloperProfile = useMutation(api.developers.updateProfile)
  const updateSkills = useMutation(api.skills.updateDeveloperSkills)

  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [displayName, setDisplayName] = useState('')
  const [headline, setHeadline] = useState('')
  const [bio, setBio] = useState('')
  const [rate, setRate] = useState('')
  const [availability, setAvailability] = useState<'available' | 'busy' | 'unavailable'>('available')
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [country, setCountry] = useState('')
  const [skills, setSkills] = useState<SelectedSkill[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [newSkillLevel, setNewSkillLevel] = useState<string>('intermediate')

  // Initialize form with existing data
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '')
    }
    if (developerData?.developerProfile) {
      const dp = developerData.developerProfile
      setHeadline(dp.headline || '')
      setBio(dp.bio || '')
      setRate(dp.rate?.toString() || '')
      setAvailability(dp.availability || 'available')
      setPortfolioUrl(dp.portfolioUrl || '')
      setGithubUrl(dp.githubUrl || '')
      setWebsiteUrl(dp.websiteUrl || '')
      setCountry(dp.country || '')
    }
    if (developerData?.skills) {
      setSkills(developerData.skills.filter(Boolean).map(s => ({
        id: s!._id,
        slug: s!.slug,
        label: s!.label,
        level: (s!.level || 'intermediate') as SelectedSkill['level']
      })))
    }
  }, [profile, developerData])

  // Redirect if not a developer
  useEffect(() => {
    if (profile && profile.role !== 'developer') {
      router.push('/dashboard')
    }
  }, [profile, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setIsLoading(true)

    try {
      // Update main profile
      await updateProfile({
        displayName: displayName.trim() || undefined
      })

      // Update developer profile
      await updateDeveloperProfile({
        headline: headline.trim() || undefined,
        bio: bio.trim() || undefined,
        rate: rate ? parseFloat(rate) : undefined,
        availability,
        portfolioUrl: portfolioUrl.trim() || undefined,
        githubUrl: githubUrl.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
        country: country.trim() || undefined
      })

      // Update skills
      await updateSkills({
        skills: skills.map(s => ({
          skillId: s.id,
          level: s.level
        }))
      })

      router.push('/dashboard')
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addSkill = () => {
    if (!allSkills) return

    const skillToAdd = allSkills.find(s =>
      s.label.toLowerCase() === newSkill.toLowerCase()
    )

    if (skillToAdd && !skills.find(s => s.id === skillToAdd._id)) {
      setSkills([...skills, {
        id: skillToAdd._id,
        slug: skillToAdd.slug,
        label: skillToAdd.label,
        level: newSkillLevel as SelectedSkill['level']
      }])
      setNewSkill('')
      setNewSkillLevel('intermediate')
    }
  }

  const removeSkill = (skillId: Id<'skills'>) => {
    setSkills(skills.filter(s => s.id !== skillId))
  }

  const updateSkillLevel = (skillId: Id<'skills'>, level: string) => {
    setSkills(skills.map(s =>
      s.id === skillId ? { ...s, level: level as SelectedSkill['level'] } : s
    ))
  }

  if (profile === undefined || developerData === undefined || allSkills === undefined) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <DashboardNav />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Developer Profile</h1>
          <p className="text-gray-500 mt-1">
            Update your profile to attract the right opportunities
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="bg-white border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <UserIcon className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 ring-2 ring-gray-100">
                  <AvatarImage src={profile?.avatarUrl || undefined} />
                  <AvatarFallback className="text-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                    {displayName?.charAt(0) || 'D'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Label htmlFor="displayName" className="text-gray-700">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your professional name"
                    className="rounded-xl border-gray-200 mt-1"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="headline" className="text-gray-700">Professional Headline</Label>
                <Input
                  id="headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g., Full-Stack Developer specializing in React & Node.js"
                  className="rounded-xl border-gray-200 mt-1"
                />
              </div>

              <div>
                <Label htmlFor="bio" className="text-gray-700">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell companies about your experience, passion, and what you're looking for..."
                  className="min-h-[100px] rounded-xl border-gray-200 mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rate" className="text-gray-700">Hourly Rate (USD)</Label>
                  <Input
                    id="rate"
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    placeholder="150"
                    min="0"
                    step="0.01"
                    className="rounded-xl border-gray-200 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="availability" className="text-gray-700">Availability</Label>
                  <Select
                    value={availability}
                    onValueChange={(value) => setAvailability(value as typeof availability)}
                  >
                    <SelectTrigger className="rounded-xl border-gray-200 mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABILITY_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="bg-white border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Skills & Expertise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <div key={skill.id} className="flex items-center gap-1">
                    <Badge variant="secondary" className="flex items-center gap-1 rounded-full pr-1">
                      {skill.label}
                      <Select
                        value={skill.level}
                        onValueChange={(level) => updateSkillLevel(skill.id, level)}
                      >
                        <SelectTrigger className="h-6 w-fit border-0 p-0 text-xs bg-transparent">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SKILL_LEVELS.map(level => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                        onClick={() => removeSkill(skill.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill (e.g., React, Python, etc.)"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addSkill()
                    }
                  }}
                  list="skills-list"
                  className="rounded-xl border-gray-200"
                />
                <datalist id="skills-list">
                  {allSkills?.map(skill => (
                    <option key={skill._id} value={skill.label} />
                  ))}
                </datalist>
                <Select value={newSkillLevel} onValueChange={setNewSkillLevel}>
                  <SelectTrigger className="w-32 rounded-xl border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SKILL_LEVELS.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={addSkill} className="rounded-full">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Links & Contact */}
          <Card className="bg-white border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Links & Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="portfolioUrl" className="text-gray-700">Portfolio URL</Label>
                  <Input
                    id="portfolioUrl"
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://yourportfolio.com"
                    className="rounded-xl border-gray-200 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="githubUrl" className="text-gray-700">GitHub Profile</Label>
                  <Input
                    id="githubUrl"
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/yourusername"
                    className="rounded-xl border-gray-200 mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="websiteUrl" className="text-gray-700">Personal Website</Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="rounded-xl border-gray-200 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="country" className="text-gray-700">Country</Label>
                  <Input
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="United States"
                    className="rounded-xl border-gray-200 mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 rounded-full px-6"
            >
              <Save className="h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save Profile'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="rounded-full"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
