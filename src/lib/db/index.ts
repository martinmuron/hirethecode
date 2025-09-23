import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// For build time, we don't need a real database connection
const databaseUrl = process.env.DATABASE_URL || 'postgresql://martin:thurk@localhost/hirethecode_dev'
const sql = postgres(databaseUrl)
export const db = drizzle(sql, { schema })
