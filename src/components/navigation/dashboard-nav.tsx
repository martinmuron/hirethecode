'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useClerk, useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, Settings, LogOut, Bell } from 'lucide-react'

export function DashboardNav() {
  const pathname = usePathname()
  const { signOut } = useClerk()
  const { user: clerkUser } = useUser()
  const profile = useQuery(api.profiles.getCurrent)
  const notificationCount = useQuery(api.notifications.getUnreadCount)

  const role = profile?.role || 'developer'

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Developers', href: '/developers' },
    { name: 'Projects', href: '/projects' },
    ...(role === 'developer' ? [
      { name: 'Profile', href: '/profile' },
    ] : role === 'company' ? [
      { name: 'Company', href: '/company/dashboard' },
      { name: 'My Projects', href: '/company/projects' },
    ] : role === 'admin' ? [
      { name: 'Admin', href: '/admin' },
    ] : []),
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#fbfbfd]/80 backdrop-blur-xl border-b border-black/5">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex h-12 items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="text-xl font-semibold text-[#1d1d1f]">
            hirethecode
          </Link>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-1.5 rounded-full text-sm transition-all duration-200 ${
                  pathname === item.href || pathname.startsWith(item.href + '/')
                    ? 'bg-[#1d1d1f] text-white'
                    : 'text-[#1d1d1f]/70 hover:text-[#1d1d1f] hover:bg-black/5'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Link
              href="/notifications"
              className="relative p-2 rounded-full text-[#1d1d1f]/70 hover:text-[#1d1d1f] hover:bg-black/5 transition-colors"
            >
              <Bell className="h-5 w-5" />
              {notificationCount && notificationCount > 0 && (
                <span className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-[#ff3b30] text-white text-[10px] font-medium flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative h-8 w-8 rounded-full overflow-hidden ring-2 ring-black/5 hover:ring-black/10 transition-all">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={clerkUser?.imageUrl || profile?.avatarUrl || undefined}
                      alt={clerkUser?.fullName || profile?.displayName || ''}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-[#0071e3] to-[#5856d6] text-white text-sm">
                      {clerkUser?.firstName?.charAt(0) || profile?.displayName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 rounded-2xl p-2 bg-white/90 backdrop-blur-xl border border-black/5 shadow-lg" align="end" forceMount>
                <div className="flex items-center gap-3 p-3 mb-1">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={clerkUser?.imageUrl || profile?.avatarUrl || undefined}
                      alt={clerkUser?.fullName || ''}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-[#0071e3] to-[#5856d6] text-white">
                      {clerkUser?.firstName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="font-medium text-sm text-[#1d1d1f]">
                      {clerkUser?.fullName || profile?.displayName}
                    </p>
                    <p className="text-xs text-[#86868b]">
                      {clerkUser?.primaryEmailAddress?.emailAddress}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-black/5" />
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer text-[#1d1d1f] focus:bg-black/5 focus:text-[#1d1d1f] py-2.5">
                  <Link href="/profile">
                    <User className="mr-3 h-4 w-4 text-[#86868b]" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer text-[#1d1d1f] focus:bg-black/5 focus:text-[#1d1d1f] py-2.5">
                  <Link href="/billing">
                    <Settings className="mr-3 h-4 w-4 text-[#86868b]" />
                    Billing & Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-black/5" />
                <DropdownMenuItem
                  className="rounded-lg cursor-pointer text-[#ff3b30] focus:text-[#ff3b30] focus:bg-[#ff3b30]/10 py-2.5"
                  onSelect={(event) => {
                    event.preventDefault()
                    signOut({ redirectUrl: '/' })
                  }}
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}
