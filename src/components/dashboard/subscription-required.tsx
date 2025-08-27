import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface SubscriptionRequiredProps {
  role: 'developer' | 'company' | 'admin'
}

export function SubscriptionRequired({ role }: SubscriptionRequiredProps) {
  const price = role === 'developer' ? '$99' : role === 'company' ? '$499' : 'Free'
  const features = role === 'developer' 
    ? [
        'Create rich developer profile',
        'Access to project board',
        'Receive targeted project matches',
        'Direct messaging with companies'
      ]
    : role === 'company' ? [
        'Post unlimited projects',
        'Search vetted developers',
        'Smart matching system',
        'Direct messaging with developers'
      ]
    : [
        'Full platform access',
        'Admin panel access',
        'User management',
        'System administration'
      ]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Subscription Required</CardTitle>
          <p className="text-muted-foreground">
            To access your {role} dashboard, you need an active subscription.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-3xl font-bold">{price}</div>
            <div className="text-sm text-muted-foreground">per month</div>
          </div>
          
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center text-sm">
                <svg
                  className="w-4 h-4 text-green-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
          
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/pricing">Choose Plan</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/billing">Manage Billing</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}