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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Building2, Save, Plus, X } from 'lucide-react'
import type { Profile, User, CompanyProfile } from '@/lib/db/schema'

interface CompanyProfileEditorProps {
  profile: Profile
  user: User
  companyProfile: CompanyProfile | null
  companySkills?: Array<{
    skillId: number
    label: string
    importance: 'nice_to_have' | 'preferred' | 'required'
  }>
}

const COMPANY_SIZES = [
  { value: 'startup', label: 'Startup (1-10 employees)' },
  { value: 'small', label: 'Small (11-50 employees)' },
  { value: 'medium', label: 'Medium (51-200 employees)' },
  { value: 'large', label: 'Large (201-1000 employees)' },
  { value: 'enterprise', label: 'Enterprise (1000+ employees)' }
]

const INDUSTRIES = [
  { value: 'technology', label: 'Technology' },
  { value: 'fintech', label: 'Financial Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'education', label: 'Education' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'media', label: 'Media & Entertainment' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'other', label: 'Other' }
]

const EXPERIENCE_LEVELS = [
  { value: 'junior', label: 'Junior (0-2 years)' },
  { value: 'mid', label: 'Mid-level (2-5 years)' },
  { value: 'senior', label: 'Senior (5+ years)' },
  { value: 'lead', label: 'Lead/Staff (8+ years)' },
  { value: 'any', label: 'Any experience level' }
]

const WORK_STYLES = [
  { value: 'remote', label: 'Remote Only' },
  { value: 'hybrid', label: 'Hybrid (Remote + Office)' },
  { value: 'onsite', label: 'On-site Only' },
  { value: 'flexible', label: 'Flexible Arrangement' }
]

const IMPORTANCE_LEVELS = [
  { value: 'nice_to_have', label: 'Nice to Have', color: 'bg-gray-100 text-gray-700' },
  { value: 'preferred', label: 'Preferred', color: 'bg-blue-100 text-blue-700' },
  { value: 'required', label: 'Required', color: 'bg-red-100 text-red-700' }
]

const COMMON_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Python', 'Java', 
  'C#', 'PHP', 'Go', 'Rust', 'Swift', 'Kotlin', 'Vue.js', 'Angular', 'Svelte',
  'Express.js', 'NestJS', 'Django', 'Flask', 'Rails', 'Laravel', 'Spring',
  '.NET', 'AWS', 'Google Cloud', 'Azure', 'Docker', 'Kubernetes', 'MongoDB',
  'PostgreSQL', 'MySQL', 'Redis', 'GraphQL', 'REST APIs', 'Git', 'Linux'
]

