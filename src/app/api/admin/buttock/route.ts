import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth/config'
import { getServerSession } from 'next-auth/next'
import { db } from '@/lib/db'
import { headers, cookies } from "next/headers"
import {
  profiles, developerProfiles, users, projects, subscriptions, companyProfiles
} from '@/lib/db/schema'
import { eq, and, count, sql, or, gte } from 'drizzle-orm'

export async function GET() {
  try {
    const headersList = await headers()
    const cookieStore = await cookies()
    const session = await getServerSession(authOptions)
    console.log("Session result:", session)

    if (!session) {
      console.log('❌ No session in admin stats')
      return NextResponse.json({ error: 'No session' }, { status: 401 })
    }

    const adminProfile = await db.query.profiles.findFirst({
      where: eq(profiles.id, session.user.id as string),
    })

    // console.log('Found admin profile:', adminProfile)

    if (!adminProfile) {
      console.log('❌ No profile found for user:', session.user.id)
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if(adminProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'You are not an admin, vole' }, { status: 403 })
    }

    const [
      totalUsersResult,
      pendingDevelopersResult,
      totalDevelopersResult,
      totalCompaniesResult,
      activeProjectsResult,
      revenueResult,
      recentSignupsResult
    ] = await Promise.all([
        db.select({ count: count() }).from(users),
        db
        .select({ count: count() })
        .from(profiles)
        .innerJoin(developerProfiles, eq(profiles.id, developerProfiles.userId))
        .where(
          and(
            eq(profiles.role, 'developer'),
            eq(developerProfiles.approved, 'pending')
          )
        ),
        db
        .select({ count: count() })
        .from(profiles)
        .innerJoin(developerProfiles, eq(profiles.id, developerProfiles.userId))
        .where(
          and(
            eq(profiles.role, 'developer'),
            eq(developerProfiles.approved, 'approved')
          )
        ),
        db
        .select({ count: count() })
        .from(profiles)
        .innerJoin(companyProfiles, eq(profiles.id, companyProfiles.userId))
        .where(eq(profiles.role, 'company')),
        4,
        12.4,
        1
    ])

    console.log(`PENDING DEVELOPERS RESULT! -> ${JSON.stringify(pendingDevelopersResult)}`);

    // Calculate estimated revenue (you may need to adjust this based on your pricing model)
    const activeSubscriptions = revenueResult[0]?.count || 0
    // Assuming average subscription value - adjust these based on your actual pricing
    const estimatedMonthlyRevenue = activeSubscriptions * 29 // $29 average per subscription

    const [
      approvedDevelopersResult,
      rejectedDevelopersResult,
      totalProjectsResult,
      closedProjectsResult
    ] = await Promise.all([
        0,
        0,
        0,
        0
    ])

    const stats = {
      // Main dashboard stats
      totalUsers: totalUsersResult[0]?.count || 0,
      pendingDevelopers: pendingDevelopersResult[0]?.count || 0,
      totalDevelopers: totalDevelopersResult[0]?.count || 0,
      totalCompanies: totalCompaniesResult[0]?.count || 0,
      activeProjects: activeProjectsResult[0]?.count || 0,
      totalRevenue: estimatedMonthlyRevenue,
      
      // Additional useful stats
      recentSignups: recentSignupsResult[0]?.count || 0,
      approvedDevelopers: approvedDevelopersResult[0]?.count || 0,
      rejectedDevelopers: rejectedDevelopersResult[0]?.count || 0,
      totalProjects: totalProjectsResult[0]?.count || 0,
      closedProjects: closedProjectsResult[0]?.count || 0,
      activeSubscriptions: activeSubscriptions,
      //
      // Calculated percentages for insights
      developerApprovalRate: totalDevelopersResult[0]?.count && pendingDevelopersResult[0]?.count 
        ? Math.round((approvedDevelopersResult[0]?.count || 0) / 
          ((approvedDevelopersResult[0]?.count || 0) + (rejectedDevelopersResult[0]?.count || 0) + (pendingDevelopersResult[0]?.count || 0)) * 100)
        : 0,
      
      projectCompletionRate: totalProjectsResult[0]?.count 
        ? Math.round((closedProjectsResult[0]?.count || 0) / (totalProjectsResult[0]?.count || 0) * 100)
        : 0,
    }

    return Response.json({
      stats
    })

  } catch(err) {
    console.error(`Error fetching stats, vole: ${err}`)
    return NextResponse.json({ error: `Error fetching stats, vole: ${err}` }, { status: 500 })
  }
}
