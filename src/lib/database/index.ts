import type { IDatabaseProvider } from './interfaces/database.interface'
import { NeonDatabaseProvider } from './providers/neon.provider'

type DatabaseProvider = 'neon' | 'supabase' | 'convex' | 'prisma'

class DatabaseFactory {
  private static instance: IDatabaseProvider | null = null

  static getProvider(): IDatabaseProvider {
    if (!this.instance) {
      const provider = process.env.DATABASE_PROVIDER as DatabaseProvider || 'neon'
      
      switch (provider) {
        case 'neon':
          this.instance = new NeonDatabaseProvider()
          break
        case 'supabase':
          // this.instance = new SupabaseDatabaseProvider()
          throw new Error('Supabase provider not implemented yet')
        case 'convex':
          // this.instance = new ConvexDatabaseProvider()
          throw new Error('Convex provider not implemented yet')
        default:
          throw new Error(`Unknown database provider: ${provider}`)
      }
    }
    
    return this.instance
  }

  // For testing - reset instance
  static reset() {
    this.instance = null
  }
}

export const db = DatabaseFactory.getProvider()
export * from './interfaces/database.interface'
