import { redirect } from 'next/navigation'
import { getUserProfile, getUserSubscription } from '@/lib/auth'
import { DeveloperDashboard } from '@/components/dashboard/developer-dashboard'
import { CompanyDashboard } from '@/components/dashboard/company-dashboard'
import { SubscriptionRequired } from '@/components/dashboard/subscription-required'

export default async function DashboardPage() {
  const [profile, subscription] = await Promise.all([
    getUserProfile(),
    getUserSubscription(),
  ])

  if (!profile) {
    redirect('/auth/sign-in')
  }

  // Check if user has active subscription
  if (!subscription || subscription.status !== 'active') {
    return <SubscriptionRequired role={profile.role} />
  }

  // Role-based dashboard rendering
  if (profile.role === 'developer') {
    return <DeveloperDashboard profile={profile} />
  } else {
    return <CompanyDashboard profile={profile} />
  }
}