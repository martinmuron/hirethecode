'use client'

import { useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Briefcase,
  Users,
  CreditCard,
  Plus,
  ArrowRight,
  Search,
  Sparkles,
  FileText,
} from 'lucide-react'

export function CompanyDashboard() {
  const profile = useQuery(api.profiles.getCurrent)
  const companyProfile = useQuery(api.companies.getCurrentProfile)
  const stats = useQuery(api.companies.getStats)
  const projects = useQuery(api.projects.getByCompany, {})
  const recentApplications = useQuery(api.applications.getRecent, { limit: 5 })
  const subscription = useQuery(api.subscriptions.get)

  const displayName = companyProfile?.companyProfile?.companyName || profile?.displayName || 'Company'

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Welcome back, {displayName}
          </h1>
          <p className="text-gray-500 mt-1">
            Find the perfect developers for your projects
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button asChild variant="outline" className="rounded-full px-6">
            <Link href="/developers">
              <Search className="mr-2 h-4 w-4" />
              Find Developers
            </Link>
          </Button>
          <Button asChild className="rounded-full px-6">
            <Link href="/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              Post Project
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Projects</p>
                <p className="text-3xl font-semibold text-gray-900 mt-1">
                  {stats?.totalProjects ?? 0}
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
                <p className="text-sm text-gray-500">Active Projects</p>
                <p className="text-3xl font-semibold text-gray-900 mt-1">
                  {stats?.activeProjects ?? 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Applications</p>
                <p className="text-3xl font-semibold text-gray-900 mt-1">
                  {stats?.totalApplications ?? 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Review</p>
                <p className="text-3xl font-semibold text-gray-900 mt-1">
                  {stats?.pendingApplications ?? 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Company Profile */}
        <Card className="bg-white border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Company Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Profile Status</span>
                <Badge variant="secondary" className="rounded-full">
                  {companyProfile?.companyProfile?.about ? 'Complete' : 'Incomplete'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Industry</span>
                <span className="font-medium">
                  {companyProfile?.companyProfile?.industry || 'Not set'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Company Size</span>
                <span className="font-medium">
                  {companyProfile?.companyProfile?.size || 'Not set'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Subscription</span>
                <Badge
                  variant={subscription?.status === 'active' ? 'default' : 'secondary'}
                  className="rounded-full"
                >
                  {subscription?.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
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

        {/* Recent Projects */}
        <Card className="bg-white border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Recent Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {projects && projects.length > 0 ? (
              <div className="space-y-3">
                {projects.slice(0, 3).map((project) => (
                  <Link
                    key={project._id}
                    href={`/projects/${project._id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm">{project.title}</p>
                      <p className="text-xs text-gray-500">
                        {project.applicationCount} applications
                      </p>
                    </div>
                    <Badge
                      variant={project.status === 'open' ? 'default' : 'secondary'}
                      className="rounded-full capitalize"
                    >
                      {project.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No projects yet. Post your first project to get started.
              </p>
            )}
            <Button asChild className="w-full mt-4 rounded-full">
              <Link href="/projects/new">
                <Plus className="mr-2 h-4 w-4" />
                Post New Project
              </Link>
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
              <Link href="/developers">
                <Search className="mr-3 h-4 w-4 text-gray-500" />
                Search Developers
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start rounded-xl h-12">
              <Link href="/company/projects">
                <Briefcase className="mr-3 h-4 w-4 text-gray-500" />
                Manage Projects
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

      {/* Recent Applications */}
      <Card className="bg-white border-gray-100 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Applications</CardTitle>
            <Button variant="ghost" size="sm" asChild className="rounded-full">
              <Link href="/company/applications">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentApplications && recentApplications.length > 0 ? (
            <div className="space-y-3">
              {recentApplications.map((item) => (
                <div
                  key={item.application._id}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                      {item.developer?.profile?.displayName?.charAt(0) || 'D'}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {item.developer?.profile?.displayName || 'Developer'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Applied to: {item.project?.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge
                      variant={
                        item.application.status === 'accepted'
                          ? 'default'
                          : item.application.status === 'rejected'
                          ? 'destructive'
                          : 'secondary'
                      }
                      className="rounded-full capitalize"
                    >
                      {item.application.status}
                    </Badge>
                    <Button variant="ghost" size="sm" asChild className="rounded-full">
                      <Link href={`/developers/${item.developer?.profile?._id}`}>
                        View Profile
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No applications yet. Post a project to start receiving applications.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
