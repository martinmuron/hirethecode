'use client'

import { useState, useEffect } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect: (() => {
    const message = searchParams.get('message')
    if(message === 'account-created') {
      setSuccessMessage('Account created successfully! Please sign in.')
    }
  }, [searchParams])

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password. Take a walk for an hour or so, then come back and try again.')
      } else if(result?.ok) {
        const session = await getSession()

        if(session) {
          router.push('/dashboard')
        }
      }
    } catch(err) {
      setError('Something unforseen happened. Have a cookie and then come back later. Perhaps it will be fixed.')
      console.error('Sign-in error:', err)
    }
    
    setIsLoading(false)
  }

  const handleOAuthSignIn = async (provider: 'github' | 'google') => {
    setIsLoading(true)
    setError('')
    
    try {
      await signIn(provider, { 
        callbackUrl: '/dashboard',
        redirect: true 
      })
    } catch (err) {
      setError('OAuth sign-in failed. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in to your account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {successMessage && (
          <div className="flex items-center gap-2 p-3 text-sm bg-green-50 text-green-600 border border-green-200 rounded-md">
            <CheckCircle className="h-4 w-4" />
            {successMessage}
          </div>
        )}

        <form onSubmit={handleEmailSignIn} className="space-y-4">
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
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
                required
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link 
                href="/auth/forgot-password" 
                className="text-primary hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
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
            {isLoading ? 'Signing in...' : 'Sign in'}
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
            onClick={() => handleOAuthSignIn('github')}
            disabled={isLoading}
          >
            GitHub
          </Button>
          <Button
            variant="outline"
            onClick={() => handleOAuthSignIn('google')}
            disabled={isLoading}
          >
            Google
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link 
            href="/auth/sign-up" 
            className="text-primary hover:underline font-medium"
          >
            Create one here
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
