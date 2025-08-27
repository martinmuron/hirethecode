import { db } from '../src/lib/db'
import { users, profiles } from '../src/lib/db/schema'
import { eq } from 'drizzle-orm'

const TEST_EMAILS = [
  "mark.muron@gmail.com",
  "martinmuron27@gmail.com"
]

async function verifyTestAccounts() {
  console.log('🔍 Verifying test accounts...\n')
  
  for (const email of TEST_EMAILS) {
    try {
      const user = await db.select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1)

      if (user.length === 0) {
        console.log(`❌ User not found: ${email}`)
        continue
      }

      const profile = await db.select()
        .from(profiles)
        .where(eq(profiles.id, user[0].id))
        .limit(1)

      if (profile.length === 0) {
        console.log(`⚠️  User exists but no profile: ${email}`)
      } else {
        console.log(`✅ ${email}`)
        console.log(`   Name: ${user[0].name}`)
        console.log(`   Role: ${profile[0].role}`)
        console.log(`   Display Name: ${profile[0].displayName}`)
        console.log(`   Created: ${user[0].createdAt}`)
        console.log()
      }
    } catch (error) {
      console.error(`❌ Error verifying ${email}:`, error)
    }
  }
}

verifyTestAccounts().catch(console.error)