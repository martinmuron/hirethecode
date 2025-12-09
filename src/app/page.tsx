import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { CheckCircle, Users, Zap, Shield, Star, ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <Link className="mr-6 flex items-center space-x-2" href="/">
              <span className="font-semibold text-xl tracking-tight">Hire the Code</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center space-x-1 text-sm font-medium">
              <Link
                href="#features"
                className="px-4 py-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="px-4 py-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
              >
                Pricing
              </Link>
              <Link
                href="/sign-in"
                className="px-4 py-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
              >
                Sign In
              </Link>
              <Button asChild className="ml-2 rounded-full px-6">
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </nav>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"></div>
        <div className="container relative">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-6 rounded-full px-4 py-1.5 text-sm font-medium bg-white border border-gray-200 text-gray-700">
              Premium Developer Marketplace
            </Badge>
            <h1 className="text-5xl font-semibold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              Premium Talent for{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Every Project
              </span>
            </h1>
            <p className="mt-6 text-xl leading-8 text-gray-600 max-w-3xl mx-auto">
              The exclusive subscription marketplace connecting companies with vetted developers.
              Skip the endless interviews. Find top talent instantly.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button asChild size="lg" className="rounded-full text-base px-8 h-12">
                <Link href="/sign-up">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full text-base px-8 h-12 bg-white"
              >
                <Link href="#pricing">View Pricing</Link>
              </Button>
            </div>
            <div className="mt-16 flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Vetted developers only</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Smart project matching</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
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
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
              Why Choose Hire the Code?
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              The premium way to connect talent with opportunity
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-7xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">Vetted Talent Pool</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    Every developer is thoroughly screened for technical skills, communication,
                    and professionalism. No more sifting through unqualified candidates.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-2xl bg-yellow-100 flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-yellow-600" />
                  </div>
                  <CardTitle className="text-xl">Smart Matching</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    Our AI-powered system matches projects with developers based on skills,
                    experience, timezone, and availability. Perfect fits every time.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">Subscription Model</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
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
      <section className="py-24 sm:py-32 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24 items-center">
            <div>
              <Badge className="mb-4 rounded-full bg-blue-100 text-blue-700 border-0">
                For Developers
              </Badge>
              <h2 className="text-3xl font-semibold tracking-tight text-gray-900">
                Discover Your Next Opportunity
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                Join an exclusive network of premium developers and get matched with
                high-quality projects.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  {
                    title: 'Curated Opportunities',
                    desc: 'Receive targeted project matches based on your skills',
                  },
                  {
                    title: 'Premium Rates',
                    desc: 'Companies pay premium rates for vetted talent',
                  },
                  {
                    title: 'Quality Projects',
                    desc: 'Work with serious companies on meaningful projects',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <p className="text-gray-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Button asChild size="lg" className="rounded-full">
                  <Link href="/sign-up">Join as Developer - $99/month</Link>
                </Button>
              </div>
            </div>
            <div className="lg:order-first">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 p-8 text-white shadow-2xl">
                <h3 className="text-2xl font-semibold mb-6">Developer Profile</h3>
                <div className="space-y-4">
                  <div className="bg-white/20 backdrop-blur rounded-2xl p-4">
                    <div className="font-medium text-lg">Sarah Chen</div>
                    <div className="text-white/80">Full-Stack Developer</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur rounded-2xl p-4">
                    <div className="text-sm text-white/80 mb-2">Skills</div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-white/30 rounded-full text-sm">React</span>
                      <span className="px-3 py-1 bg-white/30 rounded-full text-sm">Node.js</span>
                      <span className="px-3 py-1 bg-white/30 rounded-full text-sm">Python</span>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur rounded-2xl p-4">
                    <div className="flex justify-between">
                      <span className="text-white/80">Rate</span>
                      <span className="font-medium">$150/hr</span>
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
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24 items-center">
            <div>
              <Badge className="mb-4 rounded-full bg-green-100 text-green-700 border-0">
                For Companies
              </Badge>
              <h2 className="text-3xl font-semibold tracking-tight text-gray-900">
                Find Your Perfect Developer
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                Access a curated pool of vetted developers and find the perfect match for
                your projects.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  {
                    title: 'Pre-vetted Talent',
                    desc: 'Every developer has been thoroughly screened',
                  },
                  {
                    title: 'Smart Matching',
                    desc: 'AI-powered matching for exact skill requirements',
                  },
                  {
                    title: 'No Per-Hire Fees',
                    desc: 'One subscription, unlimited hiring',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <p className="text-gray-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Button asChild size="lg" className="rounded-full">
                  <Link href="/sign-up">Join as Company - $499/month</Link>
                </Button>
              </div>
            </div>
            <div>
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-green-500 to-teal-600 p-8 text-white shadow-2xl">
                <h3 className="text-2xl font-semibold mb-6">Company Dashboard</h3>
                <div className="space-y-4">
                  <div className="bg-white/20 backdrop-blur rounded-2xl p-4">
                    <div className="font-medium text-lg">TechCorp Inc.</div>
                    <div className="text-white/80">5 Active Projects</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur rounded-2xl p-4">
                    <div className="text-sm text-white/80 mb-2">Recent Matches</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>React Developer</span>
                        <span className="text-white/80">3 candidates</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Backend Engineer</span>
                        <span className="text-white/80">5 candidates</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur rounded-2xl p-4">
                    <div className="flex justify-between">
                      <span className="text-white/80">Applications</span>
                      <span className="font-medium">12 pending</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 sm:py-32 bg-white">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Choose the plan that&apos;s right for you. No hidden fees.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 lg:grid-cols-2">
            <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-xl">Developers</CardTitle>
                  <Badge variant="secondary" className="rounded-full">
                    Popular
                  </Badge>
                </div>
                <div className="mt-4">
                  <span className="text-5xl font-semibold text-gray-900">$99</span>
                  <span className="text-gray-500">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  'Access to exclusive project board',
                  'Smart project matching',
                  'Direct messaging with companies',
                  'Rich developer profile',
                  'Email notifications',
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </div>
                ))}
                <Button asChild className="w-full mt-6 rounded-full h-12">
                  <Link href="/sign-up">Get Started</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white border-2 border-blue-500 shadow-lg relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white rounded-full px-4">Best Value</Badge>
              </div>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Companies</CardTitle>
                <div className="mt-4">
                  <span className="text-5xl font-semibold text-gray-900">$499</span>
                  <span className="text-gray-500">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  'Unlimited project postings',
                  'Advanced developer search',
                  'Smart matching algorithm',
                  'Direct messaging',
                  'Company profile & branding',
                  'Priority support',
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </div>
                ))}
                <Button asChild className="w-full mt-6 rounded-full h-12">
                  <Link href="/sign-up">Get Started</Link>
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
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
              What Our Users Say
            </h2>
          </div>
          <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-3">
            {[
              {
                quote:
                  'Found my dream developer role within a week. The quality of projects and companies here is unmatched.',
                name: 'Sarah K.',
                role: 'React Developer',
              },
              {
                quote:
                  'We hired 3 amazing developers in our first month. The vetting process really shows - top quality talent only.',
                name: 'Mark T.',
                role: 'CTO, TechStart',
              },
              {
                quote:
                  "The smart matching is incredible. Every project I get matched with is exactly what I'm looking for.",
                name: 'Alex M.',
                role: 'Full-Stack Developer',
              },
            ].map((testimonial) => (
              <Card
                key={testimonial.name}
                className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">&quot;{testimonial.quote}&quot;</p>
                  <div className="font-medium text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-12">
        <div className="container">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <h3 className="font-semibold text-lg mb-4 text-gray-900">Hire the Code</h3>
              <p className="text-gray-500 text-sm">
                Premium talent for every project. Connect with vetted developers and quality
                companies.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4 text-gray-900">For Developers</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <Link href="/projects" className="text-gray-500 hover:text-gray-900">
                    Browse Projects
                  </Link>
                </div>
                <div>
                  <Link href="#pricing" className="text-gray-500 hover:text-gray-900">
                    Pricing
                  </Link>
                </div>
                <div>
                  <Link href="/sign-up" className="text-gray-500 hover:text-gray-900">
                    Join Now
                  </Link>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-4 text-gray-900">For Companies</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <Link href="/developers" className="text-gray-500 hover:text-gray-900">
                    Find Developers
                  </Link>
                </div>
                <div>
                  <Link href="#pricing" className="text-gray-500 hover:text-gray-900">
                    Pricing
                  </Link>
                </div>
                <div>
                  <Link href="/sign-up" className="text-gray-500 hover:text-gray-900">
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-4 text-gray-900">Support</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <Link href="/help" className="text-gray-500 hover:text-gray-900">
                    Help Center
                  </Link>
                </div>
                <div>
                  <Link href="/contact" className="text-gray-500 hover:text-gray-900">
                    Contact
                  </Link>
                </div>
                <div>
                  <Link href="/privacy" className="text-gray-500 hover:text-gray-900">
                    Privacy
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-100 text-center text-sm text-gray-500">
            <p>&copy; 2024 Hire the Code. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
