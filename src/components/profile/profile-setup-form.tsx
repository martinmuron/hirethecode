'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Code, Search, Building2 } from 'lucide-react'

interface ProfileSetupFormProps {
  userEmail: string
  userId: string
  name: string
  role: string
}

export function ProfileSetupForm({ 
  userEmail, 
  userId,
  name,
  role
}: ProfileSetupFormProps) {
  console.log(`SETUP FORM > userEmail: ${userEmail}, userId: ${userId}, name: ${name}, role: ${role}`)
  
  // FIXED: Added 'seeker' to the type and properly cast the role prop
  const [selectedRole, setSelectedRole] = useState<'developer' | 'company' | 'seeker' | null>(
    (role as 'developer' | 'company' | 'seeker') || null
  )
  const [displayName, setDisplayName] = useState(name ? name : '')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedRole || !displayName.trim()) {
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/profile/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          role: selectedRole,
          displayName: displayName.trim(),
        }),
      })

      if (response.ok) {
        router.push('/dashboard')
      } else {
        console.error('Failed to create profile')
      }
    } catch (error) {
      console.error('Error creating profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // IMPROVED: Role data with better content and styling
  const roles = [
    {
      id: 'seeker' as const,
      title: 'Project Seeker',
      subtitle: 'I need development work done',
      description: 'Post projects and get matched with qualified developers and teams',
      icon: Search,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      id: 'developer' as const,
      title: 'Freelance Developer',
      subtitle: 'I build applications',
      description: 'Find exciting projects and clients who need your skills',
      icon: Code,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'company' as const,
      title: 'Development Company',
      subtitle: 'We have a dev team',
      description: 'Offer development services and take on larger projects',
      icon: Building2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Choose Your Account Type</h2>
        <p className="text-muted-foreground">
          Select the option that best describes how you'll use the platform
        </p>
      </div>

      <div className="space-y-4">
        {roles.map((roleOption) => {
          const Icon = roleOption.icon
          const isSelected = selectedRole === roleOption.id
          
          return (
            <Card 
              key={roleOption.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected 
                  ? 'ring-2 ring-primary border-primary shadow-md bg-primary/5' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => setSelectedRole(roleOption.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 ${roleOption.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-6 w-6 ${roleOption.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{roleOption.title}</h3>
                      <p className="text-sm font-medium text-primary">{roleOption.subtitle}</p>
                      {isSelected && (
                        <div className="ml-auto w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {roleOption.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Selection Indicator */}
      {selectedRole && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-medium text-primary">
              {roles.find(r => r.id === selectedRole)?.title} selected
            </span>
          </div>
        </div>
      )}

      {/* Display Name */}
      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          type="text"
          placeholder="Your name or company name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button 
          type="submit" 
          size="lg"
          className="min-w-48"
          disabled={!selectedRole || !displayName.trim() || isLoading}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Creating Profile...
            </>
          ) : (
            <>
              Create Profile
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </Button>
      </div>

      {/* Help Text */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          You can always update your account type later in your profile settings
        </p>
      </div>
    </form>
  )
}
