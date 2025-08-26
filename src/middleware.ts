import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Middleware logic can be added here if needed
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth pages without token
        if (req.nextUrl.pathname.startsWith('/auth')) {
          return true
        }
        
        // Require token for protected routes
        if (req.nextUrl.pathname.startsWith('/dashboard') ||
            req.nextUrl.pathname.startsWith('/profile') ||
            req.nextUrl.pathname.startsWith('/projects') ||
            req.nextUrl.pathname.startsWith('/developers')) {
          return !!token
        }
        
        // Allow access to public routes
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}