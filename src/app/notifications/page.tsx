// src/app/notifications/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { profiles, notifications } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { NotificationsPage } from '@/components/notifications/notifications-page'
import { formatDistanceToNow } from 'date-fns'

export default async function NotificationsPageRoute() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/auth/sign-in')
  }

  // Get user profile
  const userProfile = await db.select()
    .from(profiles)
    .where(eq(profiles.id, session.user.id))
    .limit(1)

  if (!userProfile.length) {
    redirect('/profile/setup')
  }

  // Get notifications
  const userNotifications = await db.select()
    .from(notifications)
    .where(eq(notifications.userId, session.user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(50)

  // Add time ago formatting
  const notificationsWithTimeAgo = userNotifications.map(notification => ({
    ...notification,
    timeAgo: formatDistanceToNow(notification.createdAt, { addSuffix: true })
  }))

  return (
    <NotificationsPage
      user={session.user}
      role={userProfile[0].role as 'developer' | 'company' | 'admin'}
      notifications={notificationsWithTimeAgo}
    />
  )
}
