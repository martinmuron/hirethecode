'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DashboardNav } from '@/components/navigation/dashboard-nav'
import { Progress } from '@/components/ui/progress'
import { 
  Building2,
  Plus,
  Users,
  Briefcase,
  Clock,
  TrendingUp,
  MessageSquare,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
  Search,
  Eye,
  Crown,
  Activity,
  Target,
  UserCheck,
  FileText,
  Brain
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface CompanyDashboardProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  company: {
    id: string
    displayName: string | null
    role: string
  }
  projects: Array<{
    id: string
    title: string
    description: string
    status: string
    createdAt: Date
  }>
  recentApplications: Array<{
    id: string
    projectId: string
    projectTitle: string
    status: string | null
    createdAt: Date
    developer: {
      id: string
      displayName: string | null
      avatarUrl: string | null
    }
    developerProfile: {
      headline: string | null
      rate: string | null
      availability: string | null
    } | null
  }>
  subscription: {
    id: string
    productTier: string
    status: string
    currentPeriodEnd: Date
  } | null
  stats: {
    totalProjects: number
    activeProjects: number
    totalApplications: number
    pendingApplications: number
  }
}

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

export function CompanyDashboard({
  user,
  company,
  projects,
  recentApplications,
  subscription,
  stats
}: CompanyDashboardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getApplicationStatusColor = (status: string | null) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatRate = (rate: string | null) => {
    if (!rate) return 'Rate not specified'
    return `$${parseFloat(rate).toLocaleString()}/hr`
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} role="company" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Building2 className="h-8 w-8" />
                Company Dashboard
              </h1>
              <p className="text-muted-foreground">
                Welcome back, {company.displayName || 'Company'}
              </p>
            </div>
            {subscription && (
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-yellow-500" />
                <Badge variant="secondary" className="capitalize">
                  {subscription.productTier} Plan
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Total Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeProjects} currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
              <p className="text-xs text-muted-foreground">
                Total applications received
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingApplications}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting your review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.totalApplications > 0 
                  ? Math.round((stats.totalApplications / Math.max(stats.totalProjects, 1)) * 10) / 10
                  : 0
                } avg
              </div>
              <p className="text-xs text-muted-foreground">
                Applications per project
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {QUICK_ACTIONS.map((action) => (
                    <Link key={action.href} href={action.href}>
                      <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg ${action.color}`}>
                            <action.icon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="font-medium">{action.title}</div>
                            <div className="text-sm text-muted-foreground">
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
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Recent Applications
                  </CardTitle>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/company/projects">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentApplications.length > 0 ? (
                  <div className="space-y-4">
                    {recentApplications.slice(0, 5).map((application) => (
                      <div key={application.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={application.developer.avatarUrl || undefined} />
                            <AvatarFallback>
                              {application.developer.displayName?.charAt(0) || 'D'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {application.developer.displayName || 'Developer'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Applied to {application.projectTitle}
                            </div>
                            {application.developerProfile?.headline && (
                              <div className="text-xs text-muted-foreground">
                                {application.developerProfile.headline}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant="outline" 
                            className={`text-xs mb-1 ${getApplicationStatusColor(application.status)}`}
                          >
                            {application.status || 'pending'}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(application.createdAt, { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No applications yet</p>
                    <p className="text-sm">Post your first project to start receiving applications</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Projects */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Your Projects
                  </CardTitle>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/projects">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {projects.length > 0 ? (
                  <div className="space-y-4">
                    {projects.slice(0, 5).map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{project.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {project.description}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Posted {formatDistanceToNow(project.createdAt, { addSuffix: true })}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getStatusColor(project.status)}`}
                          >
                            {project.status}
                          </Badge>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/projects/${project.id}`}>
                              <Eye className="h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No projects yet</p>
                    <Button asChild>
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Crown className="h-4 w-4 text-yellow-500" />
                    Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="font-medium capitalize">{subscription.productTier} Plan</div>
                      <div className="text-sm text-muted-foreground">
                        Status: <span className="capitalize">{subscription.status}</span>
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-muted-foreground">Renews on:</div>
                      <div>{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</div>
                    </div>
                    <Button size="sm" variant="outline" asChild className="w-full">
                      <Link href="/billing">Manage Billing</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Upgrade Your Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Unlock premium features and get access to top developers
                    </p>
                    <Button size="sm" className="w-full" asChild>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Brain className="h-4 w-4" />
                  Tips & Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm font-medium text-blue-900">
                      💡 Improve Application Quality
                    </div>
                    <div className="text-xs text-blue-700 mt-1">
                      Projects with detailed descriptions get 40% more quality applications
                    </div>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-sm font-medium text-green-900">
                      🎯 Use Smart Matching
                    </div>
                    <div className="text-xs text-green-700 mt-1">
                      Try our AI-powered developer matching for better matching with projects in our database
                    </div>
                  </div>

                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-sm font-medium text-purple-900">
                      ⚡ Respond Quickly
                    </div>
                    <div className="text-xs text-purple-700 mt-1">
                      Responding to applications within 24h increases acceptance by 60%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Platform Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  Platform Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Developers</span>
                    <span className="font-medium">2,847</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Projects This Month</span>
                    <span className="font-medium">421</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Response Time</span>
                    <span className="font-medium">4.2h</span>
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
