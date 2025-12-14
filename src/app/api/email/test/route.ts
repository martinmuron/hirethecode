import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email/email-service'

export async function POST(req: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
    }

    const user = await currentUser()
    
    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type } = await req.json()

    let result = false

    switch (type) {
      case 'test':
        result = await EmailService.sendTestEmail(user.email)
        break

      case 'application_accepted':
        result = await EmailService.sendApplicationStatusEmail(
          user.emailAddresses[0]?.emailAddress,
          user.fullName || 'Justin Greenough',
          'Full-Stack React Developer Position',
          'TechCorp Inc.',
          'accepted',
          'test-project-id'
        )
        break

      case 'application_rejected':
        result = await EmailService.sendApplicationStatusEmail(
          user.emailAddresses[0]?.emailAddress,
          user.fullName || 'John Doe',
          'Senior Backend Engineer Role',
          'StartupXYZ',
          'rejected',
          'test-project-id'
        )
        break

      case 'new_message':
        result = await EmailService.sendNewMessageEmail(
          user.emailAddresses[0]?.emailAddress,
          user.fullName || 'Jane Smith',
          'Alex Thompson',
          'company',
          'Hi! I saw your profile and I\'m really impressed with your work. We have an exciting project that would be perfect for your skills. Would you be interested in discussing this opportunity?',
          'test-message-id'
        )
        break

      case 'welcome_developer':
        result = await EmailService.sendWelcomeDeveloperEmail(
          user.emailAddresses[0]?.emailAddress,
          user.fullName || 'John Doe',
          user.id
        )
        break

      case 'subscription_confirmation':
        result = await EmailService.sendSubscriptionConfirmationEmail(
          user.emailAddresses[0]?.emailAddress,
          user.fullName || 'John Doe',
          'Developer Pro',
          '$99',
          'monthly'
        )
        break

      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 })
    }

    if (result) {
      return NextResponse.json({ 
        success: true,
        message: `${type} email sent successfully to ${user.emailAddresses[0]?.emailAddress}` 
      })
    } else {
      return NextResponse.json({ 
        error: 'Failed to send email' 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error sending test email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
