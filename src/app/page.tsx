import { LandingHeader } from "@/components/landing/header"
import { LandingHero } from "@/components/landing/hero"
import { LandingPillars } from "@/components/landing/pillars"
import { LandingMultiTenancy } from "@/components/landing/multi-tenancy"
import { LandingBenefits } from "@/components/landing/benefits"
import { LandingPricing } from "@/components/landing/pricing"
import { LandingTestimonial } from "@/components/landing/testimonial"
import { LandingCTA } from "@/components/landing/cta"
import { LandingFooter } from "@/components/landing/footer"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col font-sans selection:bg-secondary/30">
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
