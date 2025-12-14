import { clerkMiddleware } from "@clerk/nextjs/server"

/*
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
*/

export default clerkMiddleware()

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
