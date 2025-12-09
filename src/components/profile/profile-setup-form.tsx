'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Users, Building2, Loader2, Check } from 'lucide-react'

export function ProfileSetupForm() {
  const [selectedRole, setSelectedRole] = useState<'developer' | 'company' | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const createProfile = useMutation(api.profiles.create)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedRole || !displayName.trim()) {
      return
    }

    setIsLoading(true)

    try {
      await createProfile({
        role: selectedRole,
        displayName: displayName.trim(),
      })

      router.push('/dashboard')
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
        <Label className="text-base font-semibold text-gray-900">I am a...</Label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card
            className={`cursor-pointer transition-all duration-200 border-2 ${
              selectedRole === 'developer'
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
            onClick={() => setSelectedRole('developer')}
          >
            <CardContent className="p-6 text-center relative">
              {selectedRole === 'developer' && (
                <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
              <div
                className={`h-16 w-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                  selectedRole === 'developer' ? 'bg-blue-500' : 'bg-blue-100'
                }`}
              >
                <Users
                  className={`h-8 w-8 ${
                    selectedRole === 'developer' ? 'text-white' : 'text-blue-600'
                  }`}
                />
              </div>
              <h3 className="font-semibold text-lg text-gray-900">Developer</h3>
              <p className="text-sm text-gray-500 mt-1">
                Find exciting projects and work with top companies
              </p>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all duration-200 border-2 ${
              selectedRole === 'company'
                ? 'border-green-500 bg-green-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
            onClick={() => setSelectedRole('company')}
          >
            <CardContent className="p-6 text-center relative">
              {selectedRole === 'company' && (
                <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
              <div
                className={`h-16 w-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                  selectedRole === 'company' ? 'bg-green-500' : 'bg-green-100'
                }`}
              >
                <Building2
                  className={`h-8 w-8 ${
                    selectedRole === 'company' ? 'text-white' : 'text-green-600'
                  }`}
                />
              </div>
              <h3 className="font-semibold text-lg text-gray-900">Company</h3>
              <p className="text-sm text-gray-500 mt-1">
                Find vetted developers for your projects
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Display Name */}
      <div className="space-y-2">
        <Label htmlFor="displayName" className="text-gray-700">
          {selectedRole === 'company' ? 'Company Name' : 'Display Name'}
        </Label>
        <Input
          id="displayName"
          type="text"
          placeholder={
            selectedRole === 'company'
              ? 'Enter your company name'
              : 'Enter your name'
          }
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-12 rounded-full font-medium"
        disabled={!selectedRole || !displayName.trim() || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Profile...
          </>
        ) : (
          'Create Profile'
        )}
      </Button>
    </form>
  )
}
