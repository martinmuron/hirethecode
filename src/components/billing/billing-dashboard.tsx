'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DashboardNav } from '@/components/navigation/dashboard-nav'
import { 
  CreditCard, 
  Calendar, 
  Check, 
  X,
  ExternalLink,
  AlertTriangle,
  Crown,
  Building2,
  Code
} from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface BillingDashboardProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  userRole: 'developer' | 'company' | 'admin'
}

interface Subscription {
  id: string
  status: string
  productTier: string
  currentPeriodEnd: string
  isActive: boolean
  isCanceling: boolean
}

const PLAN_FEATURES = {
  developer: {
    name: 'Developer Pro',
    price: '$99/month',
    yearlyPrice: '$990/year',
    icon: Code,
    color: 'bg-blue-500',
    features: [
      'Apply to unlimited projects',
      'Direct messaging with companies',
      'Advanced profile customization',
      'Portfolio showcase',
      'Skill verification badges',
      'Priority in search results',
      'Email notifications',
      'Mobile app access'
    ]
  },
  company: {
    name: 'Company Enterprise',
    price: '$499/month', 
    yearlyPrice: '$4990/year',
    icon: Building2,
    color: 'bg-purple-500',
    features: [
      'Post unlimited projects',
      'Access to all developers',
      'Smart matching algorithm',
      'Advanced filtering & search',
      'Application management dashboard',
      'Direct messaging with developers',
      'Team collaboration tools',
      'Priority support',
      'Custom branding',
      'Analytics & reporting'
    ]
  },
  admin: {
    name: 'Admin Access',
    price: 'Free',
    yearlyPrice: 'Free',
    icon: Crown,
    color: 'bg-gold-500',
    features: [
      'Full platform access',
      'User management',
      'System administration',
      'Advanced analytics',
      'Content moderation',
      'Support system access',
      'Database administration',
      'Security monitoring'
    ]
  }
}

export function BillingDashboard({ user, userRole }: BillingDashboardProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/subscription')
      const data = await response.json()
      
      if (data.hasSubscription) {
        setSubscription(data.subscription)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (billingInterval: 'monthly' | 'yearly') => {
    setActionLoading(true)
    
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: userRole,
          billingInterval
        })
      })

      const { url } = await response.json()
      
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleManageBilling = async () => {
    setActionLoading(true)
    
    try {
      const response = await fetch('/api/stripe/create-billing-portal', {
        method: 'POST'
      })

      const { url } = await response.json()
      
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error creating billing portal session:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access at the end of your billing period.')) {
      return
    }

    setActionLoading(true)
    
    try {
      await fetch('/api/stripe/subscription', {
        method: 'DELETE'
      })
      
      await fetchSubscription() // Refresh subscription data
    } catch (error) {
      console.error('Error canceling subscription:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReactivateSubscription = async () => {
    setActionLoading(true)
    
    try {
      await fetch('/api/stripe/subscription', {
        method: 'PATCH'
      })
      
      await fetchSubscription() // Refresh subscription data
    } catch (error) {
      console.error('Error reactivating subscription:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'canceled': return 'bg-red-100 text-red-800'
      case 'past_due': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const planInfo = PLAN_FEATURES[userRole]
  const PlanIcon = planInfo.icon

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav role={userRole} />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Billing & Subscription</h1>
          <p className="text-muted-foreground">
            Manage your subscription and billing information
          </p>
        </div>

        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <div className="text-muted-foreground">Loading subscription information...</div>
              </div>
            </CardContent>
          </Card>
        ) : subscription ? (
          // Has active subscription
          <div className="space-y-6">
            {/* Current Plan */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${planInfo.color}`}>
                      <PlanIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {planInfo.name}
                        <Crown className="h-5 w-5 text-yellow-500" />
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">Current plan</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(subscription.status)}>
                    {subscription.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Renews on {formatDate(subscription.currentPeriodEnd)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm capitalize">{subscription.productTier} plan</span>
                  </div>
                </div>

                {subscription.isCanceling && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Your subscription is set to cancel on {formatDate(subscription.currentPeriodEnd)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button 
                    onClick={handleManageBilling}
                    disabled={actionLoading}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Manage Billing
                  </Button>
                  
                  {subscription.isCanceling ? (
                    <Button 
                      variant="outline"
                      onClick={handleReactivateSubscription}
                      disabled={actionLoading}
                    >
                      Reactivate Subscription
                    </Button>
                  ) : (
                    <Button 
                      variant="outline"
                      onClick={handleCancelSubscription}
                      disabled={actionLoading}
                    >
                      Cancel Subscription
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Plan Features */}
            <Card>
              <CardHeader>
                <CardTitle>Your Plan Includes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {planInfo.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // No subscription
          <div className="space-y-6">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                  <div className={`p-4 rounded-full ${planInfo.color} w-16 h-16 flex items-center justify-center`}>
                    <PlanIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl">{planInfo.name}</CardTitle>
                <p className="text-muted-foreground">
                  Get full access to all premium features
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Pricing */}
                <div className="text-center space-y-4">
                  <div className="flex justify-center gap-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{planInfo.price}</div>
                      <div className="text-sm text-muted-foreground">Monthly billing</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{planInfo.yearlyPrice}</div>
                      <div className="text-sm text-muted-foreground">
                        Yearly billing
                        <Badge variant="secondary" className="ml-2">Save 17%</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4">
                    <Button 
                      size="lg"
                      onClick={() => handleSubscribe('monthly')}
                      disabled={actionLoading}
                    >
                      Subscribe Monthly
                    </Button>
                    <Button 
                      size="lg"
                      variant="outline"
                      onClick={() => handleSubscribe('yearly')}
                      disabled={actionLoading}
                    >
                      Subscribe Yearly
                    </Button>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="font-semibold mb-4">What&apos;s included:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {planInfo.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
