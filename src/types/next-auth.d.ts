import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role?: 'developer' | 'company' | 'admin'
      displayName?: string | null
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    image?: string | null
    role?: 'developer' | 'company' | 'admin'
    displayName?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role?: 'developer' | 'company' | 'admin'
    displayName?: string | null
  }
}