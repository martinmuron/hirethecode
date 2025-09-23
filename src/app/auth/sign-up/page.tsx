import { Metadata } from 'next'
import { SignUpForm } from '@/components/auth/sign-up-form'
// import { useSearchParams } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Sign Up - Hire the Code',
  description: 'Create your Hire the Code account',
}

export default function SignUpPage() {
  // const searchParams =  useSearchParams()
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold">Create your account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Already have an account?{' '}
            <a href="/auth/sign-in" className="font-medium text-primary hover:underline">
              Sign in
            </a>
          </p>
        </div>
        <SignUpForm />
      </div>
    </div>
  )
}
