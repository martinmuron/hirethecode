import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const projectData = await db.projects.findOpenProjectsWithSeekers()

    if (!projectsData.length) {
      return NextResponse.json({
        projects: [],
        count: 0
      })
    }

    const projectIds = projectsData.map(p => p.projectId)
    const allProjectSkills = await db.projects.findSkillsForProjects(projectIds)
    
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
