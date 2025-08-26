import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { projectApplications, profiles, projects } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a developer
    const userProfile = await db.select()
      .from(profiles)
      .where(eq(profiles.id, session.user.id))
      .limit(1)

    if (!userProfile.length || userProfile[0].role !== 'developer') {
      return NextResponse.json({ error: 'Only developers can apply to projects' }, { status: 403 })
    }

    // Verify project exists and is open
    const project = await db.select()
      .from(projects)
      .where(eq(projects.id, params.id))
      .limit(1)

    if (!project.length) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project[0].status !== 'open') {
      return NextResponse.json({ error: 'Project is not accepting applications' }, { status: 400 })
    }

    // Check if developer has already applied
    const existingApplication = await db.select()
      .from(projectApplications)
      .where(and(
        eq(projectApplications.projectId, params.id),
        eq(projectApplications.developerId, session.user.id)
      ))
      .limit(1)

    if (existingApplication.length > 0) {
      return NextResponse.json({ error: 'You have already applied to this project' }, { status: 400 })
    }

    const { message } = await request.json()

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Application message is required' }, { status: 400 })
    }

    // Create application
    await db.insert(projectApplications).values({
      projectId: params.id,
      developerId: session.user.id,
      message: message.trim(),
      status: 'pending',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}