import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { profiles } from '@/lib/db/schema'
import { PendingDevelopersPage } from '@/components/admin/pending-developers-page'

export default async function PendingDevelopersRoute() {
  const session = await getServerSession(authOptions)

  const adminProfile = await db.query.profiles.findFirst({
    where: eq(profiles.id, session.user.id as string),
  })

  console.log(`ADMIN PROFILE: ${JSON.stringify(adminProfile, null, "  ")}`)

  if (adminProfile?.role !== 'admin') {
    redirect('/dashboard')
  }

  return <PendingDevelopersPage 
    adminProfile={adminProfile} 
    user={session.user}
  />
}
