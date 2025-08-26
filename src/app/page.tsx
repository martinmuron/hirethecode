export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Hire the Code
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Premium Talent for Every Project
          </p>
          <p className="mt-4 text-base text-muted-foreground max-w-2xl mx-auto">
            Subscription-only marketplace where companies find vetted developers fast, 
            and developers receive targeted project leads.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/auth/sign-in"
              className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Get started
            </a>
            <a href="/pricing" className="text-sm font-semibold leading-6">
              View pricing <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}