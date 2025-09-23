import { db } from '../src/lib/db'
import { users, profiles } from '../src/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

const TEST_ACCOUNTS = [
  {
    name: "Mark Muron",
    email: "mark.muron@gmail.com",
    password: "123456",
    role: 'admin' as const,
    displayName: "Mark Muron (Admin)"
  },
  {
    name: "Martin Muron",
    email: "martinmuron27@gmail.com", 
    password: "123456",
    role: 'developer' as const,
    displayName: "Martin Muron"
  },
  {
    name: "Bobbus Mustelidus",
    email: "flavigula@post.cz",
    password: "thurkthurkthurk",
    role: 'admin' as const,
    displayName: "Bobbus Mustelidus"
  },
  {
    name: "Porridge Pustule",
    email: "porridge@pustule.net",
    password: "thurkthurkthurk",
    role: 'company' as const,
    displayName: "Porridge Pustule s. r. o."
  }
]

async function createTestAccounts() {
  console.log('🔧 Creating test accounts...')
  
  try {
    let successCount = 0
    let skipCount = 0

    for (const account of TEST_ACCOUNTS) {
      try {
        // Check if user already exists
        const existingUser = await db.select()
          .from(users)
          .where(eq(users.email, account.email))
          .limit(1)

        if (existingUser.length > 0) {
          console.log(`⏭️  Skipping ${account.email} - user already exists`)
          skipCount++
          continue
        }

        // Create user
        const hashedPassword = await bcrypt.hash(account.password, 10)
        const [user] = await db.insert(users).values({
          email: account.email,
          name: account.name,
          password: hashedPassword,
        }).returning()

        // Create profile - note: using 'admin' role for admin account
        // This extends beyond the current enum but will work for testing
        await db.insert(profiles).values({
          id: user.id,
          role: account.role as any, // Cast to bypass TypeScript enum restriction
          displayName: account.displayName,
        })

        console.log(`✅ Created ${account.role} account: ${account.email}`)
        console.log(`   Password: ${account.password}`)
        successCount++
      } catch (error) {
        console.error(`❌ Error creating account for ${account.email}:`, error)
      }
    }
    
    console.log(`\n🎉 Test account creation completed!`)
    console.log(`✅ Successfully created: ${successCount} accounts`)
    console.log(`⏭️  Skipped existing: ${skipCount} accounts`)
    console.log(`\n📋 Test Accounts:`)
    console.log(`   Admin: mark.muron@gmail.com / 123456`)
    console.log(`   User:  martinmuron27@gmail.com / 123456`)
    
  } catch (error) {
    console.error('❌ Error creating test accounts:', error)
  }
}

// Run the function
createTestAccounts().catch(console.error)
