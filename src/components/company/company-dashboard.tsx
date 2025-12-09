'use client'

import { useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DashboardNav } from '@/components/navigation/dashboard-nav'
import {
  Building2,
  Plus,
  Users,
  Briefcase,
  Clock,
  TrendingUp,
  Search,
  Eye,
  Crown,
  Activity,
  Target,
  UserCheck,
  FileText,
  Brain,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

const QUICK_ACTIONS = [
  {
    title: 'Post New Project',
    description: 'Create a new project listing',
    href: '/projects/new',
    icon: Plus,
    color: 'bg-blue-500'
  },
  {
    title: 'Browse Developers',
    description: 'Find and contact developers',
    href: '/developers',
    icon: Search,
    color: 'bg-green-500'
  },
  {
    title: 'Manage Projects',
    description: 'Track applications and progress',
    href: '/company/projects',
    icon: Briefcase,
    color: 'bg-purple-500'
  },
  {
    title: 'Billing & Settings',
    description: 'Manage your subscription',
    href: '/billing',
    icon: Building2,
    color: 'bg-orange-500'
  }
]

export function CompanyDashboard() {
  const profile = useQuery(api.profiles.getCurrent)
  const companyData = useQuery(api.companies.getCurrentProfile)
  const stats = useQuery(api.companies.getStats)
  const subscription = useQuery(api.subscriptions.getCurrent)
  const projects = useQuery(api.projects.getByCompany, {})
  const applications = useQuery(api.applications.getForCompany)

  const loading = profile === undefined ||
    companyData === undefined ||
    stats === undefined ||
    projects === undefined ||
    applications === undefined

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getApplicationStatusColor = (status: string | null) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatRate = (rate: number | null | undefined) => {
    if (!rate) return 'Rate not specified'
    return `$${rate.toLocaleString()}/hr`
  }

  const displayName = profile?.displayName || companyData?.companyProfile?.companyName || 'Company'
  const totalProjects = stats?.totalProjects || 0
  const activeProjects = stats?.activeProjects || 0
  const totalApplications = stats?.totalApplications || 0
  const pendingApplications = stats?.pendingApplications || 0
  const recentApplications = applications || []
  const recentProjects = projects || []

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <DashboardNav />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-gray-900 flex items-center gap-3">
                <Building2 className="h-8 w-8" />
                Company Dashboard
              </h1>
              <p className="text-gray-500 mt-1">
                Welcome back, {displayName}
              </p>
            </div>
            {subscription && (
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-yellow-500" />
                <Badge variant="secondary" className="capitalize rounded-full">
                  {subscription.productTier} Plan
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-gray-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-500">
                <FileText className="h-4 w-4" />
                Total Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">{totalProjects}</div>
              <p className="text-xs text-gray-500">
                {activeProjects} currently active
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-500">
                <Users className="h-4 w-4" />
                Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">{totalApplications}</div>
              <p className="text-xs text-gray-500">
                Total applications received
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-500">
                <Clock className="h-4 w-4" />
                Pending Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-yellow-600">{pendingApplications}</div>
              <p className="text-xs text-gray-500">
                Awaiting your review
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-500">
                <Activity className="h-4 w-4" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-green-600">
                {totalApplications > 0
                  ? Math.round((totalApplications / Math.max(totalProjects, 1)) * 10) / 10
                  : 0
                } avg
              </div>
              <p className="text-xs text-gray-500">
                Applications per project
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card className="bg-white border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Target className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {QUICK_ACTIONS.map((action) => (
                    <Link key={action.href} href={action.href}>
                      <div className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg ${action.color}`}>
                            <action.icon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{action.title}</div>
                            <div className="text-sm text-gray-500">
                              {action.description}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Applications */}
            <Card className="bg-white border-gray-100 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <UserCheck className="h-5 w-5" />
                    Recent Applications
                  </CardTitle>
                  <Button size="sm" variant="outline" asChild className="rounded-full">
                    <Link href="/company/projects">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentApplications.length > 0 ? (
                  <div className="space-y-4">
                    {recentApplications.slice(0, 5).map((application) => (
                      <div key={application._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 ring-2 ring-gray-100">
                            <AvatarImage src={application.developer?.profile?.avatarUrl || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                              {application.developer?.profile?.displayName?.charAt(0) || 'D'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900">
                              {application.developer?.profile?.displayName || 'Developer'}
                            </div>
                            <div className="text-sm text-gray-500">
                              Applied to {application.project?.title || 'Project'}
                            </div>
                            {application.developer?.developerProfile?.headline && (
                              <div className="text-xs text-gray-400">
                                {application.developer.developerProfile.headline}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant="outline"
                            className={`text-xs mb-1 rounded-full ${getApplicationStatusColor(application.status)}`}
                          >
                            {application.status || 'pending'}
                          </Badge>
                          <div className="text-xs text-gray-400">
                            {formatDistanceToNow(application.createdAt, { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No applications yet</p>
                    <p className="text-sm text-gray-400">Post your first project to start receiving applications</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Projects */}
            <Card className="bg-white border-gray-100 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Briefcase className="h-5 w-5" />
                    Your Projects
                  </CardTitle>
                  <Button size="sm" variant="outline" asChild className="rounded-full">
                    <Link href="/projects">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentProjects.length > 0 ? (
                  <div className="space-y-4">
                    {recentProjects.slice(0, 5).map((project) => (
                      <div key={project._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{project.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {project.description}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Posted {formatDistanceToNow(project.createdAt, { addSuffix: true })}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className={`text-xs rounded-full ${getStatusColor(project.status)}`}
                          >
                            {project.status.replace('_', ' ')}
                          </Badge>
                          <Button size="sm" variant="outline" asChild className="rounded-full">
                            <Link href={`/projects/${project._id}`}>
                              <Eye className="h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No projects yet</p>
                    <Button asChild className="rounded-full mt-2">
                      <Link href="/projects/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Post Your First Project
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription Status */}
            {subscription ? (
              <Card className="bg-white border-gray-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm text-gray-900">
                    <Crown className="h-4 w-4 text-yellow-500" />
                    Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="font-medium capitalize text-gray-900">{subscription.productTier} Plan</div>
                      <div className="text-sm text-gray-500">
                        Status: <span className="capitalize">{subscription.status}</span>
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-gray-500">Renews on:</div>
                      <div className="text-gray-900">{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</div>
                    </div>
                    <Button size="sm" variant="outline" asChild className="w-full rounded-full">
                      <Link href="/billing">Manage Billing</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white border-gray-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm text-gray-900">Upgrade Your Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500">
                      Unlock premium features and get access to top developers
                    </p>
                    <Button size="sm" className="w-full rounded-full" asChild>
                      <Link href="/billing">
                        <Crown className="h-4 w-4 mr-2" />
                        Upgrade Now
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips & Insights */}
            <Card className="bg-white border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm text-gray-900">
                  <Brain className="h-4 w-4" />
                  Tips & Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="text-sm font-medium text-blue-900">
                      Improve Application Quality
                    </div>
                    <div className="text-xs text-blue-700 mt-1">
                      Projects with detailed descriptions get 40% more quality applications
                    </div>
                  </div>

                  <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                    <div className="text-sm font-medium text-green-900">
                      Use Smart Matching
                    </div>
                    <div className="text-xs text-green-700 mt-1">
                      Try our AI-powered developer matching for better hiring success
                    </div>
                  </div>

                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="text-sm font-medium text-purple-900">
                      Respond Quickly
                    </div>
                    <div className="text-xs text-purple-700 mt-1">
                      Responding to applications within 24h increases acceptance by 60%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Platform Stats */}
            <Card className="bg-white border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm text-gray-900">
                  <TrendingUp className="h-4 w-4" />
                  Platform Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Active Developers</span>
                    <span className="font-medium text-gray-900">2,847</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Projects This Month</span>
                    <span className="font-medium text-gray-900">421</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Avg Response Time</span>
                    <span className="font-medium text-gray-900">4.2h</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
