import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { profiles } from '@/lib/db/schema'
import { PendingDevelopersPage } from '@/components/admin/pending-developers-page'

export default async function PendingDevelopersRoute() {
  const user = await currentUser()

  if(!user) {
    redirect('/auth/sign-in')
  }

  const adminProfile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id as string),
  })

  // console.log(`ADMIN PROFILE: ${JSON.stringify(adminProfile, null, "  ")}`)

  if (adminProfile?.role !== 'admin') {
    redirect('/dashboard')
  }

  return <PendingDevelopersPage 
    adminProfile={adminProfile} 
    user={user}
  />
}
