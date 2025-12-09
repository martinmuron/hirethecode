import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Code2, Building2, Sparkles, Check } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fbfbfd]">
      {/* Navigation - Apple style sticky nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#fbfbfd]/80 backdrop-blur-xl border-b border-black/5">
        <div className="max-w-[980px] mx-auto px-6">
          <div className="flex h-12 items-center justify-between">
            <Link href="/" className="text-xl font-semibold text-[#1d1d1f]">
              hirethecode
            </Link>
            <div className="hidden md:flex items-center gap-8 text-sm">
              <Link href="#developers" className="text-[#1d1d1f]/80 hover:text-[#1d1d1f] transition-colors">
                Developers
              </Link>
              <Link href="#companies" className="text-[#1d1d1f]/80 hover:text-[#1d1d1f] transition-colors">
                Companies
              </Link>
              <Link href="#pricing" className="text-[#1d1d1f]/80 hover:text-[#1d1d1f] transition-colors">
                Pricing
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/sign-in" className="text-sm text-[#1d1d1f]/80 hover:text-[#1d1d1f] transition-colors">
                Sign in
              </Link>
              <Button asChild size="sm" className="rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white px-4 h-8 text-sm">
                <Link href="/sign-up">Get started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Large dramatic Apple style */}
      <section className="pt-32 pb-20 md:pt-44 md:pb-32">
        <div className="max-w-[980px] mx-auto px-6 text-center">
          <h1 className="text-[#1d1d1f] text-5xl md:text-7xl lg:text-[80px] font-semibold tracking-tight leading-[1.05]">
            Premium talent.
            <br />
            <span className="bg-gradient-to-r from-[#2997ff] via-[#5856d6] to-[#af52de] bg-clip-text text-transparent">
              Instant access.
            </span>
          </h1>
          <p className="mt-6 text-[#86868b] text-xl md:text-2xl max-w-[600px] mx-auto leading-relaxed">
            The subscription marketplace connecting vetted developers with companies that value quality.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white px-8 h-14 text-lg min-w-[200px]">
              <Link href="/sign-up">
                Get started free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full border-[#1d1d1f]/20 text-[#0071e3] hover:bg-[#0071e3]/5 px-8 h-14 text-lg min-w-[200px]">
              <Link href="#pricing">View pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-16 bg-white border-y border-black/5">
        <div className="max-w-[980px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '2,500+', label: 'Vetted developers' },
              { value: '500+', label: 'Companies hiring' },
              { value: '98%', label: 'Match success rate' },
              { value: '< 48h', label: 'Average time to hire' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl md:text-5xl font-semibold text-[#1d1d1f]">{stat.value}</div>
                <div className="mt-2 text-sm text-[#86868b]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Developers Section */}
      <section id="developers" className="py-24 md:py-32">
        <div className="max-w-[980px] mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-sm font-medium mb-6">
              <Code2 className="h-4 w-4" />
              For Developers
            </div>
            <h2 className="text-4xl md:text-5xl font-semibold text-[#1d1d1f] tracking-tight">
              Your skills deserve
              <br />
              premium opportunities.
            </h2>
            <p className="mt-6 text-xl text-[#86868b] max-w-[600px] mx-auto">
              Stop competing on price. Join a curated marketplace where quality matters.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Curated projects',
                description: 'Every company is vetted. Every project is real. No more wasted proposals.',
                icon: '✦',
              },
              {
                title: 'Fair rates',
                description: 'Companies here understand value. Set your rate and stick to it.',
                icon: '◆',
              },
              {
                title: 'Smart matching',
                description: 'Our AI matches you with projects that fit your skills and preferences.',
                icon: '●',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group p-8 rounded-3xl bg-white border border-black/5 hover:border-black/10 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">{feature.title}</h3>
                <p className="text-[#86868b] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Companies Section */}
      <section id="companies" className="py-24 md:py-32 bg-[#1d1d1f]">
        <div className="max-w-[980px] mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium mb-6">
              <Building2 className="h-4 w-4" />
              For Companies
            </div>
            <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight">
              Hire with confidence.
              <br />
              Scale with ease.
            </h2>
            <p className="mt-6 text-xl text-white/60 max-w-[600px] mx-auto">
              Skip the endless interviews. Access pre-vetted talent ready to build.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Pre-vetted talent',
                description: 'Every developer passes technical screening and soft skills assessment.',
                icon: '◇',
              },
              {
                title: 'No per-hire fees',
                description: 'One subscription. Unlimited hiring. No commission on contracts.',
                icon: '▢',
              },
              {
                title: 'Instant results',
                description: 'Post a project and receive qualified matches within hours.',
                icon: '△',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <div className="text-3xl mb-4 text-white/80">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/60 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 md:py-32">
        <div className="max-w-[980px] mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#af52de]/10 text-[#af52de] text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Simple Pricing
            </div>
            <h2 className="text-4xl md:text-5xl font-semibold text-[#1d1d1f] tracking-tight">
              One price. Full access.
            </h2>
            <p className="mt-6 text-xl text-[#86868b] max-w-[600px] mx-auto">
              No hidden fees. No commission. Just premium access to the marketplace.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-[800px] mx-auto">
            {/* Developer Plan */}
            <div className="relative p-8 rounded-3xl bg-white border border-black/10 hover:shadow-xl transition-shadow duration-300">
              <div className="mb-8">
                <div className="text-sm font-medium text-[#86868b] mb-2">For Developers</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-semibold text-[#1d1d1f]">$99</span>
                  <span className="text-[#86868b]">/month</span>
                </div>
              </div>
              <div className="space-y-4 mb-8">
                {[
                  'Access premium project board',
                  'AI-powered project matching',
                  'Direct messaging with companies',
                  'Professional developer profile',
                  'Priority in search results',
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#34c759]/10 flex items-center justify-center">
                      <Check className="h-3 w-3 text-[#34c759]" />
                    </div>
                    <span className="text-[#1d1d1f]">{feature}</span>
                  </div>
                ))}
              </div>
              <Button asChild className="w-full rounded-full bg-[#1d1d1f] hover:bg-[#1d1d1f]/90 text-white h-12 text-base">
                <Link href="/sign-up">Start as Developer</Link>
              </Button>
            </div>

            {/* Company Plan */}
            <div className="relative p-8 rounded-3xl bg-gradient-to-b from-[#1d1d1f] to-[#2d2d2f] border border-white/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="px-3 py-1 rounded-full bg-[#0071e3] text-white text-xs font-medium">
                  Most Popular
                </div>
              </div>
              <div className="mb-8">
                <div className="text-sm font-medium text-white/60 mb-2">For Companies</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-semibold text-white">$499</span>
                  <span className="text-white/60">/month</span>
                </div>
              </div>
              <div className="space-y-4 mb-8">
                {[
                  'Unlimited project postings',
                  'Advanced developer search',
                  'AI-powered candidate matching',
                  'Direct messaging & hiring',
                  'Company profile & branding',
                  'Priority support',
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#0071e3]/20 flex items-center justify-center">
                      <Check className="h-3 w-3 text-[#0071e3]" />
                    </div>
                    <span className="text-white">{feature}</span>
                  </div>
                ))}
              </div>
              <Button asChild className="w-full rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white h-12 text-base">
                <Link href="/sign-up">Start as Company</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-[#fbfbfd] to-white">
        <div className="max-w-[980px] mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-semibold text-[#1d1d1f] tracking-tight mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-[#86868b] mb-10 max-w-[500px] mx-auto">
            Join thousands of developers and companies building the future together.
          </p>
          <Button asChild size="lg" className="rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white px-10 h-14 text-lg">
            <Link href="/sign-up">
              Create free account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-black/5">
        <div className="max-w-[980px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-sm text-[#86868b]">
              © 2024 hirethecode. All rights reserved.
            </div>
            <div className="flex items-center gap-8 text-sm text-[#86868b]">
              <Link href="/privacy" className="hover:text-[#1d1d1f] transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-[#1d1d1f] transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-[#1d1d1f] transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
