import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import {
  profiles, developerProfiles, users, projects, subscriptions, companyProfiles
} from '@/lib/db/schema'
import { eq, and, count, sql, or, gte } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      console.log('❌ No session in admin stats')
      return NextResponse.json({ error: 'No session' }, { status: 401 })
    }

    const adminProfile = await db.query.profiles.findFirst({
      where: eq(profiles.id, session.user.id as string),
    })

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
        // Total Users
        db.select({ count: count() }).from(users),

        // Pending developers
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

        // Total developers (approved)
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

        // Total Companies
        db
        .select({ count: count() })
        .from(profiles)
        .innerJoin(companyProfiles, eq(profiles.id, companyProfiles.userId))
        .where(eq(profiles.role, 'company')),

      // Active projects (open or in_progress)
      db
        .select({ count: count() })
        .from(projects)
        .where(
          or(
            eq(projects.status, 'open'),
            eq(projects.status, 'in_progress')
          )
        ),

      // Monthly recurring revenue (active subscriptions)
      // This assumes you have subscription pricing data
      db
        .select({ 
          count: count(),
          // You might want to add pricing tiers to calculate actual revenue
          // For now, we'll just count active subscriptions
        })
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.status, 'active'),
            gte(subscriptions.currentPeriodEnd, new Date())
          )
        ),

      // Recent signups (last 30 days)
      db
        .select({ count: count() })
        .from(users)
        .where(
          gte(users.createdAt, sql`NOW() - INTERVAL '30 days'`)
        )
    ])

    // Calculate estimated revenue (you may need to adjust this based on your pricing model)
    const activeSubscriptions = revenueResult[0]?.count || 0
    // Assuming average subscription value - adjust these based on your actual pricing
    const estimatedMonthlyRevenue = activeSubscriptions * 29 // $29 average per subscription

    // Additional useful stats
    const [
      approvedDevelopersResult,
      rejectedDevelopersResult,
      totalProjectsResult,
      closedProjectsResult
    ] = await Promise.all([
      // Approved developers
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

      // Rejected developers
      db
        .select({ count: count() })
        .from(profiles)
        .innerJoin(developerProfiles, eq(profiles.id, developerProfiles.userId))
        .where(
          and(
            eq(profiles.role, 'developer'),
            eq(developerProfiles.approved, 'rejected')
          )
        ),

      // Total projects
      db.select({ count: count() }).from(projects),

      // Closed projects
      db
        .select({ count: count() })
        .from(projects)
        .where(eq(projects.status, 'closed'))
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
    
    return NextResponse.json({ stats })
  } catch(err) {
    console.error(`Error fetching stats, vole: ${err}`)
    return NextResponse.json({ error: `Error fetching stats, vole: ${err}` }, { status: 500 })
  }
}
