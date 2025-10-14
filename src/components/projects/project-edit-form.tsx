'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Plus, X, Save, Briefcase, DollarSign, Clock, MapPin, ArrowLeft } from 'lucide-react'

interface ProjectEditFormProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  companyId: string
  project: {
    id: string
    title: string
    description: string
    budgetMin?: number | null
    budgetMax?: number | null
    currency: string
    timeline?: string | null
    locationPref?: string | null
    requiredSkills: string[]
  }
}

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
  { value: 'AUD', label: 'AUD (A$)' },
  { value: 'CZK', label: 'CZK (Kč)' }
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

export function ProjectEditForm({ user, companyId, project }: ProjectEditFormProps) {
  console.log(`THE DEATH! project -> ${JSON.stringify(project, null, "  ")}`)

  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Pre-populate form state with existing project data
  const [title, setTitle] = useState(project.title)
  const [description, setDescription] = useState(project.description)
  const [budgetMin, setBudgetMin] = useState(project.budgetMin?.toString() || '')
  const [budgetMax, setBudgetMax] = useState(project.budgetMax?.toString() || '')
  const [currency, setCurrency] = useState(project.currency)
  const [timeline, setTimeline] = useState(project.timeline || '')
  const [locationPref, setLocationPref] = useState(project.locationPref || '')
  const [requiredSkills, setRequiredSkills] = useState<string[]>(project.requiredSkills)
  const [newSkill, setNewSkill] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          budgetMin: budgetMin ? parseFloat(budgetMin) : null,
          budgetMax: budgetMax ? parseFloat(budgetMax) : null,
          currency,
          timeline: timeline || null,
          locationPref: locationPref || null,
          requiredSkills
        }),
      })

      if (response.ok) {
        router.push(`/projects/${project.id}`)
      } else {
        console.error('Failed to update project')
      }
    } catch (error) {
      console.error('Error updating project:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addSkill = () => {
    const skill = newSkill.trim()
    if (skill && !requiredSkills.includes(skill)) {
      setRequiredSkills([...requiredSkills, skill])
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setRequiredSkills(requiredSkills.filter(skill => skill !== skillToRemove))
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} role="company" />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push(`/projects/${project.id}`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Project
            </Button>
          </div>
          <h1 className="text-3xl font-bold">Edit Project</h1>
          <p className="text-muted-foreground">
            Update your project details to attract the right developers
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., E-commerce Platform Development"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Project Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the project scope, requirements, goals, and any specific details developers should know..."
                  className="min-h-[120px]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeline">Timeline</Label>
                  <Select value={timeline} onValueChange={setTimeline}>
                    <SelectTrigger>
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
                  <Label htmlFor="locationPref">Work Location</Label>
                  <Select value={locationPref} onValueChange={setLocationPref}>
                    <SelectTrigger>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Budget Range
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="budgetMin">Minimum Budget</Label>
                  <Input
                    id="budgetMin"
                    type="number"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    placeholder="5000"
                    min="0"
                    step="100"
                  />
                </div>
                <div>
                  <Label htmlFor="budgetMax">Maximum Budget</Label>
                  <Input
                    id="budgetMax"
                    type="number"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    placeholder="15000"
                    min="0"
                    step="100"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
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
            </CardContent>
          </Card>

          {/* Required Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Required Skills & Technologies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {requiredSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeSkill(skill)}
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
                      addSkill()
                    }
                  }}
                  list="skills-suggestions"
                />
                <datalist id="skills-suggestions">
                  {COMMON_SKILLS.map(skill => (
                    <option key={skill} value={skill} />
                  ))}
                </datalist>
                <Button type="button" onClick={addSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Quick Add Popular Skills:</h4>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SKILLS.slice(0, 12).map((skill) => (
                    <Button
                      key={skill}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (!requiredSkills.includes(skill)) {
                          setRequiredSkills([...requiredSkills, skill])
                        }
                      }}
                      disabled={requiredSkills.includes(skill)}
                      className="text-xs"
                    >
                      {skill}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button 
              type="submit" 
              disabled={isLoading || !title.trim() || !description.trim()} 
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isLoading ? 'Updating...' : 'Update Project'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push(`/projects/${project.id}`)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
