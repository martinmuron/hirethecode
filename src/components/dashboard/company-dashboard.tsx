import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import type { Profile } from '@/lib/db/schema'

interface CompanyDashboardProps {
  profile: Profile
}

export function CompanyDashboard({ profile }: CompanyDashboardProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back, {profile.displayName || 'Company'}!</h1>
          <p className="text-muted-foreground">Find the perfect developers for your projects</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Company Status */}
          <Card>
            <CardHeader>
              <CardTitle>Company Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Profile</span>
                <Badge variant="secondary">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Subscription</span>
                <Badge variant="default">Company Plan</Badge>
              </div>
              <Button asChild className="w-full mt-4">
                <Link href="/profile">Edit Profile</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Active Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Active Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                No active projects. Start by posting your first project.
              </p>
              <Button asChild className="w-full">
                <Link href="/projects/new">Post Project</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/developers">Search Developers</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/smart-match">Smart Match</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/billing">Billing Settings</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No recent activity. Start by completing your company profile and posting your first project.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}