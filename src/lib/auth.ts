import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type Subscription = Database['public']['Tables']['subscriptions']['Row']

export async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}

export async function getUserProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const user = await getUser()
  
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
    
  return profile
}

export async function getUserSubscription(): Promise<Subscription | null> {
  const supabase = await createClient()
  const user = await getUser()
  
  if (!user) return null
  
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()
    
  return subscription
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    redirect('/auth/sign-in')
  }
  return user
}

export async function requireProfile() {
  const profile = await getUserProfile()
  if (!profile) {
    redirect('/auth/sign-in')
  }
  return profile
}

export async function requireActiveSubscription() {
  const subscription = await getUserSubscription()
  if (!subscription || subscription.status !== 'active') {
    redirect('/pricing')
  }
  return subscription
}

export async function requireRole(role: 'developer' | 'company') {
  const profile = await requireProfile()
  if (profile.role !== role) {
    redirect('/dashboard')
  }
  return profile
}

export async function requireActiveSubscriptionAndRole(role: 'developer' | 'company') {
  const [subscription, profile] = await Promise.all([
    requireActiveSubscription(),
    requireRole(role)
  ])
  return { subscription, profile }
}