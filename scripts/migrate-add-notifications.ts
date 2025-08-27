import { db } from '../src/lib/db'
import { sql } from 'drizzle-orm'

async function addNotificationsTable() {
  console.log('🔄 Adding notifications table...')
  
  try {
    // Create notifications table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('application_status', 'new_message', 'project_update', 'system')),
        is_read BOOLEAN NOT NULL DEFAULT false,
        data JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `)

    // Create index for faster queries
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    `)
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
    `)

    console.log('✅ Notifications table created successfully!')
    
  } catch (error) {
    console.error('❌ Error creating notifications table:', error)
    throw error
  }
}

// Run the migration
addNotificationsTable()
  .then(() => {
    console.log('🎉 Migration completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  })