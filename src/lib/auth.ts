import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { profiles, subscriptions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import type { Profile, Subscription } from '@/lib/db/schema'

export async function getUser() {
  const session = await getServerSession(authOptions)
  return session?.user || null
}

export async function getUserProfile(): Promise<Profile | null> {
  const user = await getUser()
  if (!user?.id) return null
  
  const profile = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1)
    
  return profile[0] || null
}

export async function getUserSubscription(): Promise<Subscription | null> {
  const user = await getUser()
  if (!user?.id) return null
  
  const subscription = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, user.id))
    .limit(1)
    
  return subscription[0] || null
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

export async function requireRole(role: 'developer' | 'company' | 'admin') {
  const profile = await requireProfile()
  if (profile.role !== role) {
    redirect('/dashboard')
  }
  return profile
}

export async function requireActiveSubscriptionAndRole(role: 'developer' | 'company' | 'admin') {
  const [subscription, profile] = await Promise.all([
    requireActiveSubscription(),
    requireRole(role)
  ])
  return { subscription, profile }
}

export async function requireAdmin() {
  return requireRole('admin')
}

export async function isAdmin() {
  try {
    const profile = await getUserProfile()
    return profile?.role === 'admin'
  } catch {
    return false
  }
}