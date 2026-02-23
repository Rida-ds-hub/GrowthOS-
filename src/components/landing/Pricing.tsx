"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { useRouter } from "next/navigation"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with your career gap analysis",
    features: [
      "One-time gap analysis",
      "5-domain assessment",
      "90-day action plan",
      "Results via email",
      "No account required",
    ],
    cta: "Run free analysis",
    highlight: false,
  },
  {
    name: "Growth",
    price: "$29",
    period: "month",
    description: "Track your progress and unlock advanced features",
    features: [
      "Everything in Free",
      "Unlimited gap analyses",
      "Progress tracking dashboard",
      "Daily design drills",
      "Impact bank",
      "Promotion readiness score",
      "LinkedIn post generator",
      "Resume impact bullets",
      "Priority support",
    ],
    cta: "Start your journey",
    highlight: true,
  },
]

export function Pricing() {
  const router = useRouter()

  const handleCTA = (planName: string) => {
    if (planName === "Free") {
      router.push("/onboarding")
    } else {
      router.push("/onboarding")
    }
  }

  return (
    <section id="pricing" className="py-24 px-4 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Start free. Upgrade when you're ready to accelerate your growth.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`
                relative rounded-2xl border p-8
                ${
                  plan.highlight
                    ? "border-emerald-500 bg-zinc-900/50 shadow-lg shadow-emerald-500/10"
                    : "border-zinc-800 bg-zinc-950/50"
                }
              `}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-emerald-500 text-black text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  {plan.period !== "forever" && (
                    <span className="text-zinc-400">/{plan.period}</span>
                  )}
                </div>
                <p className="text-zinc-400 text-sm">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-zinc-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleCTA(plan.name)}
                className={`
                  w-full
                  ${
                    plan.highlight
                      ? "bg-emerald-500 text-black hover:bg-emerald-400"
                      : "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700"
                  }
                  font-semibold
                `}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center text-zinc-500 text-sm mt-12"
        >
          All plans include access to our core gap analysis engine. No credit card required for free tier.
        </motion.p>
      </div>
    </section>
  )
}
