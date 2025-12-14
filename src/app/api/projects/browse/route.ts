import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { 
  projects, 
  profiles, 
  seekerProfiles,
  projectSkills, 
  skills 
} from '@/lib/db/schema'
import { eq, desc, and, inArray } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()

    if (!user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get all open projects with seeker information
    const projectsData = await db
      .select({
        // Project fields
        projectId: projects.id,
        title: projects.title,
        description: projects.description,
        budgetMin: projects.budgetMin,
        budgetMax: projects.budgetMax,
        currency: projects.currency,
        timeline: projects.timeline,
        locationPref: projects.locationPref,
        status: projects.status,
        complexity: projects.complexity,
        recommendedFor: projects.recommendedFor,
        createdAt: projects.createdAt,
        
        // Seeker profile fields
        seekerId: profiles.id,
        seekerDisplayName: profiles.displayName,
        seekerAvatarUrl: profiles.avatarUrl,
        
        // Seeker organization name (from seekerProfiles if available)
        organizationName: seekerProfiles.organizationName,
      })
      .from(projects)
      .innerJoin(profiles, eq(projects.seekerId, profiles.id))
      .leftJoin(seekerProfiles, eq(profiles.id, seekerProfiles.userId))
      .where(
        and(
          eq(projects.status, 'open'), // Only show open projects
          eq(profiles.role, 'seeker')   // Ensure seeker role
        )
      )
      .orderBy(desc(projects.createdAt))

    if (!projectsData.length) {
      return NextResponse.json({
        projects: [],
        count: 0
      })
    }

    // Get all skills for all projects in one efficient query
    const projectIds = projectsData.map(p => p.projectId)
    
    const allProjectSkills = await db
      .select({
        projectId: projectSkills.projectId,
        skillId: skills.id,
        skillSlug: skills.slug,
        skillLabel: skills.label,
      })
      .from(projectSkills)
      .innerJoin(skills, eq(projectSkills.skillId, skills.id))
      .where(inArray(projectSkills.projectId, projectIds))

    // Group skills by project ID
    const skillsByProject = new Map<string, Array<{id: number, slug: string, label: string}>>()
    
    for (const skill of allProjectSkills) {
      if (!skillsByProject.has(skill.projectId)) {
        skillsByProject.set(skill.projectId, [])
      }
      skillsByProject.get(skill.projectId)!.push({
        id: skill.skillId,
        slug: skill.skillSlug,
        label: skill.skillLabel
      })
    }

    // Transform the data into the expected format
    const formattedProjects = projectsData.map(project => ({
      id: project.projectId,
      title: project.title,
      description: project.description,
      budgetMin: project.budgetMin?.toString() || null,
      budgetMax: project.budgetMax?.toString() || null,
      currency: project.currency,
      timeline: project.timeline,
      locationPref: project.locationPref,
      status: project.status,
      complexity: project.complexity,
      recommendedFor: project.recommendedFor,
      createdAt: project.createdAt.toISOString(),
      seeker: {
        id: project.seekerId,
        displayName: project.seekerDisplayName,
        avatarUrl: project.seekerAvatarUrl,
        organizationName: project.organizationName,
      },
      skills: skillsByProject.get(project.projectId) || []
    }))

    return NextResponse.json({
      projects: formattedProjects,
      count: formattedProjects.length
    })

  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
