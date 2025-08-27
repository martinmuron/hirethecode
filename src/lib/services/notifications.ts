import { db } from '@/lib/db'
import { notifications, users, profiles } from '@/lib/db/schema'
import { eq, and, desc, count } from 'drizzle-orm'
import { EmailService } from '@/lib/email/email-service'

export type NotificationType = 'application_status' | 'new_message' | 'project_update' | 'system'

interface CreateNotificationData {
  userId: string
  title: string
  message: string
  type: NotificationType
  data?: Record<string, any>
}

export class NotificationService {
  /**
   * Create a new notification
   */
  static async create({
    userId,
    title,
    message,
    type,
    data
  }: CreateNotificationData) {
    try {
      const notification = await db.insert(notifications).values({
        userId,
        title,
        message,
        type,
        data: data ? JSON.stringify(data) : null,
      }).returning()

      return notification[0]
    } catch (error) {
      console.error('Error creating notification:', error)
      throw error
    }
  }

  /**
   * Create notification for application status update
   */
  static async createApplicationStatusNotification(
    developerId: string,
    status: 'accepted' | 'rejected',
    projectTitle: string,
    companyName: string,
    applicationId: string,
    projectId?: string
  ) {
    const statusMessages = {
      accepted: {
        title: 'Application Accepted! 🎉',
        message: `Great news! Your application for "${projectTitle}" at ${companyName} has been accepted. The company will contact you soon with next steps.`
      },
      rejected: {
        title: 'Application Update',
        message: `Thank you for your interest in "${projectTitle}" at ${companyName}. Unfortunately, they have decided to move forward with other candidates.`
      }
    }

    const { title, message } = statusMessages[status]

    // Create in-app notification
    const notification = await this.create({
      userId: developerId,
      title,
      message,
      type: 'application_status',
      data: {
        applicationId,
        projectTitle,
        companyName,
        status,
        projectId
      }
    })

    // Send email notification
    try {
      // Get developer's email and name
      const developerInfo = await db.select({
        email: users.email,
        name: profiles.displayName,
        userEmail: users.name
      })
        .from(profiles)
        .innerJoin(users, eq(profiles.id, users.id))
        .where(eq(profiles.id, developerId))
        .limit(1)

      if (developerInfo.length > 0) {
        const { email, name, userEmail } = developerInfo[0]
        const developerName = name || userEmail || 'Developer'

        await EmailService.sendApplicationStatusEmail(
          email,
          developerName,
          projectTitle,
          companyName,
          status,
          projectId || applicationId
        )
      }
    } catch (emailError) {
      console.error('Failed to send application status email:', emailError)
      // Don't fail the notification creation if email fails
    }

    return notification
  }

  /**
   * Create notification for new message/contact
   */
  static async createNewMessageNotification(
    recipientId: string,
    senderName: string,
    senderRole: 'developer' | 'company',
    messagePreview: string,
    contactId: string
  ) {
    // Create in-app notification
    const notification = await this.create({
      userId: recipientId,
      title: `New message from ${senderName}`,
      message: messagePreview.length > 100 
        ? messagePreview.substring(0, 100) + '...' 
        : messagePreview,
      type: 'new_message',
      data: {
        contactId,
        senderName,
        senderRole
      }
    })

    // Send email notification
    try {
      // Get recipient's email and name
      const recipientInfo = await db.select({
        email: users.email,
        name: profiles.displayName,
        userEmail: users.name
      })
        .from(profiles)
        .innerJoin(users, eq(profiles.id, users.id))
        .where(eq(profiles.id, recipientId))
        .limit(1)

      if (recipientInfo.length > 0) {
        const { email, name, userEmail } = recipientInfo[0]
        const recipientName = name || userEmail || 'User'

        await EmailService.sendNewMessageEmail(
          email,
          recipientName,
          senderName,
          senderRole,
          messagePreview,
          contactId
        )
      }
    } catch (emailError) {
      console.error('Failed to send new message email:', emailError)
      // Don't fail the notification creation if email fails
    }

    return notification
  }

  /**
   * Create notification for project updates
   */
  static async createProjectUpdateNotification(
    userId: string,
    title: string,
    message: string,
    projectId: string,
    projectTitle: string
  ) {
    return this.create({
      userId,
      title,
      message,
      type: 'project_update',
      data: {
        projectId,
        projectTitle
      }
    })
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string) {
    try {
      await db.update(notifications)
        .set({ isRead: true })
        .where(
          and(
            eq(notifications.id, notificationId),
            eq(notifications.userId, userId)
          )
        )
      return true
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return false
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string) {
    try {
      await db.update(notifications)
        .set({ isRead: true })
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.isRead, false)
          )
        )
      return true
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      return false
    }
  }

  /**
   * Get notifications for a user
   */
  static async getUserNotifications(
    userId: string, 
    limit: number = 20, 
    offset: number = 0,
    unreadOnly: boolean = false
  ) {
    try {
      const baseConditions = [eq(notifications.userId, userId)]
      
      if (unreadOnly) {
        baseConditions.push(eq(notifications.isRead, false))
      }

      const userNotifications = await db.select()
        .from(notifications)
        .where(and(...baseConditions))
        .orderBy(desc(notifications.createdAt))
        .limit(limit)
        .offset(offset)

      return userNotifications
    } catch (error) {
      console.error('Error fetching user notifications:', error)
      return []
    }
  }

  /**
   * Get unread notification count for a user
   */
  static async getUnreadCount(userId: string) {
    try {
      const result = await db.select({ count: count() })
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.isRead, false)
          )
        )

      return result[0]?.count || 0
    } catch (error) {
      console.error('Error getting unread notification count:', error)
      return 0
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId: string, userId: string) {
    try {
      await db.delete(notifications)
        .where(
          and(
            eq(notifications.id, notificationId),
            eq(notifications.userId, userId)
          )
        )
      return true
    } catch (error) {
      console.error('Error deleting notification:', error)
      return false
    }
  }
}