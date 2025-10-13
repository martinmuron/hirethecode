import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('Missing RESEND_API_KEY environment variable')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

export const EMAIL_CONFIG = {
  from: 'Hire the Code <noreply@thurk.org>',
  replyTo: 'support@thurk.org',
  
  // Base URLs for email links
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // Email templates
  templates: {
    applicationStatus: 'application-status',
    newMessage: 'new-message',
    projectUpdate: 'project-update',
    welcomeDeveloper: 'welcome-developer',
    welcomeCompany: 'welcome-company',
    subscriptionConfirmation: 'subscription-confirmation'
  }
}
