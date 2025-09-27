import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Users, UserCheck, UserX, Building, Briefcase, DollarSign, AlertTriangle } from 'lucide-react'
import type { Profile } from '@/lib/db/schema'
import { DashboardNav } from '@/components/navigation/dashboard-nav'

interface AdminDashboardProps {
  profile: Profile
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  // Add these props to get data from your API
  stats?: {
    totalUsers: number
    pendingDevelopers: number
    totalDevelopers: number
    totalCompanies: number
    activeProjects: number
    totalRevenue: number
  }
  pendingDevelopers?: Array<{
    id: string
    displayName: string
    email: string
    createdAt: Date
    headline?: string
  }>
}

const fetchStats = async () => {
  const response = await fetch(process.env.DEV_URL + '/api/admin/stats')
  const { stats } = await response.json()
  console.log(`Stats: ${JSON.stringify(stats)}`)
  return stats
}

export async function AdminDashboard({ profile, user, pendingDevelopers }: AdminDashboardProps) {
  const stats = await fetchStats()
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} role={profile.role as 'developer' | 'company' | 'admin'} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Leperboard</h1>
          <p className="text-muted-foreground">Platform overview and management tools</p>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats?.pendingDevelopers || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeProjects || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${stats?.totalRevenue?.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Pending Developer Approvals */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pending Developer Approvals</CardTitle>
              <Button asChild size="sm">
                <Link href="/admin/developers/pending">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {pendingDevelopers && pendingDevelopers.length > 0 ? (
                <div className="space-y-4">
                  {pendingDevelopers.slice(0, 3).map((dev) => (
                    <div key={dev.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{dev.displayName}</div>
                        <div className="text-sm text-muted-foreground">{dev.email}</div>
                        {dev.headline && (
                          <div className="text-xs text-muted-foreground mt-1">{dev.headline}</div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <UserCheck className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <UserX className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No pending approvals</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/admin/developers">
                  <UserCheck className="mr-2 h-4 w-4" />
                  Manage Developers
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/admin/companies">
                  <Building className="mr-2 h-4 w-4" />
                  Manage Companies
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/admin/projects">
                  <Briefcase className="mr-2 h-4 w-4" />
                  View All Projects
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/admin/subscriptions">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Subscription Management
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Platform Health */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Platform Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats?.totalDevelopers || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Developers</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{stats?.totalCompanies || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Companies</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {stats?.activeProjects || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Projects</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
