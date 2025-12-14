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
import { Plus, X, Save, User as UserIcon } from 'lucide-react'
import type { Profile, User, DeveloperProfile, Skill } from '@/lib/db/schema'

interface DeveloperProfileEditorProps {
  profile: Profile
  user: User
  developerProfile: DeveloperProfile | null
  userSkills: Array<{
    skill: Skill
    level: string
  }>
}

interface SkillWithLevel {
  id: number
  slug: string
  label: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

const COMMON_SKILLS = [
  { id: 1, slug: 'javascript', label: 'JavaScript' },
  { id: 2, slug: 'typescript', label: 'TypeScript' },
  { id: 3, slug: 'react', label: 'React' },
  { id: 4, slug: 'nextjs', label: 'Next.js' },
  { id: 5, slug: 'nodejs', label: 'Node.js' },
  { id: 6, slug: 'python', label: 'Python' },
  { id: 7, slug: 'java', label: 'Java' },
  { id: 8, slug: 'csharp', label: 'C#' },
  { id: 9, slug: 'php', label: 'PHP' },
  { id: 10, slug: 'golang', label: 'Go' },
]

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

const COUNTRIES = [
  { value: 'AF', label: 'Afghanistan' },
  { value: 'AL', label: 'Albania' },
  { value: 'DZ', label: 'Algeria' },
  { value: 'AD', label: 'Andorra' },
  { value: 'AO', label: 'Angola' },
  { value: 'AG', label: 'Antigua and Barbuda' },
  { value: 'AR', label: 'Argentina' },
  { value: 'AM', label: 'Armenia' },
  { value: 'AU', label: 'Australia' },
  { value: 'AT', label: 'Austria' },
  { value: 'AZ', label: 'Azerbaijan' },
  { value: 'BS', label: 'Bahamas' },
  { value: 'BH', label: 'Bahrain' },
  { value: 'BD', label: 'Bangladesh' },
  { value: 'BB', label: 'Barbados' },
  { value: 'BY', label: 'Belarus' },
  { value: 'BE', label: 'Belgium' },
  { value: 'BZ', label: 'Belize' },
  { value: 'BJ', label: 'Benin' },
  { value: 'BT', label: 'Bhutan' },
  { value: 'BO', label: 'Bolivia' },
  { value: 'BA', label: 'Bosnia and Herzegovina' },
  { value: 'BW', label: 'Botswana' },
  { value: 'BR', label: 'Brazil' },
  { value: 'BN', label: 'Brunei' },
  { value: 'BG', label: 'Bulgaria' },
  { value: 'BF', label: 'Burkina Faso' },
  { value: 'BI', label: 'Burundi' },
  { value: 'CV', label: 'Cabo Verde' },
  { value: 'KH', label: 'Cambodia' },
  { value: 'CM', label: 'Cameroon' },
  { value: 'CA', label: 'Canada' },
  { value: 'CF', label: 'Central African Republic' },
  { value: 'TD', label: 'Chad' },
  { value: 'CL', label: 'Chile' },
  { value: 'CN', label: 'China' },
  { value: 'CO', label: 'Colombia' },
  { value: 'KM', label: 'Comoros' },
  { value: 'CG', label: 'Congo' },
  { value: 'CD', label: 'Congo, Democratic Republic of the' },
  { value: 'CR', label: 'Costa Rica' },
  { value: 'HR', label: 'Croatia' },
  { value: 'CU', label: 'Cuba' },
  { value: 'CY', label: 'Cyprus' },
  { value: 'CZ', label: 'Czech Republic' },
  { value: 'DK', label: 'Denmark' },
  { value: 'DJ', label: 'Djibouti' },
  { value: 'DM', label: 'Dominica' },
  { value: 'DO', label: 'Dominican Republic' },
  { value: 'EC', label: 'Ecuador' },
  { value: 'EG', label: 'Egypt' },
  { value: 'SV', label: 'El Salvador' },
  { value: 'GQ', label: 'Equatorial Guinea' },
  { value: 'ER', label: 'Eritrea' },
  { value: 'EE', label: 'Estonia' },
  { value: 'SZ', label: 'Eswatini' },
  { value: 'ET', label: 'Ethiopia' },
  { value: 'FJ', label: 'Fiji' },
  { value: 'FI', label: 'Finland' },
  { value: 'FR', label: 'France' },
  { value: 'GA', label: 'Gabon' },
  { value: 'GM', label: 'Gambia' },
  { value: 'GE', label: 'Georgia' },
  { value: 'DE', label: 'Germany' },
  { value: 'GH', label: 'Ghana' },
  { value: 'GR', label: 'Greece' },
  { value: 'GD', label: 'Grenada' },
  { value: 'GT', label: 'Guatemala' },
  { value: 'GN', label: 'Guinea' },
  { value: 'GW', label: 'Guinea-Bissau' },
  { value: 'GY', label: 'Guyana' },
  { value: 'HT', label: 'Haiti' },
  { value: 'HN', label: 'Honduras' },
  { value: 'HU', label: 'Hungary' },
  { value: 'IS', label: 'Iceland' },
  { value: 'IN', label: 'India' },
  { value: 'ID', label: 'Indonesia' },
  { value: 'IR', label: 'Iran' },
  { value: 'IQ', label: 'Iraq' },
  { value: 'IE', label: 'Ireland' },
  { value: 'IL', label: 'Israel' },
  { value: 'IT', label: 'Italy' },
  { value: 'CI', label: 'Ivory Coast' },
  { value: 'JM', label: 'Jamaica' },
  { value: 'JP', label: 'Japan' },
  { value: 'JO', label: 'Jordan' },
  { value: 'KZ', label: 'Kazakhstan' },
  { value: 'KE', label: 'Kenya' },
  { value: 'KI', label: 'Kiribati' },
  { value: 'KP', label: 'Korea, North' },
  { value: 'KR', label: 'Korea, South' },
  { value: 'KW', label: 'Kuwait' },
  { value: 'KG', label: 'Kyrgyzstan' },
  { value: 'LA', label: 'Laos' },
  { value: 'LV', label: 'Latvia' },
  { value: 'LB', label: 'Lebanon' },
  { value: 'LS', label: 'Lesotho' },
  { value: 'LR', label: 'Liberia' },
  { value: 'LY', label: 'Libya' },
  { value: 'LI', label: 'Liechtenstein' },
  { value: 'LT', label: 'Lithuania' },
  { value: 'LU', label: 'Luxembourg' },
  { value: 'MG', label: 'Madagascar' },
  { value: 'MW', label: 'Malawi' },
  { value: 'MY', label: 'Malaysia' },
  { value: 'MV', label: 'Maldives' },
  { value: 'ML', label: 'Mali' },
  { value: 'MT', label: 'Malta' },
  { value: 'MH', label: 'Marshall Islands' },
  { value: 'MR', label: 'Mauritania' },
  { value: 'MU', label: 'Mauritius' },
  { value: 'MX', label: 'Mexico' },
  { value: 'FM', label: 'Micronesia' },
  { value: 'MD', label: 'Moldova' },
  { value: 'MC', label: 'Monaco' },
  { value: 'MN', label: 'Mongolia' },
  { value: 'ME', label: 'Montenegro' },
  { value: 'MA', label: 'Morocco' },
  { value: 'MZ', label: 'Mozambique' },
  { value: 'MM', label: 'Myanmar' },
  { value: 'NA', label: 'Namibia' },
  { value: 'NR', label: 'Nauru' },
  { value: 'NP', label: 'Nepal' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'NZ', label: 'New Zealand' },
  { value: 'NI', label: 'Nicaragua' },
  { value: 'NE', label: 'Niger' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'MK', label: 'North Macedonia' },
  { value: 'NO', label: 'Norway' },
  { value: 'OM', label: 'Oman' },
  { value: 'PK', label: 'Pakistan' },
  { value: 'PW', label: 'Palau' },
  { value: 'PS', label: 'Palestine' },
  { value: 'PA', label: 'Panama' },
  { value: 'PG', label: 'Papua New Guinea' },
  { value: 'PY', label: 'Paraguay' },
  { value: 'PE', label: 'Peru' },
  { value: 'PH', label: 'Philippines' },
  { value: 'PL', label: 'Poland' },
  { value: 'PT', label: 'Portugal' },
  { value: 'QA', label: 'Qatar' },
  { value: 'RO', label: 'Romania' },
  { value: 'RU', label: 'Russia' },
  { value: 'RW', label: 'Rwanda' },
  { value: 'KN', label: 'Saint Kitts and Nevis' },
  { value: 'LC', label: 'Saint Lucia' },
  { value: 'VC', label: 'Saint Vincent and the Grenadines' },
  { value: 'WS', label: 'Samoa' },
  { value: 'SM', label: 'San Marino' },
  { value: 'ST', label: 'Sao Tome and Principe' },
  { value: 'SA', label: 'Saudi Arabia' },
  { value: 'SN', label: 'Senegal' },
  { value: 'RS', label: 'Serbia' },
  { value: 'SC', label: 'Seychelles' },
  { value: 'SL', label: 'Sierra Leone' },
  { value: 'SG', label: 'Singapore' },
  { value: 'SK', label: 'Slovakia' },
  { value: 'SI', label: 'Slovenia' },
  { value: 'SB', label: 'Solomon Islands' },
  { value: 'SO', label: 'Somalia' },
  { value: 'ZA', label: 'South Africa' },
  { value: 'SS', label: 'South Sudan' },
  { value: 'ES', label: 'Spain' },
  { value: 'LK', label: 'Sri Lanka' },
  { value: 'SD', label: 'Sudan' },
  { value: 'SR', label: 'Suriname' },
  { value: 'SE', label: 'Sweden' },
  { value: 'CH', label: 'Switzerland' },
  { value: 'SY', label: 'Syria' },
  { value: 'TW', label: 'Taiwan' },
  { value: 'TJ', label: 'Tajikistan' },
  { value: 'TZ', label: 'Tanzania' },
  { value: 'TH', label: 'Thailand' },
  { value: 'TL', label: 'Timor-Leste' },
  { value: 'TG', label: 'Togo' },
  { value: 'TO', label: 'Tonga' },
  { value: 'TT', label: 'Trinidad and Tobago' },
  { value: 'TN', label: 'Tunisia' },
  { value: 'TR', label: 'Turkey' },
  { value: 'TM', label: 'Turkmenistan' },
  { value: 'TV', label: 'Tuvalu' },
  { value: 'UG', label: 'Uganda' },
  { value: 'UA', label: 'Ukraine' },
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'US', label: 'United States' },
  { value: 'UY', label: 'Uruguay' },
  { value: 'UZ', label: 'Uzbekistan' },
  { value: 'VU', label: 'Vanuatu' },
  { value: 'VA', label: 'Vatican City' },
  { value: 'VE', label: 'Venezuela' },
  { value: 'VN', label: 'Vietnam' },
  { value: 'YE', label: 'Yemen' },
  { value: 'ZM', label: 'Zambia' },
  { value: 'ZW', label: 'Zimbabwe' },
  { value: 'LN', label: 'Luna (The Moon)' }
]

