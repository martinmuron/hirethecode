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
      { name: 'Company Dashboard', href: '/company/dashboard' },
      { name: 'Manage Projects', href: '/company/projects' },
      { name: 'Company Profile', href: '/profile' },
    ] : role === 'admin' ? [
      { name: 'Admin Panel', href: '/admin' },
      { name: 'Profile', href: '/profile' },
    ] : []),
  ]

  return (
    <nav className="border-b bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            <span className="font-semibold text-xl tracking-tight">Hire the Code</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-1 text-sm font-medium">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-full transition-all duration-200 ${
                  pathname === item.href
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative rounded-full" asChild>
              <Link href="/notifications">
                <Bell className="h-5 w-5 text-gray-600" />
                {notificationCount && notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 ring-2 ring-gray-100">
                    <AvatarImage
                      src={clerkUser?.imageUrl || profile?.avatarUrl || undefined}
                      alt={clerkUser?.fullName || profile?.displayName || ''}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {clerkUser?.firstName?.charAt(0) || profile?.displayName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 rounded-xl p-2" align="end" forceMount>
                <div className="flex items-center justify-start gap-3 p-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={clerkUser?.imageUrl || profile?.avatarUrl || undefined}
                      alt={clerkUser?.fullName || ''}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {clerkUser?.firstName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-0.5 leading-none">
                    <p className="font-medium text-sm">
                      {clerkUser?.fullName || profile?.displayName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {clerkUser?.primaryEmailAddress?.emailAddress}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                  <Link href="/billing">
                    <Settings className="mr-2 h-4 w-4" />
                    Billing & Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem
                  className="rounded-lg cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                  onSelect={(event) => {
                    event.preventDefault()
                    signOut({ redirectUrl: '/' })
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}
