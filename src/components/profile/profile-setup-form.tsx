'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Users, Building2 } from 'lucide-react'

interface ProfileSetupFormProps {
  userEmail: string
  userId: string
  name: string
  role: string
}

export function ProfileSetupForm({ 
  userEmail, 
  userId ,
  name,
  role
}: ProfileSetupFormProps) {
  console.log(`SETUP FORM > userEmail: ${userEmail}, userId: ${userId}, name: ${name}, role: ${role}`)
  const [selectedRole, setSelectedRole] = useState<'developer' | 'company' | null>(role)
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Role Selection */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">I am a...</Label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedRole === 'developer' 
                ? 'ring-2 ring-primary border-primary' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => setSelectedRole('developer')}
          >
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="font-semibold text-lg">Developer</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Find exciting projects and work with top companies
              </p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedRole === 'company' 
                ? 'ring-2 ring-primary border-primary' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => setSelectedRole('company')}
          >
            <CardContent className="p-6 text-center">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h3 className="font-semibold text-lg">Company</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Find vetted developers for your projects
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

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
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!selectedRole || !displayName.trim() || isLoading}
      >
        {isLoading ? 'Creating Profile...' : 'Create Profile'}
      </Button>
    </form>
  )
}
