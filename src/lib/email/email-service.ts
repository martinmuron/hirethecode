import { resend, EMAIL_CONFIG } from './config'
import { render } from '@react-email/render'
import { ApplicationStatusEmail } from './templates/application-status'
import { NewMessageEmail } from './templates/new-message'
import { WelcomeDeveloperEmail } from './templates/welcome-developer'
import { WelcomeSeekerEmail } from './templates/welcome-seeker'
import { WelcomeCompanyEmail} from './templates/welcome-company'

export class EmailService {
  /**
   * Send application status notification email
   */
  static async sendApplicationStatusEmail(
    to: string,
    developerName: string,
    projectTitle: string,
    companyName: string,
    status: 'accepted' | 'rejected',
    projectId: string
  ) {
    try {
      const projectUrl = `${EMAIL_CONFIG.baseUrl}/projects/${projectId}`
      
      const emailHtml = await render(
        ApplicationStatusEmail({
          developerName,
          projectTitle,
          companyName,
          status,
          projectUrl,
        })
      )

      const subject = status === 'accepted' 
        ? `🎉 Your application for "${projectTitle}" has been accepted!`
        : `Update on your application for "${projectTitle}"`

      await resend.emails.send({
        from: EMAIL_CONFIG.from,
        to,
        subject,
        html: emailHtml,
        replyTo: EMAIL_CONFIG.replyTo,
      })

      console.log(`Application status email sent to ${to}`)
      return true
    } catch (error) {
      console.error('Error sending application status email:', error)
      return false
    }
  }

  /**
   * Send new message notification email
   */
  static async sendNewMessageEmail(
    to: string,
    recipientName: string,
    senderName: string,
    senderRole: 'developer' | 'company',
    messagePreview: string,
    messageId?: string
  ) {
    try {
      const messageUrl = `${EMAIL_CONFIG.baseUrl}/messages${messageId ? `#${messageId}` : ''}`
      
      const emailHtml = await render(
        NewMessageEmail({
          recipientName,
          senderName,
          senderRole,
          messagePreview,
          messageUrl,
        })
      )

      await resend.emails.send({
        from: EMAIL_CONFIG.from,
        to,
        subject: `💬 New message from ${senderName}`,
        html: emailHtml,
        replyTo: EMAIL_CONFIG.replyTo,
      })

      console.log(`New message email sent to ${to}`)
      return true
    } catch (error) {
      console.error('Error sending new message email:', error)
      return false
    }
  }

  /**
   * Send welcome email to new seeker
   */
  static async sendWelcomeDeveloperEmail(
    to: string,
    seekerName: string,
    userId: string
  ) {
    try {
      const profileUrl = `${EMAIL_CONFIG.baseUrl}/profile`
      
      const emailHtml = await render(
        WelcomeSeekerEmail({
          seekerName,
          profileUrl,
        })
      )

      await resend.emails.send({
        from: EMAIL_CONFIG.from,
        to,
        subject: `🚀 Welcome to Hire the Code, ${seekerName}!`,
        html: emailHtml,
        replyTo: EMAIL_CONFIG.replyTo,
      })

      console.log(`Welcome email sent to SEEKER ${to}`)
      return true
    } catch (error) {
      console.error('Error sending welcome email to seeker:', error)
      return false
    }
  }

  /**
   * Send welcome email to new developer
   */
  static async sendWelcomeDeveloperEmail(
    to: string,
    developerName: string,
    userId: string
  ) {
    try {
      const profileUrl = `${EMAIL_CONFIG.baseUrl}/profile`
      
      const emailHtml = await render(
        WelcomeDeveloperEmail({
          developerName,
          profileUrl,
        })
      )

      await resend.emails.send({
        from: EMAIL_CONFIG.from,
        to,
        subject: `🚀 Welcome to Hire the Code, ${developerName}!`,
        html: emailHtml,
        replyTo: EMAIL_CONFIG.replyTo,
      })

      console.log(`Welcome email sent to ${to}`)
      return true
    } catch (error) {
      console.error('Error sending welcome email:', error)
      return false
    }
  }

