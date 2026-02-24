"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"

const plans = [
  {
    badge: "// free forever",
    name: "Explorer",
    price: "$0",
    period: " / forever",
    description:
      "Full gap analysis. Personalized plan. No sign-up required.",
    features: [
      "Gap analysis across 5 domains",
      "Readiness score + domain breakdowns",
      "Personalized 90-day action plan",
      "Upskilling project recommendations",
      "Posting strategy + promotion narrative",
      "Downloadable results report",
    ],
    cta: "Start Free",
    ctaType: "outline",
  },
  {
    badge: "// coming soon",
    name: "Operator",
    price: "$29",
    period: " / month",
    description: "The full operating system. Daily actions, living resume, and your jump signal.",
    features: [
      "Everything in Explorer",
      "Unlimited gap analysis re-runs",
      "Daily Design Drill (micro-learning + code)",
      "Living Resume (auto-updates from work)",
      "Impact Bank (real outcome capture)",
      "Meeting Second Brain + Calendar Sync",
      "LinkedIn Post Generator (weekly drafts)",
      "Jump Signal readiness tracker",
    ],
    cta: "Join Waitlist",
    ctaType: "solid",
    featured: true,
  },
  {
    badge: "// enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "",
    description:
      "For engineering orgs that want structured progression at scale. Tailored onboarding, team dashboards, and dedicated support.",
    features: [],
    cta: "Let\u2019s Talk",
    ctaType: "outline",
  },
]

export function Pricing() {
  const router = useRouter()

  const handleCTA = (cta: string) => {
    if (cta === "Start Free" || cta === "Get Early Access") {
      router.push("/onboarding")
    }
  }

  return (
    <section
      id="pricing"
      className="relative z-10 bg-zinc-900 border-t border-zinc-800 py-28 px-12"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-4 h-px bg-emerald-500" />
          <span className="text-[0.62rem] tracking-[0.4em] uppercase text-emerald-500">
            Pricing
          </span>
        </div>
        <h2 className="font-['JetBrains_Mono'] text-3xl md:text-4xl font-bold text-white leading-tight mb-4 tracking-tight">
          Simple pricing.
          <br />
          <span className="text-emerald-500">No surprises.</span>
        </h2>
        <p className="text-sm leading-relaxed text-zinc-400 font-light max-w-[520px] mb-12">
          Run a full gap analysis today at zero cost. Upgrade when the daily engine launches.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-800 border border-zinc-800">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className={`bg-[#0a0a0a] p-10 relative ${
                plan.featured ? "bg-zinc-900 border-t-2 border-emerald-500" : ""
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <span className="text-[0.6rem] tracking-[0.3em] uppercase text-emerald-500 mb-5 block">
                {plan.badge}
              </span>
              <div className="font-['var(--font-jetbrains-mono)'] text-base font-bold text-white mb-3">
                {plan.name}
              </div>
              <div className="font-['var(--font-jetbrains-mono)'] text-3xl font-bold text-white leading-none my-4">
                {plan.price}
                <span className="text-sm font-light text-zinc-500">
                  {plan.period}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-zinc-500 mb-6">
                {plan.description}
              </p>
              {plan.features.length > 0 && (
                <ul className="list-none mb-8 space-y-1">
                  {plan.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-zinc-400 flex items-center gap-2.5 py-1 border-b border-zinc-800 leading-snug"
                    >
                      <span className="text-emerald-500 text-[0.65rem] opacity-70 flex-shrink-0">
                        {"//"}
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              )}
              {plan.features.length === 0 && <div className="flex-1" />}
              <Link
                href={plan.cta === "Let\u2019s Talk" ? "mailto:hello@growthos.dev" : "/onboarding"}
                onClick={(e) => {
                  if (plan.cta !== "Let\u2019s Talk") {
                    e.preventDefault()
                    handleCTA(plan.cta)
                  }
                }}
                className={`block text-center font-['var(--font-jetbrains-mono)'] text-xs tracking-wider uppercase font-bold py-3 px-4 transition-all ${
                  plan.ctaType === "solid"
                    ? "bg-emerald-500 text-black hover:opacity-82"
                    : "border border-zinc-800 text-zinc-500 hover:border-emerald-500/30 hover:text-emerald-500"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
