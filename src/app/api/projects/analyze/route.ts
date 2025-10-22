import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

interface AnalyzeRequest {
  description: string
}

interface ClaudeAnalysis {
  requiredSkills: string[]
  complexity: 'simple' | 'moderate' | 'complex' | 'enterprise'
  estimatedTimeline: string
  recommendedFor: 'freelancer' | 'company' | 'either'
  suggestedBudget?: {
    min: number
    max: number
    currency: string
  }
  projectTitle?: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body: AnalyzeRequest = await request.json()
    const { description } = body

    if (!description?.trim()) {
      return NextResponse.json(
        { error: 'Project description is required' },
        { status: 400 }
      )
    }

    // Validate Claude API key
    if (!process.env.CLAUDE_API_KEY) {
      console.error('Claude API key not configured')
      return NextResponse.json(
        { error: 'AI analysis service not available' },
        { status: 500 }
      )
    }

    // Create the prompt for Claude
    const prompt = `
Analyze this project description and provide a structured analysis for a freelance/contractor marketplace. The analysis should help match the project with appropriate developers or development companies.

Project Description: "${description}"

Please respond with a JSON object containing:

1. "requiredSkills": An array of specific technical skills needed (e.g., ["React", "Node.js", "PostgreSQL", "AWS"])
2. "complexity": One of "simple", "moderate", "complex", or "enterprise"
3. "estimatedTimeline": A human-readable estimate (e.g., "2-4 weeks", "3-6 months")
4. "recommendedFor": One of "freelancer" (single developer), "company" (team needed), or "either"
5. "suggestedBudget": Object with min/max/currency if you can estimate (optional)
6. "projectTitle": A concise, professional title for the project (optional)

Guidelines:
- Focus on mainstream, commonly-used technologies
- Be realistic about timelines
- Consider project scope when recommending freelancer vs company
- Only suggest budget if the description gives clear indicators
- Keep skill names consistent (e.g., "JavaScript" not "JS", "React" not "React.js")

Respond only with valid JSON.`

    // Call Claude API
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307', // or claude-3-haiku-20240307 for faster/cheaper
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    })

    if (!claudeResponse.ok) {
      const errorData = await claudeResponse.text()
      console.error('Claude API error:', claudeResponse.status, errorData)
      return NextResponse.json(
        { error: 'Failed to analyze project description' },
        { status: 500 }
      )
    }

    const claudeData = await claudeResponse.json()
    
    // Extract the content from Claude's response
    const content = claudeData.content?.[0]?.text
    if (!content) {
      console.error('No content in Claude response:', claudeData)
      return NextResponse.json(
        { error: 'Invalid response from AI service' },
        { status: 500 }
      )
    }

    try {
      // Parse Claude's JSON response
      const analysis: ClaudeAnalysis = JSON.parse(content)
      
      // Validate the response structure
      if (!analysis.requiredSkills || !Array.isArray(analysis.requiredSkills)) {
        throw new Error('Invalid skills array')
      }
      
      if (!['simple', 'moderate', 'complex', 'enterprise'].includes(analysis.complexity)) {
        analysis.complexity = 'moderate' // Default fallback
      }
      
      if (!['freelancer', 'company', 'either'].includes(analysis.recommendedFor)) {
        analysis.recommendedFor = 'either' // Default fallback
      }

      // Clean up and validate skills
      analysis.requiredSkills = analysis.requiredSkills
        .filter(skill => typeof skill === 'string' && skill.trim())
        .map(skill => skill.trim())
        .slice(0, 15) // Limit to 15 skills max

      return NextResponse.json(analysis)

    } catch (parseError) {
      console.error('Failed to parse Claude response:', parseError, content)
      
      // Fallback analysis if Claude returns invalid JSON
      const fallbackAnalysis: ClaudeAnalysis = {
        requiredSkills: extractSkillsFromDescription(description),
        complexity: 'moderate',
        estimatedTimeline: '4-8 weeks',
        recommendedFor: 'either',
        projectTitle: generateFallbackTitle(description)
      }
      
      return NextResponse.json(fallbackAnalysis)
    }

  } catch (error) {
    console.error('Error in project analysis:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Fallback skill extraction if Claude fails
function extractSkillsFromDescription(description: string): string[] {
  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js', 
    'Python', 'Django', 'Flask', 'PHP', 'Laravel', 'Java', 'Spring', 
    'C#', '.NET', 'Ruby', 'Rails', 'Go', 'Rust', 'Swift', 'Kotlin',
    'HTML', 'CSS', 'Tailwind', 'Bootstrap', 'MongoDB', 'PostgreSQL', 
    'MySQL', 'Redis', 'AWS', 'Google Cloud', 'Azure', 'Docker', 
    'Kubernetes', 'GraphQL', 'REST API', 'Git', 'Firebase', 'Stripe'
  ]
  
  const lowerDescription = description.toLowerCase()
  const foundSkills = commonSkills.filter(skill => 
    lowerDescription.includes(skill.toLowerCase())
  )
  
  // Add some default web skills if nothing found
  if (foundSkills.length === 0) {
    return ['JavaScript', 'HTML', 'CSS']
  }
  
  return foundSkills.slice(0, 8) // Limit fallback skills
}

// Fallback title generation
function generateFallbackTitle(description: string): string {
  const words = description.trim().split(' ').slice(0, 6).join(' ')
  return words.length > 50 ? words.substring(0, 50) + '...' : words
}
