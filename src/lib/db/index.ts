import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres';
// import * as schema from './schema'

let schema: any;
try {
  schema = require('./schema'); // or your schema path
  console.log('Schema imported successfully:', Object.keys(schema));
} catch (error) {
  console.error('Schema import error:', error);
  schema = {};
}
//
// Create postgres-js client with connection pooling
const sql = postgres(process.env.DATABASE_URL!, {
  // Connection pool settings
  max: 20,                    // Maximum number of connections
  idle_timeout: 10,           // Close idle connections after 10 seconds
  connect_timeout: 60,        // Connection timeout in seconds
  prepare: false,             // Disable prepared statements for better compatibility
});
export const db = drizzle(sql, { schema })

export function getDb() {
  return db;
}

export async function closeDb() {
  await sql.end();
}
