import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

export default clerkMiddleware({
  publicRoutes: [
    "/", 
    "/auth/sign-in", 
    "/auth/sign-up",
    "/developers", 
    "/developers/(.*)",
    "/projects", 
    "/projects/(.*)",
    "/api/webhooks/clerk",
  ],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
