import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Welcome to Hire the Code</h1>
          <p className="text-muted-foreground mt-2">
            Your marketplace for premium developer talent
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Set Up Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Complete your profile to get started with the platform.
              </p>
              <Button asChild className="w-full">
                <Link href="/profile">Complete Profile</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Browse Projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Discover new opportunities from vetted companies.
              </p>
              <Button asChild className="w-full" variant="outline">
                <Link href="/projects">View Projects</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Search Developers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Find the perfect developers for your projects.
              </p>
              <Button asChild className="w-full" variant="outline">
                <Link href="/developers">Search Developers</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}