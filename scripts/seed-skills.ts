import { db } from '../src/lib/db'
import { skills } from '../src/lib/db/schema'

const SKILLS_DATA = [
  { id: 1, slug: 'javascript', label: 'JavaScript' },
  { id: 2, slug: 'typescript', label: 'TypeScript' },
  { id: 3, slug: 'react', label: 'React' },
  { id: 4, slug: 'nextjs', label: 'Next.js' },
  { id: 5, slug: 'nodejs', label: 'Node.js' },
  { id: 6, slug: 'python', label: 'Python' },
  { id: 7, slug: 'java', label: 'Java' },
  { id: 8, slug: 'csharp', label: 'C#' },
  { id: 9, slug: 'php', label: 'PHP' },
  { id: 10, slug: 'golang', label: 'Go' },
  { id: 11, slug: 'rust', label: 'Rust' },
  { id: 12, slug: 'swift', label: 'Swift' },
  { id: 13, slug: 'kotlin', label: 'Kotlin' },
  { id: 14, slug: 'dart', label: 'Dart' },
  { id: 15, slug: 'vue', label: 'Vue.js' },
  { id: 16, slug: 'angular', label: 'Angular' },
  { id: 17, slug: 'svelte', label: 'Svelte' },
  { id: 18, slug: 'express', label: 'Express.js' },
  { id: 19, slug: 'nestjs', label: 'NestJS' },
  { id: 20, slug: 'django', label: 'Django' },
  { id: 21, slug: 'flask', label: 'Flask' },
  { id: 22, slug: 'rails', label: 'Ruby on Rails' },
  { id: 23, slug: 'laravel', label: 'Laravel' },
  { id: 24, slug: 'spring', label: 'Spring Framework' },
  { id: 25, slug: 'dotnet', label: '.NET' },
  { id: 26, slug: 'aws', label: 'AWS' },
  { id: 27, slug: 'gcp', label: 'Google Cloud' },
  { id: 28, slug: 'azure', label: 'Microsoft Azure' },
  { id: 29, slug: 'docker', label: 'Docker' },
  { id: 30, slug: 'kubernetes', label: 'Kubernetes' },
  { id: 31, slug: 'terraform', label: 'Terraform' },
  { id: 32, slug: 'mongodb', label: 'MongoDB' },
  { id: 33, slug: 'postgresql', label: 'PostgreSQL' },
  { id: 34, slug: 'mysql', label: 'MySQL' },
  { id: 35, slug: 'redis', label: 'Redis' },
  { id: 36, slug: 'graphql', label: 'GraphQL' },
  { id: 37, slug: 'rest', label: 'REST APIs' },
  { id: 38, slug: 'git', label: 'Git' },
  { id: 39, slug: 'linux', label: 'Linux' },
  { id: 40, slug: 'devops', label: 'DevOps' },
]

async function seedSkills() {
  console.log('🌱 Seeding skills...')
  
  try {
    // Insert skills with conflict handling
    for (const skill of SKILLS_DATA) {
      await db.insert(skills).values(skill).onConflictDoNothing()
    }
    
    console.log('✅ Skills seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding skills:', error)
  }
}

// Run the seed function
seedSkills().catch(console.error)