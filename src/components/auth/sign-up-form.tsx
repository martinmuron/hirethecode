'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { AlertCircle, CheckCircle } from 'lucide-react'

export function SignUpForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'developer' | 'company'>('developer')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  // const [message, setMessage] = useState('')

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    // setMessage('')
    setSuccess(false)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          role
        }),
      })

      const data = await response.json()

      if(response.ok) {
        setSuccess(true)

        const signInResult = await signIn('credentials', {
          email: email.trim(),
          password,
          redirect: false,
        })

        if(signInResult?.ok) {
          router.push('/profile/setup')
        } else {
          router.push('/auth/sign-in?message=account-created')
        }
      } else {
        setError(data.error || 'Something went wrong. Please try one more time.')
      }
    } catch (err) {
      setError('Something failed. Go have a nice cup of ginger tea and come back in an hour to try again.')
    }
    
    setIsLoading(false)
  }

  const handleOAuthSignUp = async (provider: 'github' | 'google') => {
    setIsLoading(true)
    await signIn(provider, { callbackUrl: '/dashboard' })
  }

  if(success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Account Created!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Your account has been created successfully. Signing you in...
          </p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleEmailSignUp} className="space-y-4">
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
            />
          </div>
          
          <div className="space-y-3">
            <Label>Account Type</Label>
            <RadioGroup 
              value={role} 
              onValueChange={(value) => setRole(value as 'developer' | 'company')}
              disabled={isLoading}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="developer" id="developer" />
                <Label htmlFor="developer" className="cursor-pointer">
                  Developer - Looking for projects
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="company" id="company" />
                <Label htmlFor="company" className="cursor-pointer">
                  Company - Hiring developers
                </Label>
              </div>
            </RadioGroup>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-sm bg-red-50 text-red-600 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
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
            onClick={() => handleOAuthSignUp('github')}
            disabled={isLoading}
          >
            GitHub
          </Button>
          <Button
            variant="outline"
            onClick={() => handleOAuthSignUp('google')}
            disabled={isLoading}
          >
            Google
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
