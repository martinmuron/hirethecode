import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { profiles, notifications } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { NotificationsPage } from '@/components/notifications/notifications-page'
import { formatDistanceToNow } from 'date-fns'

export default async function NotificationsPageRoute() {
  const user = await currentUser()

  if (!user?.email) {
    redirect('/auth/sign-in')
  }

  // Get user profile
  const userProfile = await db.select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1)

  if (!userProfile.length) {
    redirect('/profile/setup')
  }

  // Get notifications
  const userNotifications = await db.select()
    .from(notifications)
    .where(eq(notifications.userId, user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(50)

  // Add time ago formatting
  const notificationsWithTimeAgo = userNotifications.map(notification => ({
    ...notification,
    timeAgo: formatDistanceToNow(notification.createdAt, { addSuffix: true })
  }))

  return (
    <NotificationsPage
      user={user}
      role={userProfile[0].role as 'developer' | 'company' | 'admin'}
      notifications={notificationsWithTimeAgo}
    />
  )
}
