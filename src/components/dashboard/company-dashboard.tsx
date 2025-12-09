'use client'

import { useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Briefcase,
  Users,
  CreditCard,
  Plus,
  ArrowRight,
  Search,
  FileText,
  Clock,
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#1d1d1f]">
            Welcome back, {displayName}
          </h1>
          <p className="text-[#86868b] mt-2 text-lg">
            Find the perfect developers for your projects
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/developers"
            className="inline-flex items-center justify-center h-11 px-6 rounded-full border border-black/10 text-sm font-medium text-[#1d1d1f] hover:bg-black/5 transition-colors"
          >
            <Search className="mr-2 h-4 w-4" />
            Find Developers
          </Link>
          <Button asChild className="rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white px-6 h-11 text-base">
            <Link href="/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              Post Project
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 rounded-2xl bg-white border border-black/5 hover:border-black/10 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#86868b]">Total Projects</p>
              <p className="text-3xl font-semibold text-[#1d1d1f] mt-1">
                {stats?.totalProjects ?? 0}
              </p>
            </div>
            <div className="h-11 w-11 rounded-full bg-[#0071e3]/10 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-[#0071e3]" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-black/5 hover:border-black/10 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#86868b]">Active Projects</p>
              <p className="text-3xl font-semibold text-[#1d1d1f] mt-1">
                {stats?.activeProjects ?? 0}
              </p>
            </div>
            <div className="h-11 w-11 rounded-full bg-[#34c759]/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-[#34c759]" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-black/5 hover:border-black/10 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#86868b]">Total Applications</p>
              <p className="text-3xl font-semibold text-[#1d1d1f] mt-1">
                {stats?.totalApplications ?? 0}
              </p>
            </div>
            <div className="h-11 w-11 rounded-full bg-[#af52de]/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-[#af52de]" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-black/5 hover:border-black/10 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#86868b]">Pending Review</p>
              <p className="text-3xl font-semibold text-[#1d1d1f] mt-1">
                {stats?.pendingApplications ?? 0}
              </p>
            </div>
            <div className="h-11 w-11 rounded-full bg-[#ff9500]/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-[#ff9500]" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Company Profile */}
        <div className="p-6 rounded-2xl bg-white border border-black/5">
          <h3 className="text-lg font-semibold text-[#1d1d1f] mb-4">Company Profile</h3>
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#86868b]">Profile Status</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                companyProfile?.companyProfile?.about
                  ? 'bg-[#34c759]/10 text-[#34c759]'
                  : 'bg-[#ff9500]/10 text-[#ff9500]'
              }`}>
                {companyProfile?.companyProfile?.about ? 'Complete' : 'Incomplete'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#86868b]">Industry</span>
              <span className="text-sm font-medium text-[#1d1d1f]">
                {companyProfile?.companyProfile?.industry || 'Not set'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#86868b]">Company Size</span>
              <span className="text-sm font-medium text-[#1d1d1f]">
                {companyProfile?.companyProfile?.size || 'Not set'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#86868b]">Subscription</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                subscription?.status === 'active'
                  ? 'bg-[#34c759]/10 text-[#34c759]'
                  : 'bg-[#86868b]/10 text-[#86868b]'
              }`}>
                {subscription?.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <Link
            href="/profile"
            className="flex items-center justify-center w-full h-10 rounded-full border border-black/10 text-sm font-medium text-[#1d1d1f] hover:bg-black/5 transition-colors"
          >
            Edit Profile
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        {/* Recent Projects */}
        <div className="p-6 rounded-2xl bg-white border border-black/5">
          <h3 className="text-lg font-semibold text-[#1d1d1f] mb-4">Recent Projects</h3>
          {projects && projects.length > 0 ? (
            <div className="space-y-3 mb-4">
              {projects.slice(0, 3).map((project) => (
                <Link
                  key={project._id}
                  href={`/projects/${project._id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#f5f5f7] hover:bg-[#e8e8ed] transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm text-[#1d1d1f]">{project.title}</p>
                    <p className="text-xs text-[#86868b]">
                      {project.applicationCount} applications
                    </p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                    project.status === 'open'
                      ? 'bg-[#34c759]/10 text-[#34c759]'
                      : 'bg-[#86868b]/10 text-[#86868b]'
                  }`}>
                    {project.status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#86868b] mb-4">
              No projects yet. Post your first project to get started.
            </p>
          )}
          <Button asChild className="w-full rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white h-10">
            <Link href="/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              Post New Project
            </Link>
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="p-6 rounded-2xl bg-white border border-black/5">
          <h3 className="text-lg font-semibold text-[#1d1d1f] mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Link
              href="/developers"
              className="flex items-center w-full h-12 px-4 rounded-xl bg-[#f5f5f7] hover:bg-[#e8e8ed] transition-colors"
            >
              <Search className="h-4 w-4 text-[#86868b] mr-3" />
              <span className="text-sm font-medium text-[#1d1d1f]">Search Developers</span>
            </Link>
            <Link
              href="/company/projects"
              className="flex items-center w-full h-12 px-4 rounded-xl bg-[#f5f5f7] hover:bg-[#e8e8ed] transition-colors"
            >
              <Briefcase className="h-4 w-4 text-[#86868b] mr-3" />
              <span className="text-sm font-medium text-[#1d1d1f]">Manage Projects</span>
            </Link>
            <Link
              href="/billing"
              className="flex items-center w-full h-12 px-4 rounded-xl bg-[#f5f5f7] hover:bg-[#e8e8ed] transition-colors"
            >
              <CreditCard className="h-4 w-4 text-[#86868b] mr-3" />
              <span className="text-sm font-medium text-[#1d1d1f]">Billing Settings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="p-6 rounded-2xl bg-white border border-black/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#1d1d1f]">Recent Applications</h3>
          <Link
            href="/company/applications"
            className="text-sm text-[#0071e3] hover:underline"
          >
            View All
          </Link>
        </div>
        {recentApplications && recentApplications.length > 0 ? (
          <div className="space-y-3">
            {recentApplications.map((item) => (
              <div
                key={item.application._id}
                className="flex items-center justify-between p-4 rounded-xl bg-[#f5f5f7]"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#0071e3] to-[#5856d6] flex items-center justify-center text-white font-medium text-sm">
                    {item.developer?.profile?.displayName?.charAt(0) || 'D'}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-[#1d1d1f]">
                      {item.developer?.profile?.displayName || 'Developer'}
                    </p>
                    <p className="text-xs text-[#86868b]">
                      Applied to: {item.project?.title}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                    item.application.status === 'accepted'
                      ? 'bg-[#34c759]/10 text-[#34c759]'
                      : item.application.status === 'rejected'
                      ? 'bg-[#ff3b30]/10 text-[#ff3b30]'
                      : 'bg-[#ff9500]/10 text-[#ff9500]'
                  }`}>
                    {item.application.status}
                  </span>
                  <Link
                    href={`/developers/${item.developer?.profile?._id}`}
                    className="text-sm text-[#0071e3] hover:underline"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#86868b] text-center py-8">
            No applications yet. Post a project to start receiving applications.
          </p>
        )}
      </div>
    </div>
  )
}
