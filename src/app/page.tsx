import { LandingHeader } from "@/components/landing/LandingHeader"
import { Hero } from "@/components/landing/Hero"
import { Philosophy } from "@/components/landing/Philosophy"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { Pricing } from "@/components/landing/Pricing"
import { WhatItIsNot } from "@/components/landing/WhatItIsNot"
import { CTA } from "@/components/landing/CTA"
import { Footer } from "@/components/landing/Footer"
import { Scroll3DModel } from "@/components/landing/Scroll3DModel"

export default function Home() {
  return (
    <main className="min-h-screen relative bg-[#0a0a0a] overflow-hidden">
      <Scroll3DModel />
      <LandingHeader />
      <Hero />
      <div id="features">
        <Philosophy />
      </div>
      <div id="how-it-works">
        <HowItWorks />
      </div>
      <div id="pricing">
        <Pricing />
      </div>
      <WhatItIsNot />
      <div id="resources">
        <CTA />
      </div>
      <Footer />
    </main>
  )
}
