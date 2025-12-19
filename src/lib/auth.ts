import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/database' 
import type { Profile, Subscription } from '@/lib/database'

export async function getUser() {
  try {
    const user = await currentUser()
    console.log('getUser: currentUser =', user?.id)

    const id = user?.id
    return id ? { id } : null
  } catch(err) {
    console.error('getUser error:', error)
    return null
  }
}

export async function getUserProfile(): Promise<Profile | null> {
  const user = await getUser()
  if (!user?.id) return null
  return await db.profiles.findById(user.id) 
}

export async function getUserSubscription(): Promise<Subscription | null> {
  const user = await getUser()
  if (!user?.id) return null
  return await db.subscriptions.findByUserId(user.id) 
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
