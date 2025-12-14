import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import type { Profile } from '@/lib/db/schema'
import { DashboardNav } from '@/components/navigation/dashboard-nav'
import { Bell } from 'lucide-react'

interface DeveloperDashboardProps {
  profile: Profile
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  unreadNotificationCount?: number
}

export function DeveloperDashboard({ profile, user, unreadNotificationCount = 0 }: DeveloperDashboardProps) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav role={profile.role as 'developer' | 'company' | 'admin'} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back, {profile.displayName || 'Developer'}!</h1>
          <p className="text-muted-foreground">Manage your profile and discover new opportunities</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Profile Status */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Profile</span>
                <Badge variant="secondary">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Subscription</span>
                <Badge variant="default">Developer Plan</Badge>
              </div>
              <Button asChild className="w-full mt-4">
                <Link href="/profile">Edit Profile</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Project Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                No recent matches. Complete your profile to get better matches.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/projects">Browse Projects</Link>
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
                <Link href="/profile">Update Skills</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/projects">View Projects</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/billing">Billing Settings</Link>
              </Button>
              {/* NEW: Notifications Button */}
              <Button asChild variant="outline" className="w-full justify-start relative">
                <Link href="/notifications" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                  {unreadNotificationCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="ml-auto h-5 w-5 p-0 flex items-center justify-center text-xs"
                    >
                      {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                    </Badge>
                  )}
                </Link>
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
              No recent activity. Start by completing your profile and browsing available projects.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
