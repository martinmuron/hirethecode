'use client'

import { useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Briefcase, User, CreditCard, Bell, ArrowRight, Sparkles, Check, Clock } from 'lucide-react'

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#1d1d1f]">
            Welcome back, {displayName}
          </h1>
          <p className="text-[#86868b] mt-2 text-lg">
            Manage your profile and discover new opportunities
          </p>
        </div>
        <Button asChild className="rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white px-6 h-11 text-base">
          <Link href="/projects">
            <Sparkles className="mr-2 h-4 w-4" />
            Find Projects
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 rounded-2xl bg-white border border-black/5 hover:border-black/10 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#86868b]">Open Projects</p>
              <p className="text-3xl font-semibold text-[#1d1d1f] mt-1">
                {openProjectsCount ?? 0}
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
              <p className="text-sm text-[#86868b]">Applications</p>
              <p className="text-3xl font-semibold text-[#1d1d1f] mt-1">
                {applications?.length ?? 0}
              </p>
            </div>
            <div className="h-11 w-11 rounded-full bg-[#34c759]/10 flex items-center justify-center">
              <User className="h-5 w-5 text-[#34c759]" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-black/5 hover:border-black/10 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#86868b]">Subscription</p>
              <p className="text-xl font-semibold text-[#1d1d1f] mt-1">
                {subscription?.status === 'active' ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div className="h-11 w-11 rounded-full bg-[#af52de]/10 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-[#af52de]" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-black/5 hover:border-black/10 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#86868b]">Availability</p>
              <span className={`inline-flex items-center mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                developerProfile?.developerProfile?.availability === 'available'
                  ? 'bg-[#34c759]/10 text-[#34c759]'
                  : 'bg-[#86868b]/10 text-[#86868b]'
              }`}>
                {developerProfile?.developerProfile?.availability === 'available' && (
                  <Check className="h-3 w-3 mr-1" />
                )}
                {developerProfile?.developerProfile?.availability || 'Not set'}
              </span>
            </div>
            <div className="h-11 w-11 rounded-full bg-[#ff9500]/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-[#ff9500]" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="p-6 rounded-2xl bg-white border border-black/5">
          <h3 className="text-lg font-semibold text-[#1d1d1f] mb-4">Your Profile</h3>
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#86868b]">Profile Status</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                developerProfile?.developerProfile?.headline
                  ? 'bg-[#34c759]/10 text-[#34c759]'
                  : 'bg-[#ff9500]/10 text-[#ff9500]'
              }`}>
                {developerProfile?.developerProfile?.headline ? 'Complete' : 'Incomplete'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#86868b]">Skills Added</span>
              <span className="text-sm font-medium text-[#1d1d1f]">{developerProfile?.skills?.length ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#86868b]">Hourly Rate</span>
              <span className="text-sm font-medium text-[#1d1d1f]">
                {developerProfile?.developerProfile?.rate
                  ? `$${developerProfile.developerProfile.rate}/hr`
                  : 'Not set'}
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

        {/* Recent Applications */}
        <div className="p-6 rounded-2xl bg-white border border-black/5">
          <h3 className="text-lg font-semibold text-[#1d1d1f] mb-4">Recent Applications</h3>
          {applications && applications.length > 0 ? (
            <div className="space-y-3 mb-4">
              {applications.slice(0, 3).filter((app): app is NonNullable<typeof app> => app !== null).map((app) => (
                <div
                  key={app._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#f5f5f7]"
                >
                  <div>
                    <p className="font-medium text-sm text-[#1d1d1f]">{app.project?.title}</p>
                    <p className="text-xs text-[#86868b]">
                      {app.project?.company?.companyName}
                    </p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                    app.status === 'accepted'
                      ? 'bg-[#34c759]/10 text-[#34c759]'
                      : app.status === 'rejected'
                      ? 'bg-[#ff3b30]/10 text-[#ff3b30]'
                      : 'bg-[#ff9500]/10 text-[#ff9500]'
                  }`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#86868b] mb-4">
              No applications yet. Browse projects to get started.
            </p>
          )}
          <Link
            href="/projects"
            className="flex items-center justify-center w-full h-10 rounded-full border border-black/10 text-sm font-medium text-[#1d1d1f] hover:bg-black/5 transition-colors"
          >
            Browse Projects
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="p-6 rounded-2xl bg-white border border-black/5">
          <h3 className="text-lg font-semibold text-[#1d1d1f] mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Link
              href="/profile"
              className="flex items-center w-full h-12 px-4 rounded-xl bg-[#f5f5f7] hover:bg-[#e8e8ed] transition-colors"
            >
              <User className="h-4 w-4 text-[#86868b] mr-3" />
              <span className="text-sm font-medium text-[#1d1d1f]">Update Profile</span>
            </Link>
            <Link
              href="/projects"
              className="flex items-center w-full h-12 px-4 rounded-xl bg-[#f5f5f7] hover:bg-[#e8e8ed] transition-colors"
            >
              <Briefcase className="h-4 w-4 text-[#86868b] mr-3" />
              <span className="text-sm font-medium text-[#1d1d1f]">View All Projects</span>
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

      {/* Recent Notifications */}
      <div className="p-6 rounded-2xl bg-white border border-black/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#1d1d1f]">Recent Notifications</h3>
          <Link
            href="/notifications"
            className="text-sm text-[#0071e3] hover:underline"
          >
            View All
          </Link>
        </div>
        {notifications && notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 rounded-xl ${
                  notification.isRead ? 'bg-[#f5f5f7]' : 'bg-[#0071e3]/5 border border-[#0071e3]/10'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm text-[#1d1d1f]">{notification.title}</p>
                    <p className="text-xs text-[#86868b] mt-1">{notification.message}</p>
                  </div>
                  {!notification.isRead && (
                    <div className="h-2 w-2 rounded-full bg-[#0071e3]" />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#86868b] text-center py-8">
            No notifications yet
          </p>
        )}
      </div>
    </div>
  )
}
