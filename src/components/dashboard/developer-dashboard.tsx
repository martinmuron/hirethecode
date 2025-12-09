'use client'

import { useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Briefcase, User, CreditCard, Bell, ArrowRight, Sparkles } from 'lucide-react'

export function DeveloperDashboard() {
  const profile = useQuery(api.profiles.getCurrent)
  const developerProfile = useQuery(api.developers.getCurrentProfile)
  const applications = useQuery(api.applications.getByDeveloper)
  const subscription = useQuery(api.subscriptions.get)
  const notifications = useQuery(api.notifications.list, { limit: 5 })
  const openProjectsCount = useQuery(api.projects.countOpen)

  const displayName = profile?.displayName || 'Developer'

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Welcome back, {displayName}
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your profile and discover new opportunities
          </p>
        </div>
        <Button asChild className="rounded-full px-6">
          <Link href="/projects">
            <Sparkles className="mr-2 h-4 w-4" />
            Find Projects
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Open Projects</p>
                <p className="text-3xl font-semibold text-gray-900 mt-1">
                  {openProjectsCount ?? 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Applications</p>
                <p className="text-3xl font-semibold text-gray-900 mt-1">
                  {applications?.length ?? 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
                <User className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Subscription</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {subscription?.status === 'active' ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Availability</p>
                <Badge
                  variant={
                    developerProfile?.developerProfile?.availability === 'available'
                      ? 'default'
                      : 'secondary'
                  }
                  className="mt-2 capitalize"
                >
                  {developerProfile?.developerProfile?.availability || 'Not set'}
                </Badge>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center">
                <Bell className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="bg-white border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Profile Status</span>
                <Badge variant="secondary" className="rounded-full">
                  {developerProfile?.developerProfile?.headline ? 'Complete' : 'Incomplete'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Skills Added</span>
                <span className="font-medium">{developerProfile?.skills?.length ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Hourly Rate</span>
                <span className="font-medium">
                  {developerProfile?.developerProfile?.rate
                    ? `$${developerProfile.developerProfile.rate}/hr`
                    : 'Not set'}
                </span>
              </div>
            </div>
            <Button asChild className="w-full rounded-full" variant="outline">
              <Link href="/profile">
                Edit Profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card className="bg-white border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {applications && applications.length > 0 ? (
              <div className="space-y-3">
                {applications.slice(0, 3).filter((app): app is NonNullable<typeof app> => app !== null).map((app) => (
                  <div
                    key={app._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-sm">{app.project?.title}</p>
                      <p className="text-xs text-gray-500">
                        {app.project?.company?.companyName}
                      </p>
                    </div>
                    <Badge
                      variant={
                        app.status === 'accepted'
                          ? 'default'
                          : app.status === 'rejected'
                          ? 'destructive'
                          : 'secondary'
                      }
                      className="rounded-full capitalize"
                    >
                      {app.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No applications yet. Browse projects to get started.
              </p>
            )}
            <Button asChild variant="outline" className="w-full mt-4 rounded-full">
              <Link href="/projects">Browse Projects</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-white border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start rounded-xl h-12">
              <Link href="/profile">
                <User className="mr-3 h-4 w-4 text-gray-500" />
                Update Profile
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start rounded-xl h-12">
              <Link href="/projects">
                <Briefcase className="mr-3 h-4 w-4 text-gray-500" />
                View All Projects
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start rounded-xl h-12">
              <Link href="/billing">
                <CreditCard className="mr-3 h-4 w-4 text-gray-500" />
                Billing Settings
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Notifications */}
      <Card className="bg-white border-gray-100 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Notifications</CardTitle>
            <Button variant="ghost" size="sm" asChild className="rounded-full">
              <Link href="/notifications">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {notifications && notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 rounded-xl ${
                    notification.isRead ? 'bg-gray-50' : 'bg-blue-50 border border-blue-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                    </div>
                    {!notification.isRead && (
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No notifications yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
