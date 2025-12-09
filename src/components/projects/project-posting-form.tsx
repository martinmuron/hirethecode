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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Plus, X, Save, Briefcase, DollarSign, Clock, MapPin, Loader2 } from 'lucide-react'

const COMMON_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Python', 'Java',
  'C#', 'PHP', 'Go', 'Rust', 'Swift', 'Kotlin', 'Vue.js', 'Angular', 'Svelte',
  'Express.js', 'NestJS', 'Django', 'Flask', 'Rails', 'Laravel', 'Spring',
  '.NET', 'AWS', 'Google Cloud', 'Azure', 'Docker', 'Kubernetes', 'MongoDB',
  'PostgreSQL', 'MySQL', 'Redis', 'GraphQL', 'REST APIs', 'Git', 'Linux'
]

const CURRENCIES = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CAD', label: 'CAD (C$)' },
  { value: 'AUD', label: 'AUD (A$)' }
]

const TIMELINE_OPTIONS = [
  { value: '1-2 weeks', label: '1-2 weeks' },
  { value: '1 month', label: '1 month' },
  { value: '2-3 months', label: '2-3 months' },
  { value: '3-6 months', label: '3-6 months' },
  { value: '6+ months', label: '6+ months' },
  { value: 'ongoing', label: 'Ongoing' }
]

const LOCATION_PREFERENCES = [
  { value: 'remote', label: 'Remote Only' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
  { value: 'flexible', label: 'Flexible' }
]

export function ProjectPostingForm() {
  const router = useRouter()
  const profile = useQuery(api.profiles.getCurrent)
  const allSkills = useQuery(api.skills.list)
  const createProject = useMutation(api.projects.create)

  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [timeline, setTimeline] = useState('')
  const [locationPref, setLocationPref] = useState('')
  const [selectedSkillIds, setSelectedSkillIds] = useState<Id<'skills'>[]>([])
  const [newSkill, setNewSkill] = useState('')

  // Redirect if not a company
  useEffect(() => {
    if (profile && profile.role !== 'company') {
      router.push('/dashboard')
    }
  }, [profile, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const projectId = await createProject({
        title: title.trim(),
        description: description.trim(),
        budgetMin: budgetMin ? parseFloat(budgetMin) : undefined,
        budgetMax: budgetMax ? parseFloat(budgetMax) : undefined,
        currency,
        timeline: timeline || undefined,
        locationPref: locationPref || undefined,
        skillIds: selectedSkillIds.length > 0 ? selectedSkillIds : undefined
      })

      router.push(`/projects/${projectId}`)
    } catch (error) {
      console.error('Error creating project:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addSkillByLabel = (label: string) => {
    if (!allSkills) return

    const skill = allSkills.find(s => s.label.toLowerCase() === label.toLowerCase())
    if (skill && !selectedSkillIds.includes(skill._id)) {
      setSelectedSkillIds([...selectedSkillIds, skill._id])
    }
    setNewSkill('')
  }

  const removeSkill = (skillId: Id<'skills'>) => {
    setSelectedSkillIds(selectedSkillIds.filter(id => id !== skillId))
  }

  const getSkillLabel = (skillId: Id<'skills'>) => {
    return allSkills?.find(s => s._id === skillId)?.label || 'Unknown'
  }

  if (profile === undefined || allSkills === undefined) {
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
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Post New Project</h1>
          <p className="text-gray-500 mt-1">
            Create a project posting to find the perfect developers
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Project Details */}
          <Card className="bg-white border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Briefcase className="h-5 w-5" />
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-gray-700">Project Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., E-commerce Platform Development"
                  className="rounded-xl border-gray-200 mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-700">Project Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the project scope, requirements, goals, and any specific details developers should know..."
                  className="min-h-[120px] rounded-xl border-gray-200 mt-1"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeline" className="text-gray-700">Timeline</Label>
                  <Select value={timeline} onValueChange={setTimeline}>
                    <SelectTrigger className="rounded-xl border-gray-200 mt-1">
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMELINE_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="locationPref" className="text-gray-700">Work Location</Label>
                  <Select value={locationPref} onValueChange={setLocationPref}>
                    <SelectTrigger className="rounded-xl border-gray-200 mt-1">
                      <SelectValue placeholder="Select preference" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATION_PREFERENCES.map(option => (
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

          {/* Budget */}
          <Card className="bg-white border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <DollarSign className="h-5 w-5" />
                Budget Range
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="budgetMin" className="text-gray-700">Minimum Budget</Label>
                  <Input
                    id="budgetMin"
                    type="number"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    placeholder="5000"
                    min="0"
                    step="100"
                    className="rounded-xl border-gray-200 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="budgetMax" className="text-gray-700">Maximum Budget</Label>
                  <Input
                    id="budgetMax"
                    type="number"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    placeholder="15000"
                    min="0"
                    step="100"
                    className="rounded-xl border-gray-200 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="currency" className="text-gray-700">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="rounded-xl border-gray-200 mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map(curr => (
                        <SelectItem key={curr.value} value={curr.value}>
                          {curr.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Projects with clear budget ranges receive 40% more quality applications
              </p>
            </CardContent>
          </Card>

          {/* Required Skills */}
          <Card className="bg-white border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Required Skills & Technologies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {selectedSkillIds.map((skillId) => (
                  <Badge key={skillId} variant="secondary" className="flex items-center gap-1 rounded-full">
                    {getSkillLabel(skillId)}
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                      onClick={() => removeSkill(skillId)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Add required skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addSkillByLabel(newSkill)
                    }
                  }}
                  list="skills-suggestions"
                  className="rounded-xl border-gray-200"
                />
                <datalist id="skills-suggestions">
                  {allSkills?.map(skill => (
                    <option key={skill._id} value={skill.label} />
                  ))}
                </datalist>
                <Button type="button" onClick={() => addSkillByLabel(newSkill)} className="rounded-full">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="font-semibold mb-2 text-gray-900">Quick Add Popular Skills:</h4>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SKILLS.slice(0, 12).map((skill) => {
                    const skillData = allSkills?.find(s => s.label === skill)
                    const isSelected = skillData && selectedSkillIds.includes(skillData._id)

                    return (
                      <Button
                        key={skill}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addSkillByLabel(skill)}
                        disabled={isSelected || !skillData}
                        className="text-xs rounded-full"
                      >
                        {skill}
                      </Button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card className="bg-white border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="font-semibold mb-2 text-gray-900">What happens after you post?</h4>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Your project will be visible to developers within 15 minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>Smart matching will notify relevant developers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span>You&apos;ll receive applications within 24-48 hours</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isLoading || !title.trim() || !description.trim()}
              className="flex items-center gap-2 rounded-full px-6"
            >
              <Save className="h-4 w-4" />
              {isLoading ? 'Posting...' : 'Post Project'}
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
