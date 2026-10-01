import { LandingHeader } from "@/components/landing/header"
import { LandingHero } from "@/components/landing/hero"
import { LandingPillars } from "@/components/landing/pillars"
import { LandingMultiTenancy } from "@/components/landing/multi-tenancy"
import { LandingBenefits } from "@/components/landing/benefits"
import { LandingPricing } from "@/components/landing/pricing"
import { LandingTestimonial } from "@/components/landing/testimonial"
import { LandingCTA } from "@/components/landing/cta"
import { LandingFooter } from "@/components/landing/footer"
import { LandingAuthRedirect } from "@/components/landing/landing-auth-redirect"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function LandingPage() {
  // Server-side authentication check:
  // If user is already logged in, redirect directly to their dashboard
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      redirect('/dashboard')
    }
  } catch (error) {
    // If redirect throws NEXT_REDIRECT, rethrow
    if (error && typeof error === 'object' && 'digest' in error && String((error as any).digest).startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    // Otherwise allow landing page to render
  }

  return (
    <div className="flex min-h-screen flex-col font-sans selection:bg-secondary/30">
      <LandingAuthRedirect />
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <LandingPillars />
        <LandingMultiTenancy />
        <LandingPricing />
        <LandingBenefits />
        <LandingTestimonial />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  )
}