  /**
   * Send welcome email to new company
   */
  static async sendWelcomeCompanyEmail(
    to: string,
    companyName: string,
    userId: string
  ) {
    try {
      const profileUrl = `${EMAIL_CONFIG.baseUrl}/profile`
      
      const emailHtml = await render(
        WelcomeCompanyEmail({
          companyName,
          profileUrl,
        })
      )

      await resend.emails.send({
        from: EMAIL_CONFIG.from,
        to,
        subject: `🚀 Welcome to Hire the Code, ${companyName}!`,
        html: emailHtml,
        replyTo: EMAIL_CONFIG.replyTo,
      })

      console.log(`Welcome email sent to ${to}`)
      return true
    } catch (error) {
      console.error('Error sending welcome email:', error)
      return false
    }
  }

  /**
   * Send project update notification email
   */
  static async sendProjectUpdateEmail(
    to: string,
    recipientName: string,
    projectTitle: string,
    updateMessage: string,
    projectId: string
  ) {
    try {
      const projectUrl = `${EMAIL_CONFIG.baseUrl}/projects/${projectId}`
      
      await resend.emails.send({
        from: EMAIL_CONFIG.from,
        to,
        subject: `📢 Update on "${projectTitle}"`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Hi ${recipientName},</h2>
            <p>There's an update on the project <strong>"${projectTitle}"</strong>:</p>
            <div style="background-color: #f6f6f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p>${updateMessage}</p>
            </div>
            <p>
              <a href="${projectUrl}" style="background-color: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Project
              </a>
            </p>
            <p>Best regards,<br>The Hire the Code Team</p>
          </div>
        `,
        replyTo: EMAIL_CONFIG.replyTo,
      })

      console.log(`Project update email sent to ${to}`)
      return true
    } catch (error) {
      console.error('Error sending project update email:', error)
      return false
    }
  }

  /**
   * Send subscription confirmation email
   */
  static async sendSubscriptionConfirmationEmail(
    to: string,
    userName: string,
    planName: string,
    planPrice: string,
    billingInterval: 'monthly' | 'yearly'
  ) {
    try {
      const billingUrl = `${EMAIL_CONFIG.baseUrl}/billing`
      
      await resend.emails.send({
        from: EMAIL_CONFIG.from,
        to,
        subject: `🎉 Welcome to ${planName} - Subscription Confirmed!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Hi ${userName},</h2>
            <p>🎉 <strong>Welcome to ${planName}!</strong> Your subscription has been confirmed and you now have full access to all premium features.</p>
            
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0066cc;">
              <h3 style="margin-top: 0;">Subscription Details:</h3>
              <p><strong>Plan:</strong> ${planName}</p>
              <p><strong>Billing:</strong> ${planPrice} (${billingInterval})</p>
              <p><strong>Status:</strong> Active</p>
            </div>

            <h3>What's Next?</h3>
            <ul>
              <li>Start exploring all premium features</li>
              <li>Complete your profile for better matches</li>
              <li>Connect with top talent/companies</li>
              <li>Build amazing projects together</li>
            </ul>

            <p>
              <a href="${billingUrl}" style="background-color: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Manage Subscription
              </a>
            </p>

            <p>If you have any questions, just reply to this email. We're here to help!</p>
            <p>Best regards,<br>The Hire the Code Team</p>
          </div>
        `,
        replyTo: EMAIL_CONFIG.replyTo,
      })

      console.log(`Subscription confirmation email sent to ${to}`)
      return true
    } catch (error) {
      console.error('Error sending subscription confirmation email:', error)
      return false
    }
  }

  /**
   * Send test email (for development purposes)
   */
  static async sendTestEmail(to: string) {
    try {
      await resend.emails.send({
        from: EMAIL_CONFIG.from,
        to,
        subject: 'Test Email from Hire the Code',
        html: '<h1>Test Email</h1><p>This is a test email from Hire the Code!</p>',
      })

      console.log(`Test email sent to ${to}`)
      return true
    } catch (error) {
      console.error('Error sending test email:', error)
      return false
    }
  }
}
