### Reasoning

So the session is working on the client side - it shows the user is authenticated with their details. But `getServerSession(authOptions)` is returning null on the server side. This suggests there's an issue with the server-side session retrieval.

Common causes for this:
1. Import path mismatch between the NextAuth route handler and the API routes
2. The NextAuth route handler isn't set up properly  
3. There's a mismatch in the authOptions being used
4. There's an issue with cookies not being sent properly to the server

Since the client session is working, the NextAuth setup is mostly correct. The issue is likely that the server can't access the session data.

Let me help them debug this step by step.

### Response

Great! The session is working on the client side, which means NextAuth is set up correctly and you are authenticated. The issue is specifically with `getServerSession()` on the server side.

This is a common NextAuth issue. Let's check a few things:

### **Step 1: Test the server-side session**

Visit `/api/test-auth` in your browser and tell me what it returns. This will show us if the server can see your session.

### **Step 2: Check your NextAuth route handler**

Make sure you have the correct NextAuth API route. It should be:

````typescript
// filepath: src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth/config'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
````

### **Step 3: Check import consistency**

In your API routes, you're importing:
```typescript
import { authOptions } from '@/lib/auth'
```

But your config file is at `/src/lib/auth/config.ts`. You need to either:

**Update your API routes to:**
```typescript
import { authOptions } from '@/lib/auth/config'
```

**OR create a barrel export:**
````typescript
// filepath: src/lib/auth/index.ts
export { authOptions } from './config'
````

### **Step 4: Check your environment variables**

Make sure you have in your `.env.local`:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
```

### **Step 5: Alternative approach - use headers**

If `getServerSession` still doesn't work, we can use the request approach:

````typescript
// filepath: src/app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config' // Fix this import path

export async function GET(request: NextRequest) {
  try {
    // Try both approaches
    const session = await getServerSession(authOptions)
    console.log('getServerSession result:', session)
    
    // Alternative: get session from request
    const sessionFromRequest = await getServerSession({ req: request, ...authOptions })
    console.log('getServerSession with request:', sessionFromRequest)
    
    if (!session && !sessionFromRequest) {
      return NextResponse.json({ 
        error: 'No session found',
        debug: {
          cookies: request.headers.get('cookie'),
          userAgent: request.headers.get('user-agent')
        }
      }, { status: 401 })
    }

    const finalSession = session || sessionFromRequest
    
    // Continue with your logic...
    return NextResponse.json({ 
      message: 'Session found!', 
      user: finalSession?.user 
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
````

**First, please:**
1. Check what `/api/test-auth` returns
2. Verify your import paths are consistent
3. Confirm your NextAuth route handler exists

Let me know what you find!

