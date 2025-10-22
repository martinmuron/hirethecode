'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DashboardNav } from '@/components/navigation/dashboard-nav'
import { Bell, CheckCheck, Trash2, MessageCircle, Briefcase, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { Notification } from '@/lib/db/schema'

interface NotificationsPageProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    id: string
  }
  role: 'developer' | 'company' | 'admin'
  notifications: (Notification & {
    timeAgo: string
  })[]
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'application_status':
      return <Briefcase className="h-4 w-4 text-blue-500" />
    case 'new_message':
      return <MessageCircle className="h-4 w-4 text-green-500" />
    case 'project_update':
      return <AlertCircle className="h-4 w-4 text-orange-500" />
    case 'system':
      return <Bell className="h-4 w-4 text-gray-500" />
    default:
      return <Bell className="h-4 w-4 text-gray-500" />
  }
}

export function NotificationsPage({ user, role, notifications }: NotificationsPageProps) {
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleMarkAsRead = async (notificationIds: string[]) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds }),
      })
      
      if (response.ok) {
        // Refresh the page or update state
        window.location.reload()
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    }
    setIsLoading(false)
  }

  const handleDelete = async (notificationIds: string[]) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/notifications/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds }),
      })
      
      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Error deleting notifications:', error)
    }
    setIsLoading(false)
  }

  const unreadNotifications = notifications.filter(n => !n.isRead)
  const readNotifications = notifications.filter(n => n.isRead)

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} role={role} />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Notifications
          </h1>
          <p className="text-muted-foreground">
            Stay updated with the latest activity on your account
          </p>
        </div>

        {/* Actions */}
        {unreadNotifications.length > 0 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <Button
                  onClick={() => handleMarkAsRead(unreadNotifications.map(n => n.id))}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark All as Read
                </Button>
                <Button
                  onClick={() => handleDelete(unreadNotifications.map(n => n.id))}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Unread Notifications */}
        {unreadNotifications.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="destructive">{unreadNotifications.length}</Badge>
                Unread Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {unreadNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start gap-3 p-4 border border-blue-200 bg-blue-50 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {notification.timeAgo}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex gap-1">
                    <Button
                      onClick={() => handleMarkAsRead([notification.id])}
                      disabled={isLoading}
                      variant="ghost"
                      size="sm"
                    >
                      <CheckCheck className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete([notification.id])}
                      disabled={isLoading}
                      variant="ghost"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Read Notifications */}
        {readNotifications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Earlier Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {readNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg opacity-60"
                >
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{notification.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.timeAgo}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleDelete([notification.id])}
                    disabled={isLoading}
                    variant="ghost"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {notifications.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
              <p className="text-muted-foreground">
                You'll see updates about project applications, messages, and system updates here.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
