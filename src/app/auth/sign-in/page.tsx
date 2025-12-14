import { SignIn } from '@clerk/nextjs'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In - Hire the Code',
  description: 'Sign in to your Hire the Code account',
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  )
}
