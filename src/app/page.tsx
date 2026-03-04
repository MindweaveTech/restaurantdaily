'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, DollarSign, TrendingUp, Users, BarChart3, Clock, Smartphone, Check } from 'lucide-react'

export default function LandingPage() {
  const [showScrollHint, setShowScrollHint] = useState(false)
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())

  useEffect(() => {
    const timer = setTimeout(() => setShowScrollHint(true), 10000)
    return () => clearTimeout(timer)
  }, [])

  // Smooth intersection observer with requestAnimationFrame
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Use requestAnimationFrame for smoother state updates
            requestAnimationFrame(() => {
              setVisibleSections((prev) => new Set(prev).add(entry.target.id))
            })
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -100px 0px' }
    )

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const sections = document.querySelectorAll('[data-animate]')
      sections.forEach((section) => observer.observe(section))
    }, 100)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [])

  // Reusable animation classes
  const fadeUp = (isVisible: boolean) => `
    transform transition-all duration-700 will-change-[transform,opacity]
    ${isVisible
      ? 'opacity-100 translate-y-0'
      : 'opacity-0 translate-y-6'
    }
  `.trim()

  const getDelayStyle = (delay: number) => ({
    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    transitionDelay: `${delay}ms`
  })

  return (
    <div className="bg-[#050510] min-h-screen antialiased relative">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="gradient-orb orb-1" />
        <div className="gradient-orb orb-2" />
        <div className="gradient-orb orb-3" />
        <div className="gradient-orb orb-4" />
        <div className="gradient-orb orb-5" />
        <div className="noise-overlay" />
        <div className="grid-overlay" />
      </div>

      {/* Login Section - Full Viewport */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 relative">
        <div className="w-full max-w-md">
          <div className="text-center mb-4 sm:mb-5">
            <div className="flex justify-center mb-2 sm:mb-3">
              <Image src="/logo.svg" alt="Restaurant Daily" width={40} height={40} className="sm:w-12 sm:h-12" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Restaurant Daily</h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">Simplify your restaurant operations</p>
          </div>

          <div className="glass-card bg-[#050510]/60 border-[#F97316]/20 backdrop-blur-2xl shadow-2xl shadow-orange-500/10 mx-1 sm:mx-0 overflow-hidden p-6 sm:p-8 rounded-2xl">
            {/* Glassmorphism inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-amber-500/5 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/[0.02] to-white/[0.05] pointer-events-none" />

            <div className="relative z-10 text-center">
              <h2 className="text-white text-xl font-semibold mb-2">Welcome back</h2>
              <p className="text-gray-400 mb-6">Sign in with your phone number</p>

              {/* Phone number hint */}
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center gap-3 text-gray-400">
                  <Smartphone className="w-5 h-5 text-orange-400" />
                  <span className="text-sm">SMS OTP login • No passwords</span>
                </div>
              </div>

              {/* Sign In Button */}
              <Link
                href="/auth/phone"
                className="w-full h-11 bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white hover:from-[#FB923C] hover:to-[#F97316] active:scale-[0.98] transition-all duration-300 shadow-lg shadow-orange-500/25 border-0 group inline-flex items-center justify-center rounded-lg font-medium"
              >
                Sign in with Phone
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>

              <p className="text-sm text-gray-500 mt-4">
                New to Restaurant Daily?{' '}
                <Link href="/auth/phone" className="text-[#FB923C] hover:text-[#FDBA74] transition-colors duration-200 font-medium hover:underline underline-offset-4">
                  Get started free
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Scroll indicator - Apple-style subtle, appears after 10s */}
        <div
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-opacity duration-1000 ${showScrollHint ? 'opacity-100' : 'opacity-0'}`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <div className="w-6 h-10 rounded-full border border-white/20 flex items-start justify-center p-2">
            <div className="w-1 h-2 rounded-full bg-white/40 animate-scroll-hint" />
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section id="hero" data-animate className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-16 sm:py-20 relative overflow-hidden">
        {/* Aurora effect */}
        <div className="aurora absolute inset-0 opacity-30" />

        <div
          className={`max-w-4xl mx-auto text-center relative z-10 ${fadeUp(visibleSections.has('hero'))}`}
          style={getDelayStyle(0)}
        >
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tight text-white mb-4 sm:mb-6 leading-[1.1] sm:leading-[1.08]">
            Know your numbers.<br />
            <span className="text-gray-500">Every single day.</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
            Real-time cash tracking for every shift in your restaurant.
            No spreadsheets. No guesswork. Just clarity.
          </p>
          <Link
            href="/auth/phone"
            className="bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white hover:from-[#FB923C] hover:to-[#F97316] active:scale-[0.98] text-sm sm:text-base px-6 sm:px-8 py-5 sm:py-6 h-auto transition-all duration-200 shadow-lg shadow-[#F97316]/30 border-0 inline-flex items-center rounded-xl font-medium"
          >
            Start tracking today <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        {/* Floating Dashboard Preview */}
        <div
          className={`mt-12 sm:mt-20 w-full max-w-5xl mx-auto px-2 sm:px-4 ${fadeUp(visibleSections.has('hero'))}`}
          style={getDelayStyle(150)}
        >
          <div className="relative md:animate-subtle-float">
            {/* Glow effect - matched to logo colors */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#EA580C]/30 via-[#F97316]/25 to-[#FB923C]/20 blur-[60px] sm:blur-[80px] -z-10 translate-y-8 sm:translate-y-12 scale-90 glow-effect" />

            {/* Dashboard mockup */}
            <div className="bg-[#050510]/90 backdrop-blur-xl border border-[#F97316]/15 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl shadow-[#F97316]/5">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FF5F57]" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FDBC2C]" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#28C840]" />
                <span className="ml-2 sm:ml-4 text-gray-500 text-xs sm:text-sm font-medium truncate">Daily Operations — Today</span>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                {[
                  { value: '₹1.2L', label: 'Cash Sales', color: 'text-emerald-400' },
                  { value: '₹85K', label: 'UPI/Card', color: 'text-orange-400' },
                  { value: '₹2.8K', label: 'Expenses', color: 'text-amber-400' },
                  { value: '₹0', label: 'Variance', color: 'text-white' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/[0.03] rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/[0.04]">
                    <div className={`text-xl sm:text-3xl font-mono font-semibold ${stat.color} tabular-nums`}>{stat.value}</div>
                    <div className="text-gray-500 text-xs sm:text-sm mt-0.5 sm:mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Recent activity - hidden on very small screens, show 2 on mobile, 3 on larger */}
              <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {[
                  { name: 'Evening Shift', amount: '₹45,200', status: 'closed', time: '10:30 PM' },
                  { name: 'Afternoon Shift', amount: '₹38,500', status: 'closed', time: '5:45 PM' },
                  { name: 'Morning Shift', amount: '₹28,300', status: 'closed', time: '2:15 PM' },
                ].map((session, i) => (
                  <div key={i} className={`bg-white/[0.02] rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/[0.04] ${i === 2 ? 'hidden lg:block' : ''}`}>
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#F97316] to-[#FB923C] flex items-center justify-center text-white text-xs sm:text-sm font-medium shadow-lg shadow-[#F97316]/30">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <div className="text-xl sm:text-2xl font-mono font-semibold tabular-nums text-emerald-400">
                        {session.amount}
                      </div>
                    </div>
                    <div className="text-white font-medium text-sm sm:text-base">{session.name}</div>
                    <div className="text-gray-500 text-xs sm:text-sm">Closed at {session.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section id="pain" data-animate className="py-20 sm:py-32 px-4 sm:px-6 relative">
        <div className="max-w-5xl mx-auto">
          <p
            className={`text-gray-500 text-center mb-10 sm:mb-16 text-base sm:text-lg ${fadeUp(visibleSections.has('pain'))}`}
            style={getDelayStyle(0)}
          >
            Sound familiar?
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              { emoji: '📊', title: 'End of day chaos.', subtitle: 'Where did the cash go?', desc: "You're counting cash at midnight, trying to match POS reports. Receipts are missing. Numbers don't add up." },
              { emoji: '📝', title: 'Petty cash mess.', subtitle: 'No paper trail.', desc: "Vegetables from the market. Delivery tips. Gas refills. Small expenses that add up but never get tracked." },
              { emoji: '😰', title: 'Variance discovered.', subtitle: 'After the damage is done.', desc: "By the time you find the shortfall, it's too late. The shift ended. The staff went home. Money is gone." },
            ].map((card, i) => (
              <div
                key={i}
                className={`text-center p-6 sm:p-8 rounded-xl sm:rounded-2xl bg-[#050510]/60 border border-[#F97316]/10 hover:bg-[#0a0a1a]/80 hover:border-[#F97316]/20 transition-all duration-300 backdrop-blur-sm ${fadeUp(visibleSections.has('pain'))}`}
                style={getDelayStyle(80 * (i + 1))}
              >
                <div className="text-3xl sm:text-4xl mb-4 sm:mb-5">{card.emoji}</div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">{card.title}</h3>
                <h3 className="text-lg sm:text-xl font-semibold text-[#FB923C]/60 mb-3 sm:mb-4">{card.subtitle}</h3>
                <p className="text-orange-100/40 leading-relaxed text-sm sm:text-base">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" data-animate className="py-20 sm:py-32 px-4 sm:px-6 relative overflow-hidden">
        {/* Aurora accent */}
        <div className="aurora absolute inset-0 opacity-20" />

        <div className="max-w-5xl mx-auto relative z-10">
          <div
            className={`text-center mb-12 sm:mb-20 ${fadeUp(visibleSections.has('solution'))}`}
            style={getDelayStyle(0)}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white mb-4 leading-tight">
              One dashboard.<br />
              <span className="text-gray-500">Complete control.</span>
            </h2>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-3xl mx-auto">
            {[
              { value: '2 min', label: 'reconciliation' },
              { value: '₹0', label: 'variance target' },
              { value: '100%', label: 'accountability' },
            ].map((stat, i) => (
              <div
                key={i}
                className={`text-center ${fadeUp(visibleSections.has('solution'))}`}
                style={getDelayStyle(100 * (i + 1))}
              >
                <div className="text-3xl sm:text-5xl md:text-6xl font-mono font-semibold text-white mb-1 sm:mb-2 tabular-nums">{stat.value}</div>
                <div className="text-gray-500 text-xs sm:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" data-animate className="py-20 sm:py-32 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {[
              { icon: DollarSign, color: '#F97316', title: 'Cash Session Tracking', desc: 'Open and close cash drawers with a tap. Track opening balance, sales, and closing balance. Every rupee accounted for.' },
              { icon: TrendingUp, color: '#FB923C', title: 'Payment Reconciliation', desc: 'UPI, cards, cash - all in one place. Match your POS totals with actual collections. Spot discrepancies instantly.' },
              { icon: Users, color: '#EA580C', title: 'Team Management', desc: 'SMS OTP login for your staff. No passwords to forget. Role-based access keeps sensitive data secure.' },
              { icon: BarChart3, color: '#FDBA74', title: 'Daily Reports', desc: 'The numbers your accountant needs. Shift-wise breakdowns. Expense categories. Export with one click.' },
            ].map((feature, i) => {
              const Icon = feature.icon

              return (
                <div
                  key={i}
                  className={`p-6 sm:p-8 rounded-xl sm:rounded-2xl bg-[#050510]/60 border border-[#F97316]/10 hover:bg-[#0a0a1a]/80 hover:border-[#F97316]/20 transition-all duration-300 group backdrop-blur-sm ${fadeUp(visibleSections.has('features'))}`}
                  style={getDelayStyle(80 * i)}
                >
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-6 transition-all duration-300"
                    style={{
                      backgroundColor: `${feature.color}15`,
                      color: feature.color
                    }}
                  >
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">{feature.title}</h3>
                  <p className="text-orange-100/50 leading-relaxed text-sm sm:text-base">{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Early Access Section */}
      <section id="early-access" data-animate className="py-20 sm:py-32 px-4 sm:px-6 relative overflow-hidden">
        {/* Aurora accent */}
        <div className="aurora absolute inset-0 opacity-20" />

        <div className="max-w-4xl mx-auto relative z-10">
          <div
            className={`text-center mb-10 sm:mb-14 ${fadeUp(visibleSections.has('early-access'))}`}
            style={getDelayStyle(0)}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm mb-6">
              <Clock className="w-4 h-4" />
              <span>Built for Indian Restaurants</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white mb-4 leading-tight">
              Start free today.<br />
              <span className="text-gray-500">No credit card needed.</span>
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
              Join restaurant owners who are taking control of their daily operations.
            </p>
          </div>

          {/* Benefits Grid */}
          <div
            className={`grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-10 ${fadeUp(visibleSections.has('early-access'))}`}
            style={getDelayStyle(100)}
          >
            {[
              { value: 'Free', label: 'to start' },
              { value: '30s', label: 'SMS signup' },
              { value: '₹', label: 'every rupee tracked' },
              { value: '24/7', label: 'mobile access' },
            ].map((item, i) => (
              <div key={i} className="text-center p-4 sm:p-6 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div className="text-2xl sm:text-3xl font-mono font-semibold text-white mb-1">{item.value}</div>
                <div className="text-gray-500 text-xs sm:text-sm">{item.label}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div
            className={`text-center ${fadeUp(visibleSections.has('early-access'))}`}
            style={getDelayStyle(200)}
          >
            <Link
              href="/auth/phone"
              className="bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white hover:from-[#FB923C] hover:to-[#F97316] active:scale-[0.98] text-sm sm:text-base px-6 sm:px-8 py-5 sm:py-6 h-auto transition-all duration-200 shadow-lg shadow-[#F97316]/30 border-0 group inline-flex items-center rounded-xl font-medium"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            <p className="mt-4 text-sm text-gray-500">
              Mobile-first · Works on any smartphone
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section id="proof" data-animate className="py-20 sm:py-32 px-4 sm:px-6">
        <div
          className={`max-w-3xl mx-auto text-center ${fadeUp(visibleSections.has('proof'))}`}
          style={getDelayStyle(0)}
        >
          <div className="text-2xl sm:text-3xl md:text-4xl font-medium text-white mb-6 sm:mb-8 leading-relaxed px-2">
            &ldquo;Finally, I know exactly where every rupee goes. Cash variances dropped to zero.&rdquo;
          </div>
          <div className="text-gray-500 text-sm sm:text-base">
            <span className="text-gray-400">Restaurant Owner</span>
            <br />
            Delhi NCR
          </div>

          {/* Feature highlights */}
          <div
            className={`flex items-center justify-center gap-6 sm:gap-12 mt-10 sm:mt-16 flex-wrap ${fadeUp(visibleSections.has('proof'))}`}
            style={getDelayStyle(200)}
          >
            {[
              'SMS Login',
              'Real-time Tracking',
              'Mobile-First',
              'Secure',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-400 text-sm">
                <Check className="w-4 h-4 text-orange-400" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="cta" data-animate className="py-20 sm:py-32 px-4 sm:px-6 relative">
        <div
          className={`max-w-2xl mx-auto transform transition-all duration-700 ${visibleSections.has('cta') ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.97]'}`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <div className="gradient-border p-8 sm:p-12 overflow-hidden relative rounded-2xl">
            {/* Inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-amber-600/5 pointer-events-none" />

            {/* Animated aurora effect */}
            <div className="aurora opacity-50" />

            <div className="text-center relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white mb-3 sm:mb-4 leading-tight">
                Take control of your<br className="hidden sm:block" /><span className="sm:hidden"> </span>restaurant&apos;s cash flow.
              </h2>
              <p className="text-orange-200/60 mb-6 sm:mb-8 text-sm sm:text-base">
                No spreadsheets. No guesswork. Just clarity.
              </p>
              <Link
                href="/auth/phone"
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-400 hover:to-orange-500 active:scale-[0.98] text-sm sm:text-base px-6 sm:px-8 py-5 sm:py-6 h-auto transition-all duration-200 shadow-lg shadow-orange-500/25 border-0 inline-flex items-center rounded-xl font-medium"
              >
                Start Free Today <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 sm:py-20 px-4 sm:px-6 border-t border-white/[0.08] bg-gradient-to-b from-[#050510] to-[#030308]">
        {/* Subtle glow effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-orange-500/[0.03] rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-amber-500/[0.02] rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Main Footer Content */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10 lg:gap-8 mb-10">
            {/* Brand Section */}
            <div className="flex flex-col gap-4 max-w-sm">
              <div className="flex items-center gap-3">
                <Image src="/logo.svg" alt="Restaurant Daily" width={32} height={32} className="drop-shadow-lg" />
                <span className="text-white font-semibold text-xl tracking-tight">Restaurant Daily</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Mobile-first daily operations management for Indian restaurants. Track cash, manage expenses, and run your business with clarity.
              </p>
            </div>

            {/* Links Section */}
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-10">
              {/* Legal Links */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Legal</span>
                <div className="flex flex-col gap-2.5">
                  <Link href="/privacy" className="text-gray-400 hover:text-orange-400 transition-colors duration-200 text-sm">
                    Privacy Policy
                  </Link>
                  <Link href="/terms" className="text-gray-400 hover:text-orange-400 transition-colors duration-200 text-sm">
                    Terms of Service
                  </Link>
                </div>
              </div>

              {/* Connect Links */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Connect</span>
                <div className="flex flex-col gap-2.5">
                  <a href="mailto:hello@mindweave.tech" className="text-gray-400 hover:text-orange-400 transition-colors duration-200 text-sm">
                    Contact Us
                  </a>
                  <a href="https://mindweave.tech" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-400 transition-colors duration-200 text-sm">
                    Mindweave.tech
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Divider with gradient */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

          {/* Bottom Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span>© {new Date().getFullYear()} Restaurant Daily.</span>
              <span className="hidden sm:inline">All rights reserved.</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Crafted with</span>
              <span className="text-red-400 animate-pulse">♥</span>
              <span>by</span>
              <a
                href="https://mindweave.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-400 hover:text-orange-300 transition-colors duration-200 font-medium"
              >
                Mindweave Technologies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