export function CompanyProfileEditor({ 
  profile, 
  user, 
  companyProfile,
  companySkills = []
}: CompanyProfileEditorProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [displayName, setDisplayName] = useState(profile.displayName || '')
  const [companyName, setCompanyName] = useState(companyProfile?.companyName || '')
  const [about, setAbout] = useState(companyProfile?.about || '')
  const [websiteUrl, setWebsiteUrl] = useState(companyProfile?.websiteUrl || '')
  const [industry, setIndustry] = useState(companyProfile?.industry || '')
  const [size, setSize] = useState(companyProfile?.size || '')
  const [experienceLevel, setExperienceLevel] = useState(companyProfile?.experienceLevel || '')
  const [workStyle, setWorkStyle] = useState(companyProfile?.workStyle || '')
  const [selectedSkills, setSelectedSkills] = useState<Array<{
    label: string
    importance: 'nice_to_have' | 'preferred' | 'required'
  }>>(companySkills.map(skill => ({
    label: skill.label,
    importance: skill.importance
  })))
  const [newSkill, setNewSkill] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/profile/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          companyName,
          about: about || null,
          websiteUrl: websiteUrl || null,
          industry: industry || null,
          size: size || null,
          experienceLevel: experienceLevel || null,
          workStyle: workStyle || null,
          skills: selectedSkills,
        }),
      })

      if (response.ok) {
        router.push('/dashboard')
      } else {
        console.error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addSkill = (skillLabel: string, importance: 'nice_to_have' | 'preferred' | 'required' = 'preferred') => {
    if (!selectedSkills.find(s => s.label === skillLabel)) {
      setSelectedSkills([...selectedSkills, { label: skillLabel, importance }])
    }
    setNewSkill('')
  }

  const removeSkill = (skillLabel: string) => {
    setSelectedSkills(selectedSkills.filter(s => s.label !== skillLabel))
  }

  const updateSkillImportance = (skillLabel: string, importance: 'nice_to_have' | 'preferred' | 'required') => {
    setSelectedSkills(selectedSkills.map(skill => 
      skill.label === skillLabel ? { ...skill, importance } : skill
    ))
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} role={profile.role as 'developer' | 'company' | 'admin'} />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Company Profile</h1>
          <p className="text-muted-foreground">
            Update your company information to attract top developers
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={companyProfile?.logoUrl || user.image || undefined} />
                  <AvatarFallback className="text-lg">
                    {companyName?.charAt(0) || displayName?.charAt(0) || 'C'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div>
                    <Label htmlFor="displayName">Profile Display Name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="How your profile appears on the platform"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyName">Official Company Name</Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Your legal company name"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="about">About Company</Label>
                <Textarea
                  id="about"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="Tell developers about your company, mission, culture, and what makes it a great place to work..."
                  className="min-h-[120px]"
                />
              </div>

              <div>
                <Label htmlFor="websiteUrl">Company Website</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourcompany.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map(industry => (
                        <SelectItem key={industry.value} value={industry.value}>
                          {industry.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="size">Company Size</Label>
                  <Select value={size} onValueChange={setSize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANY_SIZES.map(size => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hiring Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Hiring Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="experienceLevel">Preferred Experience Level</Label>
                  <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERIENCE_LEVELS.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="workStyle">Work Style Preference</Label>
                  <Select value={workStyle} onValueChange={setWorkStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select work style" />
                    </SelectTrigger>
                    <SelectContent>
                      {WORK_STYLES.map(style => (
                        <SelectItem key={style.value} value={style.value}>
                          {style.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Skills Section */}
              <div className="space-y-4">
                <Label>Skills We Typically Look For</Label>
                
                {/* Current Skills */}
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map((skill) => {
                    const importanceConfig = IMPORTANCE_LEVELS.find(l => l.value === skill.importance)
                    return (
                      <div key={skill.label} className="flex items-center gap-1">
                        <Badge 
                          variant="secondary" 
                          className={`${importanceConfig?.color} flex items-center gap-1`}
                        >
                          {skill.label}
                          <Select 
                            value={skill.importance} 
                            onValueChange={(value) => updateSkillImportance(skill.label, value as any)}
                          >
                            <SelectTrigger className="h-5 w-5 p-0 border-none bg-transparent">
                              <div className="h-2 w-2 rounded-full bg-current opacity-50" />
                            </SelectTrigger>
                            <SelectContent>
                              {IMPORTANCE_LEVELS.map(level => (
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
                            className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground ml-1"
                            onClick={() => removeSkill(skill.label)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      </div>
                    )
                  })}
                </div>

                {/* Add Skills */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add skill..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        if (newSkill.trim()) addSkill(newSkill.trim())
                      }
                    }}
                    list="skills-suggestions"
                  />
                  <datalist id="skills-suggestions">
                    {COMMON_SKILLS.map(skill => (
                      <option key={skill} value={skill} />
                    ))}
                  </datalist>
                  <Button 
                    type="button" 
                    onClick={() => newSkill.trim() && addSkill(newSkill.trim())}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Quick Add Popular Skills */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Quick Add Popular Skills:</h4>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_SKILLS.slice(0, 12).map((skill) => (
                      <Button
                        key={skill}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addSkill(skill)}
                        disabled={selectedSkills.some(s => s.label === skill)}
                        className="text-xs"
                      >
                        {skill}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-gray-400" />
                  <span>Nice to Have</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span>Preferred</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span>Required</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Culture */}
          <Card>
            <CardHeader>
              <CardTitle>Company Culture & Benefits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Highlight Your Company</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  These details will appear on your company profile and help attract top developers.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Work Environment:</span>
                    <p className="text-muted-foreground mt-1">Remote-first, flexible hours, modern tech stack</p>
                  </div>
                  <div>
                    <span className="font-medium">Benefits:</span>
                    <p className="text-muted-foreground mt-1">Health insurance, equity, professional development</p>
                  </div>
                  <div>
                    <span className="font-medium">Team Size:</span>
                    <p className="text-muted-foreground mt-1">Engineering team of 15-25 developers</p>
                  </div>
                  <div>
                    <span className="font-medium">Growth:</span>
                    <p className="text-muted-foreground mt-1">Series B funded, 200% YoY growth</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                💡 Pro tip: Complete company information leads to 3x more quality applications
              </p>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save Profile'}
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
      </div>
    </div>
  )
}
