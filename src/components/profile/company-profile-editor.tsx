'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DashboardNav } from '@/components/navigation/dashboard-nav'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Building2, Save, Loader2 } from 'lucide-react'

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

export function CompanyProfileEditor() {
  const router = useRouter()
  const profile = useQuery(api.profiles.getCurrent)
  const companyData = useQuery(api.companies.getCurrentProfile)
  const updateProfile = useMutation(api.profiles.update)
  const updateCompanyProfile = useMutation(api.companies.updateProfile)

  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [displayName, setDisplayName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [about, setAbout] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [industry, setIndustry] = useState('')
  const [size, setSize] = useState('')

  // Initialize form with existing data
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '')
    }
    if (companyData?.companyProfile) {
      const cp = companyData.companyProfile
      setCompanyName(cp.companyName || '')
      setAbout(cp.about || '')
      setWebsiteUrl(cp.websiteUrl || '')
      setIndustry(cp.industry || '')
      setSize(cp.size || '')
    }
  }, [profile, companyData])

  // Redirect if not a company
  useEffect(() => {
    if (profile && profile.role !== 'company') {
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

      // Update company profile
      await updateCompanyProfile({
        companyName: companyName.trim(),
        about: about.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
        industry: industry || undefined,
        size: size || undefined
      })

      router.push('/dashboard')
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (profile === undefined || companyData === undefined) {
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
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Company Profile</h1>
          <p className="text-gray-500 mt-1">
            Update your company information to attract top developers
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Company Information */}
          <Card className="bg-white border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 ring-2 ring-gray-100">
                  <AvatarImage src={companyData?.companyProfile?.logoUrl || profile?.avatarUrl || undefined} />
                  <AvatarFallback className="text-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                    {companyName?.charAt(0) || displayName?.charAt(0) || 'C'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div>
                    <Label htmlFor="displayName" className="text-gray-700">Profile Display Name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="How your profile appears on the platform"
                      className="rounded-xl border-gray-200 mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyName" className="text-gray-700">Official Company Name</Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Your legal company name"
                      className="rounded-xl border-gray-200 mt-1"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="about" className="text-gray-700">About Company</Label>
                <Textarea
                  id="about"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="Tell developers about your company, mission, culture, and what makes it a great place to work..."
                  className="min-h-[120px] rounded-xl border-gray-200 mt-1"
                />
              </div>

              <div>
                <Label htmlFor="websiteUrl" className="text-gray-700">Company Website</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourcompany.com"
                  className="rounded-xl border-gray-200 mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="industry" className="text-gray-700">Industry</Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger className="rounded-xl border-gray-200 mt-1">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map(ind => (
                        <SelectItem key={ind.value} value={ind.value}>
                          {ind.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="size" className="text-gray-700">Company Size</Label>
                  <Select value={size} onValueChange={setSize}>
                    <SelectTrigger className="rounded-xl border-gray-200 mt-1">
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANY_SIZES.map(s => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hiring Preferences */}
          <Card className="bg-white border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Hiring Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="font-semibold mb-2 text-gray-900">What We&apos;re Looking For</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Help developers understand what type of talent you typically seek. This will be used for smart matching.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <span className="w-32 font-medium text-gray-700">Typical Skills:</span>
                    <span className="text-gray-500">React, Node.js, Python, AWS (set when posting projects)</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="w-32 font-medium text-gray-700">Experience Level:</span>
                    <span className="text-gray-500">Mid to Senior level (3+ years)</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="w-32 font-medium text-gray-700">Work Style:</span>
                    <span className="text-gray-500">Remote, Contract & Full-time</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Culture */}
          <Card className="bg-white border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Company Culture & Benefits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="font-semibold mb-2 text-gray-900">Highlight Your Company</h4>
                <p className="text-sm text-gray-500 mb-4">
                  These details will appear on your company profile and help attract top developers.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Work Environment:</span>
                    <p className="text-gray-500 mt-1">Remote-first, flexible hours, modern tech stack</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Benefits:</span>
                    <p className="text-gray-500 mt-1">Health insurance, equity, professional development</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Team Size:</span>
                    <p className="text-gray-500 mt-1">Engineering team of 15-25 developers</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Growth:</span>
                    <p className="text-gray-500 mt-1">Series B funded, 200% YoY growth</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                Complete company information leads to 3x more quality applications
              </p>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isLoading || !companyName.trim()}
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
