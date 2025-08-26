import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { CheckCircle, Users, Zap, Shield, Star, ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link className="mr-6 flex items-center space-x-2" href="/">
              <span className="font-bold text-xl">Hire the Code</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="#features" className="transition-colors hover:text-foreground/80">Features</Link>
              <Link href="#pricing" className="transition-colors hover:text-foreground/80">Pricing</Link>
              <Link href="/auth/sign-in" className="transition-colors hover:text-foreground/80">Sign In</Link>
            </nav>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-10"></div>
        <div className="container relative">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-4" variant="secondary">
              🚀 Premium Developer Marketplace
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Premium Talent for{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Every Project
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-3xl mx-auto">
              The exclusive subscription marketplace connecting companies with vetted developers. 
              Skip the endless interviews. Find top talent instantly or discover your next opportunity.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild size="lg" className="text-lg px-8 py-3">
                <Link href="/auth/sign-up">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3">
                <Link href="#pricing">View Pricing</Link>
              </Button>
            </div>
            <div className="mt-16 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Vetted developers only</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Smart project matching</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Subscription model</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 sm:py-32">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Why Choose Hire the Code?</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              The premium way to connect talent with opportunity
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-7xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <Users className="h-8 w-8 text-blue-600" />
                  <CardTitle>Vetted Talent Pool</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Every developer is thoroughly screened for technical skills, communication, 
                    and professionalism. No more sifting through unqualified candidates.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <Zap className="h-8 w-8 text-yellow-600" />
                  <CardTitle>Smart Matching</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our AI-powered system matches projects with developers based on skills, 
                    experience, timezone, and availability. Perfect fits every time.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="h-8 w-8 text-green-600" />
                  <CardTitle>Subscription Model</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    No per-hire fees or commission. One subscription gives you unlimited 
                    access to premium talent and project opportunities.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* For Developers Section */}
      <section className="py-24 sm:py-32 bg-muted/50">
        <div className="container">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">For Developers</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Join an exclusive network of premium developers and get matched with high-quality projects.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Curated Opportunities</h3>
                    <p className="text-muted-foreground">Receive targeted project matches based on your skills and preferences</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Premium Rates</h3>
                    <p className="text-muted-foreground">Companies pay premium rates for vetted talent - earn what you&apos;re worth</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Quality Projects</h3>
                    <p className="text-muted-foreground">Work with serious companies on meaningful projects, not one-off gigs</p>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Button asChild size="lg">
                  <Link href="/auth/sign-up?role=developer">
                    Join as Developer - $99/month
                  </Link>
                </Button>
              </div>
            </div>
            <div className="lg:order-first">
              <div className="relative">
                <div className="aspect-square rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
                  <h3 className="text-2xl font-bold mb-4">Developer Profile</h3>
                  <div className="space-y-3">
                    <div className="bg-white/20 rounded p-3">
                      <div className="font-semibold">Sarah Chen</div>
                      <div className="text-sm opacity-90">Full-Stack Developer</div>
                    </div>
                    <div className="bg-white/20 rounded p-3">
                      <div className="text-sm mb-2">Skills</div>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary">React</Badge>
                        <Badge variant="secondary">Node.js</Badge>
                        <Badge variant="secondary">Python</Badge>
                      </div>
                    </div>
                    <div className="bg-white/20 rounded p-3">
                      <div className="text-sm">Rate: $150/hour</div>
                      <div className="text-sm">Available: Yes</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Companies Section */}
      <section className="py-24 sm:py-32">
        <div className="container">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">For Companies</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Access a curated pool of vetted developers and find the perfect match for your projects.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Pre-vetted Talent</h3>
                    <p className="text-muted-foreground">Every developer has been thoroughly screened for skills and professionalism</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Smart Matching</h3>
                    <p className="text-muted-foreground">AI-powered matching ensures you find developers with the exact skills you need</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">No Per-Hire Fees</h3>
                    <p className="text-muted-foreground">One subscription, unlimited hiring. No hidden fees or commission charges</p>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Button asChild size="lg">
                  <Link href="/auth/sign-up?role=company">
                    Join as Company - $499/month
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-lg bg-gradient-to-r from-green-500 to-blue-600 p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Company Dashboard</h3>
                <div className="space-y-3">
                  <div className="bg-white/20 rounded p-3">
                    <div className="font-semibold">TechCorp Inc.</div>
                    <div className="text-sm opacity-90">5 Active Projects</div>
                  </div>
                  <div className="bg-white/20 rounded p-3">
                    <div className="text-sm mb-2">Recent Matches</div>
                    <div className="space-y-1 text-sm">
                      <div>• React Developer (3 candidates)</div>
                      <div>• Backend Engineer (5 candidates)</div>
                    </div>
                  </div>
                  <div className="bg-white/20 rounded p-3">
                    <div className="text-sm">Next project in 2 days</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 sm:py-32 bg-muted/50">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple, Transparent Pricing</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Choose the plan that&apos;s right for you. No hidden fees, no per-hire charges.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 lg:grid-cols-2">
            <Card className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Developers</CardTitle>
                  <Badge>Popular</Badge>
                </div>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Access to exclusive project board</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Smart project matching</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Direct messaging with companies</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Rich developer profile</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Email notifications</span>
                </div>
                <Button asChild className="w-full mt-6">
                  <Link href="/auth/sign-up?role=developer">Get Started</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="relative border-2 border-primary">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary">Best Value</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Companies</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$499</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Unlimited project postings</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Advanced developer search</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Smart matching algorithm</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Direct messaging</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Company profile & branding</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Priority support</span>
                </div>
                <Button asChild className="w-full mt-6">
                  <Link href="/auth/sign-up?role=company">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 sm:py-32">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">What Our Users Say</h2>
          </div>
          <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  &quot;Found my dream developer role within a week. The quality of projects and companies here is unmatched.&quot;
                </p>
                <div className="font-semibold">Sarah K.</div>
                <div className="text-sm text-muted-foreground">React Developer</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  &quot;We hired 3 amazing developers in our first month. The vetting process really shows - top quality talent only.&quot;
                </p>
                <div className="font-semibold">Mark T.</div>
                <div className="text-sm text-muted-foreground">CTO, TechStart</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  &quot;The smart matching is incredible. Every project I get matched with is exactly what I&apos;m looking for.&quot;
                </p>
                <div className="font-semibold">Alex M.</div>
                <div className="text-sm text-muted-foreground">Full-Stack Developer</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <h3 className="font-bold text-lg mb-4">Hire the Code</h3>
              <p className="text-muted-foreground text-sm">
                Premium talent for every project. Connect with vetted developers and quality companies.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Developers</h4>
              <div className="space-y-2 text-sm">
                <div><Link href="/developers" className="text-muted-foreground hover:text-foreground">Browse Projects</Link></div>
                <div><Link href="/pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link></div>
                <div><Link href="/auth/sign-up?role=developer" className="text-muted-foreground hover:text-foreground">Join Now</Link></div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Companies</h4>
              <div className="space-y-2 text-sm">
                <div><Link href="/companies" className="text-muted-foreground hover:text-foreground">Find Developers</Link></div>
                <div><Link href="/pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link></div>
                <div><Link href="/auth/sign-up?role=company" className="text-muted-foreground hover:text-foreground">Get Started</Link></div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-sm">
                <div><Link href="/help" className="text-muted-foreground hover:text-foreground">Help Center</Link></div>
                <div><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></div>
                <div><Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy</Link></div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Hire the Code. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}