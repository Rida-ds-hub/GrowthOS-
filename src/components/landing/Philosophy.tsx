"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Target, Code, Radio, Brain } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const features = [
  {
    principle: "Plan or Fail",
    title: "Gap Analysis & Custom Plan",
    description: "AI-powered analysis of your current skills versus target role requirements. Get a 90-day structured progression plan tailored to your career goals with daily execution tasks.",
    icon: Target,
    available: true,
  },
  {
    principle: "Human Thinks. AI Executes.",
    title: "Tech Commits & System Design",
    description: "Make tech commits directly from the app. Learn system design tradeoffs and code based on your gap analysis. Track LeetCode progress and skill development metrics.",
    icon: Code,
    available: true,
  },
  {
    principle: "Depth Without Visibility Is Invisible",
    title: "LinkedIn Network & Impact Tracking",
    description: "Connect LinkedIn for network audit. Post project and work updates from the app. Add project impact to your resume. Calendar integration tracks meetings and surveys you for impact delivered. Your career second brain.",
    icon: Radio,
    available: false,
  },
]

export function Philosophy() {
  const cardRefs = [React.useRef<HTMLDivElement>(null), React.useRef<HTMLDivElement>(null), React.useRef<HTMLDivElement>(null)]

  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Features Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35 }}
          className="text-center mb-4"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Features
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Your career second brain. Currently offering Plan and Upskill. Brand features coming soon.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                ref={cardRefs[index]}
                data-feature-card
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.1 }}
              >
                <Card className={`p-6 h-full border transition-colors ${
                  feature.available 
                    ? "bg-zinc-900/50 border-zinc-800 hover:border-emerald-500/50" 
                    : "bg-zinc-900/30 border-zinc-800/50 opacity-75"
                }`}>
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-3 rounded-lg flex-shrink-0 ${
                        feature.available 
                          ? "bg-emerald-500/10 border border-emerald-500/20" 
                          : "bg-zinc-800/50 border border-zinc-700/50"
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          feature.available ? "text-emerald-400" : "text-zinc-500"
                        }`} />
                      </div>
                      {!feature.available && (
                        <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                    <h3 className={`text-lg font-semibold mb-2 ${
                      feature.available ? "text-emerald-400" : "text-zinc-500"
                    }`}>
                      {feature.principle}
                    </h3>
                    <h4 className={`text-xl font-semibold mb-3 ${
                      feature.available ? "text-white" : "text-zinc-400"
                    }`}>
                      {feature.title}
                    </h4>
                  </div>
                  <p className={`leading-relaxed text-sm ${
                    feature.available ? "text-zinc-300" : "text-zinc-500"
                  }`}>
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
