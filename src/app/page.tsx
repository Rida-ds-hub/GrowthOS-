import { LandingHeader } from "@/components/landing/LandingHeader"
import { Hero } from "@/components/landing/Hero"
import { Philosophy } from "@/components/landing/Philosophy"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { WhatItIsNot } from "@/components/landing/WhatItIsNot"
import { CTA } from "@/components/landing/CTA"
import { Footer } from "@/components/landing/Footer"

export default function Home() {
  return (
    <main className="min-h-screen relative">
      <LandingHeader />
      <Hero />
      <div id="features">
        <Philosophy />
      </div>
      <div id="how-it-works">
        <HowItWorks />
      </div>
      <WhatItIsNot />
      <div id="resources">
        <CTA />
      </div>
      <Footer />
    </main>
  )
}
