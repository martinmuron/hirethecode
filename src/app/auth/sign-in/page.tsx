import { Metadata } from 'next'
import { SignInForm } from '@/components/auth/sign-in-form'

export const metadata: Metadata = {
  title: 'Sign In - Hire the Code',
  description: 'Sign in to your Hire the Code account',
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold">Sign in to your account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Don't have an account?{' '}
            <a href="/auth/sign-up" className="font-medium text-primary hover:underline">
              Sign up
            </a>
          </p>
        </div>
        <SignInForm />
      </div>
    </div>
  )
}