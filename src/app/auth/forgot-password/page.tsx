import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Password reset functionality is coming soon. For now, please contact support if you need to reset your password.
            </div>
            <Link 
              href="/auth/sign-in" 
              className="flex items-center gap-2 text-primary hover:underline text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