export function DeveloperProfileEditor({ 
  profile, 
  user, 
  developerProfile,
  userSkills 
}: DeveloperProfileEditorProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [displayName, setDisplayName] = useState(profile.displayName || '')
  const [headline, setHeadline] = useState(developerProfile?.headline || '')
  const [bio, setBio] = useState(developerProfile?.bio || '')
  const [rate, setRate] = useState(developerProfile?.rate || '')
  const [availability, setAvailability] = useState<'available' | 'busy' | 'unavailable'>(
    (developerProfile?.availability as 'available' | 'busy' | 'unavailable') || 'available'
  )
  const [portfolioUrl, setPortfolioUrl] = useState(developerProfile?.portfolioUrl || '')
  const [githubUrl, setGithubUrl] = useState(developerProfile?.githubUrl || '')
  const [websiteUrl, setWebsiteUrl] = useState(developerProfile?.websiteUrl || '')
  const [country, setCountry] = useState(developerProfile?.country || '')

  // Skills state
  const [skills, setSkills] = useState<SkillWithLevel[]>(
    userSkills.map(us => ({
      id: us.skill.id,
      slug: us.skill.slug,
      label: us.skill.label,
      level: us.level as any
    }))
  )
  const [newSkill, setNewSkill] = useState('')
  const [newSkillLevel, setNewSkillLevel] = useState<string>('intermediate')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/profile/developer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          headline,
          bio,
          rate: rate ? parseFloat(rate) : null,
          availability,
          portfolioUrl: portfolioUrl || null,
          githubUrl: githubUrl || null,
          websiteUrl: websiteUrl || null,
          country: country || null,
          skills: skills.map(skill => ({
            skillId: skill.id,
            level: skill.level
          }))
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

  const addSkill = () => {
    const skillToAdd = COMMON_SKILLS.find(s => 
      s.label.toLowerCase() === newSkill.toLowerCase()
    )
    
    if (skillToAdd && !skills.find(s => s.id === skillToAdd.id)) {
      setSkills([...skills, {
        ...skillToAdd,
        level: newSkillLevel as any
      }])
      setNewSkill('')
      setNewSkillLevel('intermediate')
    }
  }

  const removeSkill = (skillId: number) => {
    setSkills(skills.filter(s => s.id !== skillId))
  }

  const updateSkillLevel = (skillId: number, level: string) => {
    setSkills(skills.map(s => 
      s.id === skillId ? { ...s, level: level as any } : s
    ))
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav role={profile.role as 'developer' | 'company' | 'admin'} />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Developer Profile</h1>
          <p className="text-muted-foreground">
            Update your profile to attract the right opportunities
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.image || undefined} />
                  <AvatarFallback className="text-lg">
                    {displayName?.charAt(0) || user.name?.charAt(0) || 'D'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your professional name"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="headline">Professional Headline</Label>
                <Input
                  id="headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g., Full-Stack Developer specializing in React & Node.js"
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell companies about your experience, passion, and what you're looking for..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rate">Hourly Rate (USD)</Label>
                  <Input
                    id="rate"
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    placeholder="150"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="availability">Availability</Label>
                  <Select 
                    value={availability} 
                    onValueChange={(value) => setAvailability(value as 'available' | 'busy' | 'unavailable')}
                  >
                    <SelectTrigger>
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
          <Card>
            <CardHeader>
              <CardTitle>Skills & Expertise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <div key={skill.id} className="flex items-center gap-1">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {skill.label}
                      <Select 
                        value={skill.level} 
                        onValueChange={(level) => updateSkillLevel(skill.id, level)}
                      >
                        <SelectTrigger className="h-6 w-fit border-0 p-0 text-xs">
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
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
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
                />
                <Select value={newSkillLevel} onValueChange={setNewSkillLevel}>
                  <SelectTrigger className="w-32">
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
                <Button type="button" onClick={addSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Links & Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Links & Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                  <Input
                    id="portfolioUrl"
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://yourportfolio.com"
                  />
                </div>
                <div>
                  <Label htmlFor="githubUrl">GitHub Profile</Label>
                  <Input
                    id="githubUrl"
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/yourusername"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="websiteUrl">Personal Website</Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={country}
                    onValueChange={(value) => setCountry(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map(option => (
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
