import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import type { Profile } from '@/lib/db/schema'
import { DashboardNav } from '@/components/navigation/dashboard-nav'
import { Bell, Plus, Briefcase, Users, Clock, Star } from 'lucide-react'

interface SeekerDashboardProps {
  profile: Profile
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  unreadNotificationCount?: number
  activeProjects?: number
  totalApplications?: number
}

export function SeekerDashboard({ 
  profile, 
  user, 
  unreadNotificationCount = 0,
  activeProjects = 0,
  totalApplications = 0
}: SeekerDashboardProps) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} role={profile.role as 'developer' | 'company' | 'admin' | 'seeker'} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back, {profile.displayName || 'Project Seeker'}!</h1>
          <p className="text-muted-foreground">Find the perfect developers and teams for your projects</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Post New Project - Primary Action */}
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Plus className="h-5 w-5" />
                Start a New Project
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Describe your project and get matched with qualified developers and teams
              </p>
              <Button asChild className="w-full">
                <Link href="/projects/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Post New Project
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Project Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Your Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Projects</span>
                <Badge variant={activeProjects > 0 ? "default" : "secondary"}>
                  {activeProjects}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Applications</span>
                <Badge variant={totalApplications > 0 ? "default" : "secondary"}>
                  {totalApplications}
                </Badge>
              </div>
              <Button asChild variant="outline" className="w-full mt-4">
                <Link href="/projects/manage">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Manage Projects
                </Link>
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
                <Link href="/profile">
                  <Users className="h-4 w-4 mr-2" />
                  Update Profile
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/developers/browse">
                  <Star className="h-4 w-4 mr-2" />
                  Browse Developers
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/companies/browse">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Browse Companies
                </Link>
              </Button>
              {/* Notifications Button */}
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

        {/* Recent Activity & Tips */}
        <div className="grid gap-6 md:grid-cols-2 mt-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activeProjects > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Briefcase className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Project posted successfully</p>
                      <p className="text-xs text-muted-foreground">Waiting for applications</p>
                    </div>
                  </div>
                  <Button asChild variant="link" className="p-0 h-auto">
                    <Link href="/projects/manage">View all activity →</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No activity yet. Post your first project to get started!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips & Getting Started */}
          <Card>
            <CardHeader>
              <CardTitle>Getting Started Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-green-600">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Post your project</p>
                    <p className="text-xs text-muted-foreground">Use our AI-powered tool to get matched instantly</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Review applications</p>
                    <p className="text-xs text-muted-foreground">Get applications from qualified developers and teams</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-purple-600">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Hire & collaborate</p>
                    <p className="text-xs text-muted-foreground">Work with your chosen developer or team</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  💡 <strong>Pro tip:</strong> Projects with clear requirements get 3x more quality applications
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
