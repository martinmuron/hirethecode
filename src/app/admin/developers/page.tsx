import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { profiles } from '@/lib/db/schema'
import { DevelopersPage } from '@/components/admin/developers-page'

export default async function DevelopersRoute() {
  const session = await getServerSession(authOptions)

  const adminProfile = await db.query.profiles.findFirst({
    where: eq(profiles.id, session.user.id as string),
  })

  // console.log(`ADMIN PROFILE: ${JSON.stringify(adminProfile, null, "  ")}`)

  if (adminProfile?.role !== 'admin') {
    redirect('/dashboard')
  }

  return <DevelopersPage 
    status={'pending'}
    adminProfile={adminProfile} 
    user={session.user}
  />
}
