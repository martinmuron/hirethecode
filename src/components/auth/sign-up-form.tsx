'use client'

import { useState } from 'react'
import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle } from 'lucide-react'

export function SignUpForm() {
  const { signUp, isLoaded, setActive } = useSignUp()
  const router = useRouter()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'developer' | 'company' | 'seeker'>('seeker')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [pendingVerification, setPendingVerification] = useState(false)
  const [code, setCode] = useState('')

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return
    
    setIsLoading(true)
    setError('')

    try {
      // Create user with Clerk
      const result = await signUp.create({
        emailAddress: email.trim(),
        password,
        firstName: name.split(' ')[0] || name.trim(),
        lastName: name.split(' ').slice(1).join(' ') || '',
      })

      // If email verification is required
      if (result.status === 'missing_requirements') {
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
        setPendingVerification(true)
      } else if (result.status === 'complete') {
        // Sign in the user and save role to database
        await setActive({ session: result.createdSessionId })
        await saveRoleToDatabase(result.createdUserId, role)
        router.push('/profile/setup')
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Something went wrong. Please try again.')
    }
    
    setIsLoading(false)
  }

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return
    
    setIsLoading(true)
    setError('')

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      })

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId })
        await saveRoleToDatabase(completeSignUp.createdUserId, role)
        router.push('/profile/setup')
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Verification failed. Please try again.')
    }
    
    setIsLoading(false)
  }

  const saveRoleToDatabase = async (userId: string, userRole: string) => {
    try {
      await fetch('/api/profile/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          role: userRole,
          displayName: name.trim(),
        }),
      })
    } catch (error) {
      console.error('Failed to save role:', error)
    }
  }

  const handleOAuthSignUp = async (provider: 'oauth_github' | 'oauth_google') => {
    if (!isLoaded) return
    
    setIsLoading(true)
    try {
      await signUp.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: '/auth/sign-up/sso-callback',
        redirectUrlComplete: '/profile/setup'
      })
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'OAuth sign-up failed.')
      setIsLoading(false)
    }
  }

  // Email verification form
  if (pendingVerification) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verify your email</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            We've sent a verification code to {email}
          </p>
          <form onSubmit={handleVerification} className="space-y-4">
            <div>
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter verification code"
                required
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm bg-red-50 text-red-600 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  // Main sign-up form (keep your existing JSX but replace the form handler)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleEmailSignUp} className="space-y-4">
          {/* Keep all your existing form fields exactly the same */}
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your display name"
              disabled={isLoading}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isLoading}
              required
              autoComplete="email"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password (min 6 characters)"
              disabled={isLoading}
              required
              autoComplete="new-password"
            />
          </div>
          
          {/* Keep your role selection exactly the same */}
          <div className="space-y-3">
            <Label>Account Type</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="developer"
                  name="role"
                  value="developer"
                  checked={role === 'developer'}
                  onChange={(e) => setRole(e.target.value as 'developer' | 'company' | 'seeker')}
                  disabled={isLoading}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                />
                <Label htmlFor="developer" className="cursor-pointer font-normal">
                  <div>
                    <div className="font-medium">Developer</div>
                    <div className="text-xs text-muted-foreground">Looking for freelance projects</div>
                  </div>
                </Label>
              </div>
              {/* Keep other radio buttons the same */}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-sm bg-red-50 text-red-600 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={() => handleOAuthSignUp('oauth_github')}
            disabled={isLoading}
          >
            GitHub
          </Button>
          <Button
            variant="outline"
            onClick={() => handleOAuthSignUp('oauth_google')}
            disabled={isLoading}
          >
            Google
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
