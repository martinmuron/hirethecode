import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

// For build time, we don't need a real database connection
const databaseUrl = process.env.DATABASE_URL || 'postgresql://martin:thurk@localhost/hirethecode'
const sql = neon(databaseUrl)
export const db = drizzle(sql, { schema })
