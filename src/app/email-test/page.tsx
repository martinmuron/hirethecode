'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const EMAIL_TYPES = [
  { id: 'test', name: 'Test Email', description: 'Simple test email' },
  { id: 'application_accepted', name: 'Application Accepted', description: 'Developer application accepted' },
  { id: 'application_rejected', name: 'Application Rejected', description: 'Developer application rejected' },
  { id: 'new_message', name: 'New Message', description: 'New message notification' },
  { id: 'welcome_developer', name: 'Welcome Developer', description: 'Welcome email for new developers' },
  { id: 'subscription_confirmation', name: 'Subscription Confirmation', description: 'Subscription confirmed' },
]

export default function EmailTestPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, { success: boolean; message: string }>>({})

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Not Available</h2>
              <p className="text-muted-foreground">
                Email testing is only available in development mode.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const sendTestEmail = async (type: string) => {
    setLoading(type)
    
    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      })

      const data = await response.json()
      
      setResults(prev => ({
        ...prev,
        [type]: {
          success: response.ok,
          message: data.message || data.error
        }
      }))
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [type]: {
          success: false,
          message: 'Failed to send email'
        }
      }))
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Email Testing</h1>
          <p className="text-muted-foreground">
            Test different email templates in development mode
          </p>
          <Badge variant="secondary" className="mt-2">
            Development Only
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EMAIL_TYPES.map((emailType) => (
            <Card key={emailType.id}>
              <CardHeader>
                <CardTitle className="text-lg">{emailType.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {emailType.description}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    onClick={() => sendTestEmail(emailType.id)}
                    disabled={loading === emailType.id}
                    className="w-full"
                  >
                    {loading === emailType.id ? 'Sending...' : 'Send Test Email'}
                  </Button>

                  {results[emailType.id] && (
                    <div className={`p-3 rounded-lg text-sm ${
                      results[emailType.id].success 
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                      {results[emailType.id].message}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium">Prerequisites:</h4>
              <ul className="text-sm text-muted-foreground list-disc list-inside mt-1">
                <li>Set your RESEND_API_KEY in environment variables</li>
                <li>Make sure you&apos;re signed in to the application</li>
                <li>Test emails will be sent to your account email</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium">Note:</h4>
              <p className="text-sm text-muted-foreground">
                This page is only available in development mode and will not be accessible in production.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}