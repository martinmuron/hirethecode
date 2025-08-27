import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('Invalid database URL'),
  
  // NextAuth
  NEXTAUTH_SECRET: z.string().min(1, 'NextAuth secret is required'),
  NEXTAUTH_URL: z.string().url('Invalid NextAuth URL'),
  
  // OAuth (optional)
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith('sk_', 'Invalid Stripe secret key'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_', 'Invalid Stripe publishable key'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_', 'Invalid Stripe webhook secret'),
  
  // Email
  RESEND_API_KEY: z.string().startsWith('re_', 'Invalid Resend API key'),
  
  // App
  NEXT_PUBLIC_APP_URL: z.string().url('Invalid app URL'),
  
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

type Env = z.infer<typeof envSchema>

// Validate environment variables
function validateEnv(): Env {
  try {
    const env = {
      DATABASE_URL: process.env.DATABASE_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
      GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NODE_ENV: process.env.NODE_ENV,
    }
    
    return envSchema.parse(env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`).join('\n')
      throw new Error(`Invalid environment configuration:\n${missingVars}`)
    }
    throw error
  }
}

// Export validated environment variables
export const env = validateEnv()

// Helper function to check if OAuth is configured
export const isOAuthConfigured = {
  github: !!(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
  google: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
}

// Helper function to get base URL
export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return env.NEXT_PUBLIC_APP_URL
}