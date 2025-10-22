'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DashboardNav } from '@/components/navigation/dashboard-nav'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Sparkles, 
  Save, 
  Briefcase, 
  DollarSign, 
  Clock, 
  MapPin, 
  Plus, 
  X, 
  Wand2,
  Users,
  Code
} from 'lucide-react'

interface SeekerProjectFormProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  seekerId: string
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

interface ClaudeAnalysis {
  requiredSkills: string[]
  complexity: 'simple' | 'moderate' | 'complex' | 'enterprise'
  estimatedTimeline: string
  recommendedFor: 'freelancer' | 'company' | 'either'
  suggestedBudget?: {
    min: number
    max: number
    currency: string
  }
  projectTitle?: string
}

export function SeekerProjectForm({ user, seekerId }: SeekerProjectFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [claudeAnalysis, setClaudeAnalysis] = useState<ClaudeAnalysis | null>(null)
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic')

  // Basic form state
  const [projectDescription, setProjectDescription] = useState('')

  // Advanced form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [timeline, setTimeline] = useState('')
  const [locationPref, setLocationPref] = useState('')
  const [requiredSkills, setRequiredSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')

  const analyzeWithClaude = async () => {
    if (!projectDescription.trim()) return

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/projects/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: projectDescription.trim()
        }),
      })

      if (response.ok) {
        const analysis: ClaudeAnalysis = await response.json()
        setClaudeAnalysis(analysis)
        
        // Auto-populate advanced form with Claude's analysis
        if (analysis.projectTitle) {
          setTitle(analysis.projectTitle)
        }
        setDescription(projectDescription)
        setRequiredSkills(analysis.requiredSkills)
        setTimeline(analysis.estimatedTimeline)
        
        if (analysis.suggestedBudget) {
          setBudgetMin(analysis.suggestedBudget.min.toString())
          setBudgetMax(analysis.suggestedBudget.max.toString())
          setCurrency(analysis.suggestedBudget.currency)
        }
      } else {
        console.error('Failed to analyze project')
      }
    } catch (error) {
      console.error('Error analyzing project:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleBasicSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await analyzeWithClaude()
  }

  const handleAdvancedSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          budgetMin: budgetMin ? parseFloat(budgetMin) : null,
          budgetMax: budgetMax ? parseFloat(budgetMax) : null,
          currency,
          timeline: timeline || null,
          locationPref: locationPref || null,
          requiredSkills,
          // Include Claude analysis if available
          complexity: claudeAnalysis?.complexity || null,
          estimatedTimeline: claudeAnalysis?.estimatedTimeline || null,
          recommendedFor: claudeAnalysis?.recommendedFor || null,
        }),
      })

      if (response.ok) {
        const project = await response.json()
        router.push(`/projects/${project.id}`)
      } else {
        console.error('Failed to create project')
      }
    } catch (error) {
      console.error('Error creating project:', error)
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
      <DashboardNav user={user} role="seeker" />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Post New Project</h1>
          <p className="text-muted-foreground">
            Find the perfect developers or teams for your project
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'basic' | 'advanced')}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Basic (AI-Powered)
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Advanced
            </TabsTrigger>
          </TabsList>

          {/* BASIC TAB */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5" />
                  Describe Your Project
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleBasicSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="projectDescription">Project Description</Label>
                    <Textarea
                      id="projectDescription"
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      placeholder="Describe your project in a few sentences... For example: 'I need a mobile app for food delivery with user accounts, restaurant listings, and payment processing. Users should be able to browse menus, place orders, and track delivery in real-time.'"
                      className="min-h-[120px]"
                      required
                    />
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold mb-2 text-blue-800">✨ How AI Analysis Works</h4>
                    <div className="space-y-1 text-sm text-blue-700">
                      <p>• Identifies required technical skills and technologies</p>
                      <p>• Estimates project complexity and timeline</p>
                      <p>• Suggests whether you need a freelancer or development team</p>
                      <p>• Provides instant matches with qualified developers</p>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={!projectDescription.trim() || isAnalyzing}
                    className="w-full"
                    size="lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Analyzing Project...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Analyze & Find Matches
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Claude Analysis Results */}
            {claudeAnalysis && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    AI Analysis Complete!
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-green-800">Required Skills</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {claudeAnalysis.requiredSkills.map(skill => (
                          <Badge key={skill} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-green-800">Complexity</Label>
                      <p className="text-sm mt-1 capitalize">{claudeAnalysis.complexity}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-green-800">Estimated Timeline</Label>
                      <p className="text-sm mt-1">{claudeAnalysis.estimatedTimeline}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-green-800">Recommended For</Label>
                      <p className="text-sm mt-1 capitalize">{claudeAnalysis.recommendedFor}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={() => setActiveTab('advanced')}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Code className="h-4 w-4" />
                      Customize Details
                    </Button>
                    <Button 
                      onClick={handleAdvancedSubmit}
                      disabled={isLoading}
                      className="flex items-center gap-2"
                    >
                      <Users className="h-4 w-4" />
                      {isLoading ? 'Posting...' : 'Post Project & Show Matches'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ADVANCED TAB */}
          <TabsContent value="advanced" className="space-y-6">
            <form onSubmit={handleAdvancedSubmit} className="space-y-8">
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
                      placeholder="e.g., E-commerce Mobile App Development"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Detailed Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide detailed requirements, features, and any specific technologies you prefer..."
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
                      <Label htmlFor="locationPref">Work Arrangement</Label>
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
                  {isLoading ? 'Posting...' : 'Post Project'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push('/dashboard')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
